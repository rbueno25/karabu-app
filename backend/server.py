"""Karabu Viajes API — FastAPI + SQLAlchemy async + PostgreSQL.
v2 — Render deploy
"""
from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os, uuid, logging, json, threading, urllib.request, urllib.parse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import bcrypt, jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status
from starlette.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import select, func, and_, or_, text, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import Base, engine, get_db, init_db, AsyncSessionLocal
from models import User, Client, Quotation, Reservation, Payment, Destination, Package, Setting, Pais, Ciudad, Lugar, Notification, Upload, Dossier
import re

# -------------------- Sanitizer --------------------
_HTML_TAG = re.compile(r"<[^>]*>", re.IGNORECASE)
_SCRIPT_TAG = re.compile(r"<\s*script[^>]*>.*?<\s*/\s*script[^>]*>", re.IGNORECASE | re.DOTALL)
_IFRAME_TAG = re.compile(r"<\s*iframe[^>]*>.*?<\s*/\s*iframe[^>]*>", re.IGNORECASE | re.DOTALL)
_STYLE_TAG = re.compile(r"<\s*style[^>]*>.*?<\s*/\s*style[^>]*>", re.IGNORECASE | re.DOTALL)

def sanitize_html(text: str) -> str:
    """Strip HTML tags and dangerous elements from text to prevent XSS."""
    if not text or not isinstance(text, str):
        return text or ""
    text = _SCRIPT_TAG.sub("", text)
    text = _IFRAME_TAG.sub("", text)
    text = _STYLE_TAG.sub("", text)
    return _HTML_TAG.sub("", text).strip()

# -------------------- Setup --------------------
app = FastAPI(title="Karabu Viajes API")
api = APIRouter(prefix="/api")

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"
GEOAPIFY_KEY = os.environ.get("GEOAPIFY_KEY", "")
SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("karabu")


# -------------------- Rate Limiter --------------------
from collections import defaultdict
import time as _time

class RateLimiter:
    """Simple in-memory IP-based rate limiter."""
    def __init__(self):
        self._hits = defaultdict(list)  # ip → [timestamps]
        self._cleanup_every = 300  # clean old entries every 5 min
        self._last_cleanup = _time.time()

    def _cleanup(self):
        now = _time.time()
        if now - self._last_cleanup < self._cleanup_every:
            return
        self._last_cleanup = now
        cutoff = now - 120  # keep last 2 min of history
        for ip in list(self._hits.keys()):
            self._hits[ip] = [t for t in self._hits[ip] if t > cutoff]
            if not self._hits[ip]:
                del self._hits[ip]

    def check(self, ip: str, max_requests: int, window_seconds: int) -> bool:
        """Returns True if under limit, False if rate limited."""
        self._cleanup()
        now = _time.time()
        cutoff = now - window_seconds
        self._hits[ip] = [t for t in self._hits[ip] if t > cutoff]
        self._hits[ip].append(now)
        return len(self._hits[ip]) <= max_requests

rate_limiter = RateLimiter()


def rate_limit(requests: int, per_seconds: int):
    """Dependency: rate-limit by client IP."""
    async def _check(request: Request):
        ip = request.client.host if request.client else "127.0.0.1"
        if not rate_limiter.check(ip, requests, per_seconds):
            raise HTTPException(status_code=429, detail="Demasiadas solicitudes. Espera un momento.")
    return _check


# -------------------- Auth utils --------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        h = request.headers.get("Authorization", "")
        if h.startswith("Bearer "):
            token = h[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        result = await db.execute(select(User).where(User.id == payload["sub"]))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user.to_dict()
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesión expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def get_optional_user(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        return await get_current_user(request, db)
    except HTTPException:
        return None

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def new_id() -> str:
    return str(uuid.uuid4())

async def create_notification(db: AsyncSession, user_id: str, type_: str, title: str, message: str = "", link: str = ""):
    """Create a notification for a specific user."""
    notif = Notification(
        id=new_id(),
        user_id=user_id,
        type=type_,
        title=title,
        message=message,
        link=link,
    )
    db.add(notif)
    logger.info(f"Notification [{type_}] → user {user_id}: {title}")

async def create_notification_all(db: AsyncSession, type_: str, title: str, message: str = "", link: str = ""):
    """Create a notification for ALL active users (admins + advisors)."""
    result = await db.execute(
        select(User).where(User.status == "activo", User.role.in_(["super_admin", "admin", "advisor"]))
    )
    users = result.scalars().all()
    for u in users:
        await create_notification(db, u.id, type_, title, message, link)

async def _generate_code(db: AsyncSession, prefix: str) -> str:
    """Generate sequential code: EXP-2026-00001, COT-2026-00001, etc."""
    year = str(datetime.now(timezone.utc).year)
    if prefix == "COT":
        result = await db.execute(
            text(f"SELECT COUNT(*) FROM quotations WHERE code LIKE 'COT-{year}-%'")
        )
    elif prefix == "RES":
        result = await db.execute(
            text(f"SELECT COUNT(*) FROM reservations WHERE code LIKE 'RES-{year}-%'")
        )
    else:  # EXP
        result = await db.execute(
            text(f"SELECT COUNT(*) FROM dossiers WHERE code LIKE 'EXP-{year}-%'")
        )
    count = (result.scalar() or 0) + 1
    return f"{prefix}-{year}-{count:05d}"

async def get_destination_image(db: AsyncSession, destination_name: str) -> str:
    """Look up hero image from destinations table matching destination name."""
    if not destination_name:
        return ""
    # Try exact match on name
    result = await db.execute(
        select(Destination).where(Destination.name.ilike(destination_name), Destination.status == "activo")
    )
    d = result.scalar_one_or_none()
    if d and d.image_url:
        return d.image_url
    # Try partial match (destination name or country contains query or vice versa)
    result = await db.execute(
        select(Destination).where(
            or_(
                Destination.name.ilike(f"%{destination_name}%"),
                Destination.country.ilike(f"%{destination_name}%"),
            ),
            Destination.status == "activo",
        )
    )
    d = result.scalar_one_or_none()
    if d and d.image_url:
        return d.image_url
    # If destination_name is "Country, City", try matching just the city
    parts = [p.strip() for p in destination_name.split(",") if p.strip()]
    if len(parts) > 1:
        result = await db.execute(
            select(Destination).where(
                or_(
                    Destination.name.ilike(f"%{parts[1]}%"),
                    Destination.name.ilike(f"%{parts[0]}%"),
                ),
                Destination.status == "activo",
            )
        )
        d = result.scalar_one_or_none()
        if d and d.image_url:
            return d.image_url
    return ""

def require_admin(user: dict):
    if user.get("role") not in ("super_admin", "admin"):
        raise HTTPException(status_code=403, detail="No tienes permiso")


# -------------------- Pydantic Models --------------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ClientIn(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    document_id: Optional[str] = ""
    address: Optional[str] = ""
    notes: Optional[str] = ""
    status: str = "activo"

class QuotationIn(BaseModel):
    client_id: str
    destination: str
    travel_date: Optional[str] = ""
    return_date: Optional[str] = ""
    travelers: int = 1
    amount: float = 0
    currency: str = "USD"
    notes: Optional[str] = ""
    assigned_hotel: Optional[str] = ""
    room_type: Optional[str] = ""
    services: Optional[list] = []
    deposit_percent: Optional[float] = 0
    hero_image: Optional[str] = ""
    gallery_images: Optional[list] = []
    dossier_id: Optional[str] = None
    code: Optional[str] = ""
    tax_percent: Optional[float] = 0
    booking_price: Optional[float] = None
    expedia_price: Optional[float] = None
    status: str = "borrador"
    sent_via: Optional[str] = ""
    sent_at: Optional[str] = ""
    form_data: Optional[dict] = None  # raw form submission data

class DossierIn(BaseModel):
    client_id: str
    status: str = "abierto"

class LeadIn(BaseModel):
    """Public landing page form submission — no auth required."""
    fullName: str
    email: str
    phone: str
    country: str
    city: str = ""
    preferredHotel: str = ""
    departureDate: str = ""
    returnDate: str = ""
    flexibleDates: str = "No"
    adultsCount: int = 1
    childrenCount: int = 0
    babiesCount: int = 0
    budgetRange: str = ""
    additionalServices: list = []
    travelType: str = ""
    hotelCategory: str = ""
    roomsSingle: int = 1
    roomsDouble: int = 0
    roomsTriple: int = 0
    preferredContact: str = "ambos"
    comments: str = ""

class PassengerIn(BaseModel):
    name: str
    document_id: Optional[str] = ""
    birth_date: Optional[str] = ""

class DocumentIn(BaseModel):
    name: str
    url: str
    uploaded_at: Optional[str] = ""

class ReservationIn(BaseModel):
    client_id: str
    quotation_id: Optional[str] = None
    destination: str
    departure_date: str
    return_date: str
    travelers: int = 1
    services: Optional[str] = ""
    notes: Optional[str] = ""
    total_amount: float = 0
    currency: str = "USD"
    status: str = "pendiente"
    passengers: Optional[List[PassengerIn]] = []
    documents: Optional[List[DocumentIn]] = []

class PaymentIn(BaseModel):
    reservation_id: str
    amount: float
    method: str
    reference: Optional[str] = ""
    payment_date: Optional[str] = ""
    status: str = "completado"
    notes: Optional[str] = ""

class DestinationIn(BaseModel):
    name: str
    country: str
    image_url: Optional[str] = ""
    description: Optional[str] = ""
    status: str = "activo"

class PackageIn(BaseModel):
    name: str
    destination: str
    price: float
    currency: str = "USD"
    duration_days: int = 1
    description: Optional[str] = ""
    status: str = "activo"

class UserIn(BaseModel):
    username: Optional[str] = None
    name: str
    email: EmailStr
    role: str = "advisor"
    status: str = "activo"
    phone: Optional[str] = ""
    avatar_url: Optional[str] = ""
    department: Optional[str] = ""
    notes: Optional[str] = ""
    password: Optional[str] = None

class SettingsIn(BaseModel):
    company_name: str = "Karabu Viajes"
    company_email: str = ""
    company_phone: str = ""
    company_address: str = ""
    logo_url: str = ""
    social_facebook: str = ""
    social_instagram: str = ""
    social_twitter: str = ""
    social_whatsapp: str = ""
    default_currency: str = "USD"
    tax_percent: float = 0
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_from: str = ""
    smtp_password: str = ""
    template_quotation: str = ""
    template_reservation: str = ""
    session_hours: int = 12
    require_2fa: bool = False


# -------------------- Auth Endpoints --------------------
@api.post("/auth/login")
async def login(body: LoginIn, response: Response, db: AsyncSession = Depends(get_db), _rl=Depends(rate_limit(10, 60))):
    email = body.email.lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    if user.status == "inactivo":
        raise HTTPException(status_code=403, detail="Tu cuenta está inactiva. Contacta al administrador.")
    token = create_access_token(user.id, user.email, user.role)
    user.last_login = datetime.now(timezone.utc)
    response.set_cookie(
        key="access_token", value=token, httponly=True,
        secure=True, samesite="strict", max_age=43200, path="/",
    )
    return {
        "user": {"id": user.id, "username": user.username, "email": user.email, "name": user.name, "role": user.role, "phone": user.phone, "avatar_url": user.avatar_url, "department": user.department},
        "token": token,
    }

@api.post("/auth/logout")
async def logout(response: Response, _user=Depends(get_current_user)):
    response.delete_cookie("access_token", path="/", secure=True, samesite="strict")
    return {"ok": True}


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


@api.put("/profile")
async def update_profile(body: ProfileUpdate, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    result = await db.execute(select(User).where(User.id == u["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if body.new_password:
        if not body.current_password or not verify_password(body.current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
        user.password_hash = hash_password(body.new_password)

    if body.name is not None:
        user.name = sanitize_html(body.name)
    if body.phone is not None:
        user.phone = body.phone
    if body.avatar_url is not None:
        user.avatar_url = body.avatar_url

    await db.flush()
    return user.to_dict()


@api.get("/auth/me")
async def me(user=Depends(get_optional_user)):
    if user is None:
        return None
    return {
        "id": user["id"], "username": user.get("username"),
        "email": user["email"], "name": user["name"],
        "role": user["role"], "phone": user.get("phone", ""),
        "avatar_url": user.get("avatar_url", ""),
        "department": user.get("department", ""),
    }


# -------------------- Clients --------------------
@api.get("/clients")
async def list_clients(
    q: Optional[str] = None,
    status_f: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _u=Depends(get_current_user),
):
    stmt = select(Client).where(Client.deleted_at.is_(None))
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(
            Client.first_name.ilike(pattern),
            Client.last_name.ilike(pattern),
            Client.email.ilike(pattern),
            Client.phone.ilike(pattern),
        ))
    if status_f:
        stmt = stmt.where(Client.status == status_f)
    stmt = stmt.order_by(Client.created_at.desc()).limit(500)
    result = await db.execute(stmt)
    return [c.to_dict() for c in result.scalars().all()]

@api.post("/clients")
async def create_client(body: ClientIn, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    client = Client(
        id=new_id(), first_name=body.first_name, last_name=body.last_name,
        email=body.email, phone=body.phone, document_id=body.document_id or "",
        address=body.address or "", notes=body.notes or "", status=body.status,
        created_by=u["id"],
    )
    db.add(client)
    await db.flush()
    nombre = f"{client.first_name} {client.last_name}".strip()
    await _send_mail(
        db, "",
        f"Nuevo cliente: {nombre}",
        f"<p>Se registró un nuevo cliente: <b>{nombre}</b>.</p>"
        f"<p>Email: {client.email or '—'}<br>Teléfono: {client.phone or '—'}</p>",
    )
    return client.to_dict()

@api.get("/clients/{client_id}")
async def get_client(client_id: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.deleted_at.is_(None))
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Load related data
    res_r = await db.execute(select(Reservation).where(Reservation.client_id == client_id))
    quot_r = await db.execute(select(Quotation).where(Quotation.client_id == client_id))
    pay_r = await db.execute(select(Payment).where(Payment.client_id == client_id))

    return {
        "client": client.to_dict(),
        "reservations": [r.to_dict() for r in res_r.scalars().all()],
        "quotations": [q.to_dict() for q in quot_r.scalars().all()],
        "payments": [p.to_dict() for p in pay_r.scalars().all()],
    }

@api.put("/clients/{client_id}")
async def update_client(client_id: str, body: ClientIn, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.deleted_at.is_(None))
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    for k, v in body.model_dump().items():
        setattr(client, k, v)
    return client.to_dict()

@api.delete("/clients/{client_id}")
async def delete_client(client_id: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Client).where(Client.id == client_id, Client.deleted_at.is_(None)))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    client.deleted_at = datetime.now(timezone.utc)
    return {"ok": True}


# -------------------- Quotations --------------------
async def _enrich_with_client(items: list, db: AsyncSession) -> list:
    if not items:
        return items
    ids = list({i.get("client_id") for i in items if i.get("client_id")})
    if not ids:
        return items
    result = await db.execute(select(Client).where(Client.id.in_(ids)))
    clients = {c.id: c for c in result.scalars().all()}
    for it in items:
        c = clients.get(it.get("client_id"))
        it["client_name"] = f"{c.first_name} {c.last_name}" if c else "—"
    return items

@api.get("/quotations")
async def list_quotations(
    status_f: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _u=Depends(get_current_user),
):
    stmt = select(Quotation).order_by(Quotation.created_at.desc()).limit(500)
    if status_f:
        stmt = stmt.where(Quotation.status == status_f)
    result = await db.execute(stmt)
    docs = [q.to_dict() for q in result.scalars().all()]
    return await _enrich_with_client(docs, db)

@api.get("/quotations/{qid}")
async def get_quotation(qid: str, db: AsyncSession = Depends(get_db), u=Depends(get_optional_user)):
    result = await db.execute(select(Quotation).where(Quotation.id == qid))
    q = result.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    doc = q.to_dict()
    client_r = await db.execute(select(Client).where(Client.id == q.client_id))
    client = client_r.scalar_one_or_none()
    
    # Resolve broker: use created_by user, fall back to current user if authenticated
    broker = None
    if q.created_by:
        broker_r = await db.execute(select(User).where(User.id == q.created_by))
        broker = broker_r.scalar_one_or_none()
    if not broker and u:
        broker_r = await db.execute(select(User).where(User.id == u["id"]))
        broker = broker_r.scalar_one_or_none()
    
    # Format rooms summary from form_data
    form_data = doc.get("form_data") or {}
    rooms_parts = []
    if form_data.get("habitacionesSencilla"):
        rooms_parts.append(f"{form_data['habitacionesSencilla']} Sencilla")
    if form_data.get("habitacionesDoble"):
        rooms_parts.append(f"{form_data['habitacionesDoble']} Doble")
    if form_data.get("habitacionesTriple"):
        rooms_parts.append(f"{form_data['habitacionesTriple']} Triple")
    rooms_summary = ", ".join(rooms_parts) if rooms_parts else ""
    
    return {
        "quotation": doc,
        "client": client.to_dict() if client else None,
        "broker": {
            **(broker.to_dict() if broker else {}),
            "name": broker.name if broker else "Asesor Karabu",
            "email": broker.email if broker else "",
            "phone": broker.phone if broker else "",
            "avatar_url": broker.avatar_url if broker else "",
            "role": broker.role if broker else "advisor",
            "department": broker.department if broker else "",
            "agency_name": (broker.department if broker and broker.department else "Karabu Viajes"),
        },
        "rooms_summary": rooms_summary,
    }

@api.post("/quotations")
async def create_quotation(body: QuotationIn, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    # Sanitize text inputs
    body.notes = sanitize_html(body.notes or "")
    body.destination = sanitize_html(body.destination)
    body.assigned_hotel = sanitize_html(body.assigned_hotel or "")
    body.room_type = sanitize_html(body.room_type or "")

    # Auto-populate hero_image from destination if empty
    hero = body.hero_image or ""
    if not hero:
        hero = await get_destination_image(db, body.destination)

    # Auto-create dossier if not provided
    dossier_id = body.dossier_id
    if not dossier_id:
        dossier_code = await _generate_code(db, "EXP")
        dossier = Dossier(
            id=new_id(), code=dossier_code,
            client_id=body.client_id, status="abierto",
            created_by=u["id"],
        )
        db.add(dossier)
        await db.flush()
        dossier_id = dossier.id

    # Generate quotation code
    quote_code = body.code or await _generate_code(db, "COT")

    q = Quotation(
        id=new_id(), client_id=body.client_id, destination=body.destination,
        travel_date=body.travel_date or "", return_date=body.return_date or "",
        travelers=body.travelers, amount=body.amount, currency=body.currency,
        notes=body.notes or "", status=body.status,
        sent_via=body.sent_via or "", sent_at=body.sent_at or "",
        created_by=u["id"],
        assigned_hotel=body.assigned_hotel or "",
        room_type=body.room_type or "",
        services=body.services or [],
        deposit_percent=body.deposit_percent or 0,
        hero_image=hero,
        dossier_id=dossier_id,
        code=quote_code,
        tax_percent=body.tax_percent if body.tax_percent is not None else 0,
        booking_price=body.booking_price,
        expedia_price=body.expedia_price,
    )
    db.add(q)
    await db.flush()
    client_r = await db.execute(select(Client).where(Client.id == q.client_id))
    client = client_r.scalar_one_or_none()
    cname = f"{client.first_name} {client.last_name}".strip() if client else "Cliente"
    await _send_mail(
        db, "",
        f"Nueva cotización: {cname} — {q.destination}",
        f"<p>Nueva cotización creada para <b>{cname}</b>.</p>"
        f"<p>Destino: <b>{q.destination}</b><br>Monto: ${q.amount:,.2f} {q.currency or ''}</p>",
    )
    return q.to_dict()

@api.put("/quotations/{qid}")
async def update_quotation(qid: str, body: QuotationIn, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Quotation).where(Quotation.id == qid))
    q = result.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    for k, v in body.model_dump().items():
        if v is None:
            continue
        # Protect auto-generated fields from being overwritten with empty values
        if k in ("code", "dossier_id") and not v:
            continue
        if isinstance(v, str):
            v = sanitize_html(v)
        setattr(q, k, v)
    # Auto-populate hero_image from destination if still empty after update
    if not q.hero_image:
        q.hero_image = await get_destination_image(db, q.destination)
    return q.to_dict()


class ClientStatusUpdate(BaseModel):
    """Public endpoint: client accepts/rejects a quotation (no auth)."""
    status: str  # "aceptada" or "rechazada"
    notes: Optional[str] = None


@api.patch("/quotations/{qid}/status")
async def client_update_status(qid: str, body: ClientStatusUpdate, db: AsyncSession = Depends(get_db), _rl=Depends(rate_limit(10, 60))):
    """Public: client accepts or rejects their quotation."""
    if body.status not in ("aceptada", "rechazada", "cambios_solicitados"):
        raise HTTPException(status_code=400, detail="Estado invalido")
    result = await db.execute(select(Quotation).where(Quotation.id == qid))
    q = result.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")

    old_status = q.status
    is_regret = old_status == "aceptada" and body.status == "rechazada"

    q.status = body.status
    # Save client notes in dedicated field, sanitized
    if body.notes is not None and body.notes.strip():
        q.client_notes = sanitize_html(body.notes.strip())

    # Get client name for notification
    client_r = await db.execute(select(Client).where(Client.id == q.client_id))
    client = client_r.scalar_one_or_none()
    client_name = f"{client.first_name} {client.last_name}" if client else "Cliente"

    # Notify ALL active users (admins + advisors) about client actions
    if body.status == "aceptada":
        await create_notification_all(
            db, "accepted",
            title=f"{client_name} aceptó la propuesta",
            message=f"Cotización para {q.destination} fue aceptada",
            link=f"/admin/cotizaciones/{q.id}",
        )
        await _notify_staff(
            db,
            f"{client_name} aceptó la propuesta — {q.destination}",
            f"<p><b>{client_name}</b> aceptó la cotización para <b>{q.destination}</b>.</p>"
            f"<p>Monto: ${q.amount:,.2f} {q.currency or ''}</p>",
        )

        # Auto-convert to reservation (solo si no existe ya una)
        existing_res = await db.execute(
            select(Reservation).where(Reservation.quotation_id == q.id)
        )
        if not existing_res.scalar_one_or_none():
            reservation = Reservation(
                id=new_id(), client_id=q.client_id, quotation_id=q.id,
                destination=q.destination,
                departure_date=q.travel_date or now_iso(),
                return_date=q.return_date or now_iso(),
                travelers=q.travelers, services="", notes=q.notes or "",
                total_amount=q.amount, currency=q.currency,
                status="pendiente", created_by=q.created_by,
            )
            db.add(reservation)
            await create_notification_all(
                db, "new_reservation",
                title=f"Nueva reserva: {client_name}",
                message=f"Reserva automática para {q.destination} por ${q.amount:,.2f}",
                link=f"/admin/reservas/{reservation.id}",
            )
    elif body.status == "cambios_solicitados":
        notes_preview = (body.notes or "")[:100]
        await create_notification_all(
            db, "changes_requested",
            title=f"{client_name} solicita cambios",
            message=f"Cotización para {q.destination}" + (f": {notes_preview}" if notes_preview else ""),
            link=f"/admin/cotizaciones/{q.id}",
        )
        await _notify_staff(
            db,
            f"{client_name} solicita cambios — {q.destination}",
            f"<p><b>{client_name}</b> solicitó cambios en la cotización para <b>{q.destination}</b>.</p>"
            + (f"<p>Comentarios: {notes_preview}</p>" if notes_preview else ""),
        )
    elif is_regret:
        await create_notification_all(
            db, "regret",
            title=f"{client_name} cambió de opinión",
            message=f"Había aceptado {q.destination} y ahora solicita cambios",
            link=f"/admin/cotizaciones/{q.id}",
        )
    elif body.status == "rechazada":
        notes_preview = (body.notes or "")[:100]
        await create_notification_all(
            db, "rejected",
            title=f"{client_name} rechazó la propuesta",
            message=f"Rechazó {q.destination}" + (f": {notes_preview}" if notes_preview else ""),
            link=f"/admin/cotizaciones/{q.id}",
        )

    return q.to_dict()


@api.post("/quotations/{qid}/send-email")
async def send_quotation_email(qid: str, body: dict = None, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    """Envía la cotización por correo al cliente (vía SMTP) y la marca como enviada."""
    result = await db.execute(select(Quotation).where(Quotation.id == qid))
    q = result.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    client_r = await db.execute(select(Client).where(Client.id == q.client_id))
    client = client_r.scalar_one_or_none()
    if not client or not client.email:
        raise HTTPException(status_code=400, detail="El cliente no tiene email registrado")

    link = (body or {}).get("link") or ""
    nombre = f"{client.first_name} {client.last_name}".strip() or "Cliente"
    destino = q.destination or "tu viaje"

    s_r = await db.execute(select(Setting).where(Setting.id == "global"))
    s = s_r.scalar_one_or_none()
    tpl = s.template_quotation if s else ""
    if tpl:
        html = tpl.replace("{cliente}", nombre).replace("{destino}", destino).replace("{link}", link)
    else:
        html = (
            f"<p>Hola {nombre},</p>"
            f"<p>Aquí tienes tu propuesta de viaje personalizada para <b>{destino}</b>.</p>"
            f"<p><a href=\"{link}\">Ver mi cotización</a></p>"
            f"<p>Saludos,<br>Karabu Viajes</p>"
        )

    ok, err = await _send_mail(db, client.email, f"Tu cotización de viaje — {destino}", html)
    if not ok:
        raise HTTPException(status_code=500, detail=f"No se pudo enviar el correo: {err}")

    q.status = "enviada"
    q.sent_via = "email"
    q.sent_at = now_iso()
    await db.flush()
    return q.to_dict()


@api.post("/quotations/{qid}/convert")
async def convert_quotation(qid: str, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    result = await db.execute(select(Quotation).where(Quotation.id == qid))
    q = result.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=404, detail="Cotización no encontrada")
    if q.status != "aceptada":
        raise HTTPException(status_code=400, detail="Solo cotizaciones aceptadas pueden convertirse en reserva")

    # Generate reservation code
    res_code = await _generate_code(db, "RES")

    reservation = Reservation(
        id=new_id(), client_id=q.client_id, quotation_id=q.id,
        destination=q.destination,
        departure_date=q.travel_date or now_iso(),
        return_date=q.return_date or now_iso(),
        travelers=q.travelers, services="", notes=q.notes or "",
        total_amount=q.amount, currency=q.currency,
        dossier_id=q.dossier_id,
        code=res_code,
        status="pendiente", created_by=u["id"],
    )
    db.add(reservation)
    await db.flush()

    # Update dossier status to "reservado"
    if q.dossier_id:
        d_result = await db.execute(select(Dossier).where(Dossier.id == q.dossier_id))
        dossier_obj = d_result.scalar_one_or_none()
        if dossier_obj:
            dossier_obj.status = "reservado"

    # Notify if converted by a different user than original creator
    if q.created_by and q.created_by != u["id"]:
        await create_notification(
            db, q.created_by, "converted",
            title=f"Tu cotización fue convertida en reserva",
            message=f"Cotización para {q.destination} ahora es reserva #{reservation.id[:8]}",
            link=f"/admin/reservas/{reservation.id}",
        )

    return reservation.to_dict()

@api.delete("/quotations/{qid}")
async def delete_quotation(qid: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Quotation).where(Quotation.id == qid))
    q = result.scalar_one_or_none()
    if q:
        await db.delete(q)
    return {"ok": True}


# -------------------- Dossiers (Expedientes) --------------------
@api.get("/dossiers")
async def list_dossiers(db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(
        select(Dossier).order_by(Dossier.created_at.desc()).limit(200)
    )
    dossiers = result.scalars().all()
    enriched = []
    for d in dossiers:
        # Get client name
        client_name = ""
        if d.client_id:
            c_result = await db.execute(select(Client).where(Client.id == d.client_id))
            client = c_result.scalar_one_or_none()
            if client:
                client_name = f"{client.first_name} {client.last_name}".strip()
        # Count quotations and reservations
        q_count = await db.execute(
            select(func.count(Quotation.id)).where(Quotation.dossier_id == d.id)
        )
        r_count = await db.execute(
            select(func.count(Reservation.id)).where(Reservation.dossier_id == d.id)
        )
        enriched.append({
            **d.to_dict(),
            "client_name": client_name or f"Cliente {d.client_id[:8]}" if d.client_id else "",
            "quotation_count": q_count.scalar() or 0,
            "reservation_count": r_count.scalar() or 0,
        })
    return enriched


@api.get("/dossiers/{did}")
async def get_dossier(did: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Dossier).where(Dossier.id == did))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    q_result = await db.execute(
        select(Quotation).where(Quotation.dossier_id == did).order_by(Quotation.created_at.desc())
    )
    r_result = await db.execute(
        select(Reservation).where(Reservation.dossier_id == did).order_by(Reservation.created_at.desc())
    )
    # Get client name
    client_name = ""
    if d.client_id:
        c_result = await db.execute(select(Client).where(Client.id == d.client_id))
        client = c_result.scalar_one_or_none()
        if client:
            client_name = f"{client.first_name} {client.last_name}".strip()
    return {
        **d.to_dict(),
        "client_name": client_name or f"Cliente {d.client_id[:8]}" if d.client_id else "",
        "quotations": [q.to_dict() for q in q_result.scalars().all()],
        "reservations": [r.to_dict() for r in r_result.scalars().all()],
    }


# -------------------- Public Leads (no auth) --------------------
def _build_room_summary(single: int, double: int, triple: int) -> str:
    """Build a human-readable room summary, e.g. '1 Sencilla, 2 Doble'."""
    parts = []
    if single > 0: parts.append(f"{single} Sencilla")
    if double > 0: parts.append(f"{double} Doble")
    if triple > 0: parts.append(f"{triple} Triple")
    return ", ".join(parts) if parts else ""

@api.post("/leads")
async def create_lead(body: LeadIn, db: AsyncSession = Depends(get_db), _rl=Depends(rate_limit(5, 60))):
    """Public endpoint: landing page form → creates client + quotation."""
    # Sanitize all text inputs
    body.fullName = sanitize_html(body.fullName)
    body.comments = sanitize_html(body.comments)
    body.preferredHotel = sanitize_html(body.preferredHotel)
    body.country = sanitize_html(body.country)
    body.city = sanitize_html(body.city)
    body.hotelCategory = sanitize_html(body.hotelCategory)

    # Sanitize room counts (ints, no sanitize needed)

    email = body.email.strip().lower()

    # Find or create client
    result = await db.execute(select(Client).where(Client.email == email, Client.deleted_at.is_(None)))
    client = result.scalar_one_or_none()

    if not client:
        # Split fullName into first/last
        parts = body.fullName.strip().split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""
        client = Client(
            id=new_id(), first_name=first_name, last_name=last_name,
            email=email, phone=body.phone,
            status="activo", created_by=None,
        )
        db.add(client)
        await db.flush()

    # Build rich form data
    form_data = {
        "fullName": body.fullName,
        "email": body.email,
        "phone": body.phone,
        "country": body.country,
        "city": body.city,
        "preferredHotel": body.preferredHotel,
        "departureDate": body.departureDate,
        "returnDate": body.returnDate,
        "flexibleDates": body.flexibleDates,
        "adultsCount": body.adultsCount,
        "childrenCount": body.childrenCount,
        "babiesCount": body.babiesCount,
        "budgetRange": body.budgetRange,
        "additionalServices": body.additionalServices,
        "travelType": body.travelType,
        "hotelCategory": body.hotelCategory,
        "roomsSingle": body.roomsSingle,
        "roomsDouble": body.roomsDouble,
        "roomsTriple": body.roomsTriple,
        "preferredContact": body.preferredContact,
        "comments": body.comments,
    }

    total_travelers = body.adultsCount + body.childrenCount + body.babiesCount
    destination_str = f"{body.country}{', ' + body.city if body.city else ''}"

    # Try to find hero image from destinations table
    hero_image = await get_destination_image(db, destination_str)

    # Auto-create dossier for the lead
    dossier_code = await _generate_code(db, "EXP")
    dossier = Dossier(
        id=new_id(), code=dossier_code,
        client_id=client.id, status="abierto",
        created_by=None,
    )
    db.add(dossier)
    await db.flush()

    # Generate quotation code
    quote_code = await _generate_code(db, "COT")

    q = Quotation(
        id=new_id(),
        client_id=client.id,
        destination=destination_str,
        travel_date=body.departureDate,
        return_date=body.returnDate,
        travelers=total_travelers,
        amount=0,
        currency="USD",
        notes=body.comments or "",
        form_data=form_data,
        room_type=_build_room_summary(body.roomsSingle, body.roomsDouble, body.roomsTriple),
        hero_image=hero_image,
        dossier_id=dossier.id,
        code=quote_code,
        status="borrador",
        sent_via=body.preferredContact,
        sent_at=now_iso(),
        created_by=None,
    )
    db.add(q)
    await db.flush()

    # Notify all users about new lead
    await create_notification_all(
        db,
        type_="new_lead",
        title=f"Nuevo lead: {body.fullName}",
        message=f"{body.fullName} solicitó cotización para {body.country}{', ' + body.city if body.city else ''}",
        link=f"/admin/cotizaciones/{q.id}",
    )

    logger.info(f"New lead from {email}: {q.id}")

    return {
        "ok": True,
        "message": "¡Gracias por tu solicitud!",
        "lead_id": q.id,
        "client_id": client.id,
    }


# -------------------- Notifications --------------------
@api.get("/notifications")
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    _u=Depends(get_current_user),
):
    """Get notifications for current user, most recent first."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == _u["id"])
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    return [n.to_dict() for n in result.scalars().all()]


@api.get("/notifications/unread-count")
async def unread_count(
    db: AsyncSession = Depends(get_db),
    _u=Depends(get_current_user),
):
    result = await db.execute(
        select(func.count(Notification.id))
        .where(Notification.user_id == _u["id"], Notification.read == False)
    )
    return {"count": result.scalar() or 0}


@api.patch("/notifications/{nid}/read")
async def mark_read(nid: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(
        select(Notification).where(Notification.id == nid, Notification.user_id == _u["id"])
    )
    n = result.scalar_one_or_none()
    if n:
        n.read = True
    return {"ok": True}


@api.patch("/notifications/read-all")
async def mark_all_read(db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(
        select(Notification).where(Notification.user_id == _u["id"], Notification.read == False)
    )
    for n in result.scalars().all():
        n.read = True
    return {"ok": True}


# -------------------- Reservations --------------------
@api.get("/reservations")
async def list_reservations(
    status_f: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _u=Depends(get_current_user),
):
    stmt = select(Reservation).order_by(Reservation.created_at.desc()).limit(500)
    if status_f:
        stmt = stmt.where(Reservation.status == status_f)
    result = await db.execute(stmt)
    docs = [r.to_dict() for r in result.scalars().all()]

    if docs:
        rids = [d["id"] for d in docs]
        pay_r = await db.execute(
            select(Payment).where(Payment.reservation_id.in_(rids), Payment.status == "completado")
        )
        paid_map = {}
        for p in pay_r.scalars().all():
            paid_map[p.reservation_id] = paid_map.get(p.reservation_id, 0) + p.amount
        for d in docs:
            d["paid_amount"] = paid_map.get(d["id"], 0)

    return await _enrich_with_client(docs, db)

@api.post("/reservations")
async def create_reservation(body: ReservationIn, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    r = Reservation(
        id=new_id(), client_id=body.client_id, quotation_id=body.quotation_id,
        destination=body.destination, departure_date=body.departure_date,
        return_date=body.return_date, travelers=body.travelers,
        services=body.services or "", notes=body.notes or "",
        total_amount=body.total_amount, currency=body.currency,
        status=body.status,
        passengers=[p.model_dump() for p in (body.passengers or [])],
        documents=[d.model_dump() for d in (body.documents or [])],
        created_by=u["id"],
    )
    db.add(r)
    await db.flush()
    return r.to_dict()

@api.get("/reservations/{rid}")
async def get_reservation(rid: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Reservation).where(Reservation.id == rid))
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    doc = r.to_dict()
    client_r = await db.execute(select(Client).where(Client.id == r.client_id))
    client = client_r.scalar_one_or_none()
    pay_r = await db.execute(
        select(Payment).where(Payment.reservation_id == rid).order_by(Payment.created_at.desc())
    )
    return {
        "reservation": doc,
        "client": client.to_dict() if client else None,
        "payments": [p.to_dict() for p in pay_r.scalars().all()],
    }

@api.put("/reservations/{rid}")
async def update_reservation(rid: str, body: ReservationIn, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Reservation).where(Reservation.id == rid))
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    for k, v in body.model_dump().items():
        if k in ("passengers", "documents") and isinstance(v, list):
            v = [x.model_dump() if hasattr(x, 'model_dump') else x for x in v]
        setattr(r, k, v)
    return r.to_dict()

@api.delete("/reservations/{rid}")
async def delete_reservation(rid: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Reservation).where(Reservation.id == rid))
    r = result.scalar_one_or_none()
    if r:
        await db.delete(r)
    return {"ok": True}


# -------------------- Payments --------------------
@api.get("/payments")
async def list_payments(db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Payment).order_by(Payment.created_at.desc()).limit(500))
    docs = [p.to_dict() for p in result.scalars().all()]

    if docs:
        rids = list({d["reservation_id"] for d in docs if d.get("reservation_id")})
        if rids:
            res_r = await db.execute(select(Reservation).where(Reservation.id.in_(rids)))
            reservations = {r.id: r for r in res_r.scalars().all()}
            cids = list({r.client_id for r in reservations.values()})
            cli_r = await db.execute(select(Client).where(Client.id.in_(cids)))
            clients = {c.id: c for c in cli_r.scalars().all()}
            for d in docs:
                res = reservations.get(d["reservation_id"])
                d["reservation_destination"] = res.destination if res else "—"
                c = clients.get(res.client_id) if res else None
                d["client_name"] = f"{c.first_name} {c.last_name}" if c else "—"

    return docs

@api.post("/payments")
async def create_payment(body: PaymentIn, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    res_r = await db.execute(select(Reservation).where(Reservation.id == body.reservation_id))
    res = res_r.scalar_one_or_none()
    if not res:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if res.status == "cancelada":
        raise HTTPException(status_code=400, detail="Una reserva cancelada no acepta pagos")

    p = Payment(
        id=new_id(), reservation_id=body.reservation_id, client_id=res.client_id,
        amount=body.amount, method=body.method, reference=body.reference or "",
        payment_date=body.payment_date or now_iso(), status=body.status,
        notes=body.notes or "", created_by=u["id"],
    )
    db.add(p)
    await db.flush()

    # Update reservation status if fully paid
    if body.status == "completado":
        pay_r = await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0))
            .where(Payment.reservation_id == body.reservation_id, Payment.status == "completado")
        )
        total_paid = pay_r.scalar() or 0
        if total_paid >= res.total_amount and res.status in ("pendiente", "confirmada"):
            res.status = "pagada"

    # Notify ALL active users about payment
    client_r = await db.execute(select(Client).where(Client.id == res.client_id))
    client = client_r.scalar_one_or_none()
    client_name = f"{client.first_name} {client.last_name}" if client else "Cliente"
    await create_notification_all(
        db, "payment",
        title=f"Pago recibido: {client_name}",
        message=f"${body.amount:,.2f} {body.method} — {res.destination}",
        link=f"/admin/reservas/{body.reservation_id}",
    )
    await _send_mail(
        db, "",
        f"Pago recibido: {client_name} — ${body.amount:,.2f}",
        f"<p><b>{client_name}</b> realizó un pago de <b>${body.amount:,.2f}</b> ({body.method}) por {res.destination}.</p>",
    )

    return p.to_dict()

@api.delete("/payments/{pid}")
async def delete_payment(pid: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Payment).where(Payment.id == pid))
    p = result.scalar_one_or_none()
    if p:
        await db.delete(p)
    return {"ok": True}


# -------------------- Destinations (admin) --------------------
@api.get("/destinations")
async def list_destinations(
    q: Optional[str] = None,
    status_f: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Destination).order_by(Destination.created_at.desc()).limit(500)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(Destination.name.ilike(pattern), Destination.country.ilike(pattern)))
    if status_f:
        stmt = stmt.where(Destination.status == status_f)
    result = await db.execute(stmt)
    return [d.to_dict() for d in result.scalars().all()]

@api.post("/destinations")
async def create_destination(body: DestinationIn, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    d = Destination(id=new_id(), **body.model_dump())
    db.add(d)
    await db.flush()
    return d.to_dict()

@api.put("/destinations/{did}")
async def update_destination(did: str, body: DestinationIn, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Destination).where(Destination.id == did))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    for k, v in body.model_dump().items():
        setattr(d, k, v)
    return d.to_dict()

@api.delete("/destinations/{did}")
async def delete_destination(did: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Destination).where(Destination.id == did))
    d = result.scalar_one_or_none()
    if d:
        await db.delete(d)
    return {"ok": True}


# -------------------- Packages (admin) --------------------
@api.get("/packages")
async def list_packages(
    q: Optional[str] = None,
    status_f: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _u=Depends(get_current_user),
):
    stmt = select(Package).order_by(Package.created_at.desc()).limit(500)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(Package.name.ilike(pattern), Package.destination.ilike(pattern)))
    if status_f:
        stmt = stmt.where(Package.status == status_f)
    result = await db.execute(stmt)
    return [p.to_dict() for p in result.scalars().all()]

@api.post("/packages")
async def create_package(body: PackageIn, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    p = Package(id=new_id(), **body.model_dump())
    db.add(p)
    await db.flush()
    return p.to_dict()

@api.put("/packages/{pid}")
async def update_package(pid: str, body: PackageIn, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Package).where(Package.id == pid))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    for k, v in body.model_dump().items():
        setattr(p, k, v)
    return p.to_dict()

@api.delete("/packages/{pid}")
async def delete_package(pid: str, db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Package).where(Package.id == pid))
    p = result.scalar_one_or_none()
    if p:
        await db.delete(p)
    return {"ok": True}


# -------------------- Dashboard --------------------
@api.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    """Real-time metrics for the admin dashboard."""
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Total quotations this month
    q_total = await db.execute(
        select(func.count(Quotation.id)).where(Quotation.created_at >= month_start)
    )
    total_quotations = q_total.scalar() or 0

    # Pending (borrador + enviada)
    q_pending = await db.execute(
        select(func.count(Quotation.id)).where(
            Quotation.created_at >= month_start,
            Quotation.status.in_(["borrador", "enviada"])
        )
    )
    pending = q_pending.scalar() or 0

    # Accepted
    q_accepted = await db.execute(
        select(func.count(Quotation.id)).where(
            Quotation.created_at >= month_start,
            Quotation.status == "aceptada"
        )
    )
    accepted = q_accepted.scalar() or 0

    # Revenue: sum of accepted quotations amount
    q_revenue = await db.execute(
        select(func.coalesce(func.sum(Quotation.amount), 0)).where(
            Quotation.status == "aceptada"
        )
    )
    revenue = float(q_revenue.scalar() or 0)

    # Total clients
    c_total = await db.execute(
        select(func.count(Client.id)).where(Client.deleted_at.is_(None))
    )
    total_clients = c_total.scalar() or 0

    # New leads today (created_by is None = from landing)
    q_leads = await db.execute(
        select(func.count(Quotation.id)).where(
            Quotation.created_at >= today_start,
            Quotation.created_by.is_(None)
        )
    )
    new_leads = q_leads.scalar() or 0

    # Conversion rate
    conv_rate = round((accepted / total_quotations * 100) if total_quotations > 0 else 0, 1)

    # Monthly series: cotizaciones por mes (últimos 6 meses) para el gráfico
    monthly_series = []
    for i in range(5, -1, -1):
        bucket_start = now.replace(day=1) - timedelta(days=30 * i)
        bucket_start = bucket_start.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if i == 0:
            bucket_end = now
        else:
            bucket_end = (bucket_start.replace(day=28) + timedelta(days=4)).replace(day=1)
        label = bucket_start.strftime("%b")

        total_r = await db.execute(
            select(func.count(Quotation.id)).where(
                Quotation.created_at >= bucket_start,
                Quotation.created_at < bucket_end
            )
        )
        accepted_r = await db.execute(
            select(func.count(Quotation.id)).where(
                Quotation.created_at >= bucket_start,
                Quotation.created_at < bucket_end,
                Quotation.status == "aceptada"
            )
        )
        monthly_series.append({
            "month": label,
            "total": total_r.scalar() or 0,
            "accepted": accepted_r.scalar() or 0,
        })

    # Recent activity: last 5 notifications
    n_result = await db.execute(
        select(Notification).order_by(Notification.created_at.desc()).limit(5)
    )
    recent = [
        {"type": n.type, "title": n.title, "message": n.message,
         "link": n.link, "created_at": n.created_at.isoformat() if n.created_at else None}
        for n in n_result.scalars().all()
    ]

    return {
        "total_quotations": total_quotations,
        "pending": pending,
        "accepted": accepted,
        "revenue": revenue,
        "total_clients": total_clients,
        "new_leads": new_leads,
        "conversion_rate": conv_rate,
        "monthly_series": monthly_series,
        "recent_activity": recent,
    }


# -------------------- Users --------------------
@api.get("/users")
async def list_users(
    q: Optional[str] = None,
    role_f: Optional[str] = None,
    status_f: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    u=Depends(get_current_user),
):
    require_admin(u)
    stmt = select(User).order_by(User.created_at.desc()).limit(500)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(or_(User.name.ilike(pattern), User.email.ilike(pattern)))
    if role_f:
        stmt = stmt.where(User.role == role_f)
    if status_f:
        stmt = stmt.where(User.status == status_f)
    result = await db.execute(stmt)
    return [user.to_dict() for user in result.scalars().all()]

@api.post("/users")
async def create_user(body: UserIn, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    require_admin(u)
    if not body.password:
        raise HTTPException(status_code=400, detail="La contraseña es requerida")
    # Enforce single super_admin
    if body.role == "super_admin":
        existing_sa = await db.execute(select(User).where(User.role == "super_admin"))
        if existing_sa.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Solo puede existir un Super Administrador. Usa 'admin' como rol.")
    existing = await db.execute(select(User).where(User.email == body.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese correo")
    if body.username:
        existing_un = await db.execute(select(User).where(User.username == body.username.lower()))
        if existing_un.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Ya existe un usuario con ese nombre de usuario")
    user = User(
        id=new_id(), email=body.email.lower(), name=body.name,
        username=body.username.lower() if body.username else None,
        role=body.role, status=body.status,
        phone=body.phone or "", avatar_url=body.avatar_url or "",
        department=body.department or "", notes=body.notes or "",
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.flush()
    return user.to_dict()

@api.put("/users/{uid}")
async def update_user(uid: str, body: UserIn, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    require_admin(u)
    if uid == u["id"] and body.status == "inactivo":
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propio usuario")
    # Enforce single super_admin on role change
    if body.role == "super_admin":
        existing_sa = await db.execute(select(User).where(User.role == "super_admin", User.id != uid))
        if existing_sa.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Solo puede existir un Super Administrador. Usa 'admin' como rol.")
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.name = body.name
    user.email = body.email.lower()
    if body.username is not None:
        user.username = body.username.lower() if body.username else None
    user.role = body.role
    user.status = body.status
    user.phone = body.phone or ""
    user.avatar_url = body.avatar_url or ""
    user.department = body.department or ""
    user.notes = body.notes or ""
    if body.password:
        user.password_hash = hash_password(body.password)
    return user.to_dict()

@api.delete("/users/{uid}")
async def delete_user(uid: str, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    require_admin(u)
    if uid == u["id"]:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if user:
        await db.delete(user)
    return {"ok": True}


# -------------------- Settings --------------------
@api.get("/settings")
async def get_settings(db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    result = await db.execute(select(Setting).where(Setting.id == "global"))
    s = result.scalar_one_or_none()
    if not s:
        s = Setting(id="global")
        db.add(s)
        await db.flush()
    return s.to_dict()

@api.put("/settings")
async def update_settings(body: SettingsIn, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    require_admin(u)
    result = await db.execute(select(Setting).where(Setting.id == "global"))
    s = result.scalar_one_or_none()
    if not s:
        s = Setting(id="global")
        db.add(s)
    data = body.model_dump()
    if data.get("smtp_password") in ("", "••••••"):
        data.pop("smtp_password", None)
    for k, v in data.items():
        setattr(s, k, v)
    await db.flush()
    return s.to_dict()


# -------------------- Email --------------------
def _smtp_send(host, port, user, password, from_addr, to, subject, html):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    with smtplib.SMTP(host, port, timeout=30) as s:
        s.starttls()
        s.login(user, password)
        s.sendmail(from_addr, [to], msg.as_string())


async def _send_mail(db, to, subject, html):
    result = await db.execute(select(Setting).where(Setting.id == "global"))
    s = result.scalar_one_or_none()
    if not s or not s.smtp_host or not s.smtp_user or not s.smtp_password:
        return False, "SMTP no configurado"
    from_addr = s.smtp_from or s.smtp_user
    to_addr = to or from_addr
    try:
        await run_in_threadpool(_smtp_send, s.smtp_host, s.smtp_port, s.smtp_user, s.smtp_password, from_addr, to_addr, subject, html)
        return True, "ok"
    except Exception as e:
        logger.warning(f"SMTP error: {e}")
        return False, str(e)


STAFF_EMAILS = [
    "randolfbueno@karabuviajes.com",
    "soporte@karabuviajes.com",
    "rsbueno25@gmail.com",
    "karabu2019@gmail.com",
]


async def _notify_staff(db, subject, html):
    """Envía email a Papá (randolfbueno@), a Rinaldi (soporte@) y a los Gmail de respaldo."""
    for addr in STAFF_EMAILS:
        await _send_mail(db, addr, subject, html)


@api.post("/settings/test-email")
async def test_email(body: dict, db: AsyncSession = Depends(get_db), u=Depends(get_current_user)):
    require_admin(u)
    to = (body or {}).get("to") or ""
    ok, err = await _send_mail(db, to, "Prueba de correo — Karabu Viajes", "<p>Si estás leyendo esto, el envío de correos de <b>Karabu Viajes</b> funciona correctamente.</p>")
    if not ok:
        raise HTTPException(status_code=500, detail=err)
    return {"ok": True, "message": f"Correo de prueba enviado a {to}"}


# -------------------- Dashboard --------------------
@api.get("/dashboard/stats")
async def dashboard_stats(period: str = "6m", db: AsyncSession = Depends(get_db), _u=Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_clients_r = await db.execute(select(func.count(Client.id)).where(Client.deleted_at.is_(None)))
    total_clients = total_clients_r.scalar() or 0

    active_res_r = await db.execute(
        select(func.count(Reservation.id)).where(
            Reservation.status.in_(["pendiente", "confirmada", "pagada", "en_viaje"])
        )
    )
    active_reservations = active_res_r.scalar() or 0

    pending_quot_r = await db.execute(
        select(func.count(Quotation.id)).where(Quotation.status.in_(["borrador", "enviada"]))
    )
    pending_quotations = pending_quot_r.scalar() or 0

    new_clients_r = await db.execute(
        select(func.count(Client.id)).where(Client.created_at >= month_start, Client.deleted_at.is_(None))
    )
    new_clients_month = new_clients_r.scalar() or 0

    # Quotations metrics
    sent_quot_r = await db.execute(select(func.count(Quotation.id)).where(Quotation.status == "enviada"))
    sent_quotations = sent_quot_r.scalar() or 0

    accepted_quot_r = await db.execute(select(func.count(Quotation.id)).where(Quotation.status == "aceptada"))
    accepted_quotations = accepted_quot_r.scalar() or 0

    # Monthly sales (reservations created this month)
    sales_month_r = await db.execute(
        select(func.count(Reservation.id)).where(Reservation.created_at >= month_start)
    )
    monthly_sales = sales_month_r.scalar() or 0

    # Top destinations (most quoted)
    top_dest_r = await db.execute(
        select(Quotation.destination, func.count(Quotation.id).label("cnt"))
        .group_by(Quotation.destination).order_by(desc("cnt")).limit(5)
    )
    top_destinations = [{"destination": r[0], "count": r[1]} for r in top_dest_r.all()]

    # Top brokers (most accepted quotations)
    top_brokers_r = await db.execute(
        select(User.name, func.count(Quotation.id).label("cnt"))
        .join(Quotation, Quotation.created_by == User.id)
        .where(Quotation.status == "aceptada")
        .group_by(User.name).order_by(desc("cnt")).limit(5)
    )
    top_brokers = [{"name": r[0], "accepted": r[1]} for r in top_brokers_r.all()]

    payments_month_r = await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0))
        .where(Payment.status == "completado", Payment.created_at >= month_start)
    )
    monthly_income = float(payments_month_r.scalar() or 0)

    # Upcoming trips
    upcoming_r = await db.execute(
        select(Reservation).where(
            Reservation.status.in_(["confirmada", "pagada"]),
            Reservation.departure_date >= now.isoformat(),
            Reservation.departure_date <= (now + timedelta(days=30)).isoformat(),
        ).order_by(Reservation.departure_date).limit(5)
    )
    upcoming = [r.to_dict() for r in upcoming_r.scalars().all()]
    await _enrich_with_client(upcoming, db)

    # Recent reservations
    recent_r = await db.execute(
        select(Reservation).order_by(Reservation.created_at.desc()).limit(5)
    )
    recent_res = [r.to_dict() for r in recent_r.scalars().all()]
    await _enrich_with_client(recent_res, db)

    # Income series
    range_config = {
        "day":  {"buckets": 24, "step": timedelta(hours=1),  "fmt": "%H:%M"},
        "7d":   {"buckets": 7,  "step": timedelta(days=1),   "fmt": "%d %b"},
        "month":{"buckets": 30, "step": timedelta(days=1),   "fmt": "%d"},
        "3m":   {"buckets": 3,  "step": timedelta(days=30),  "fmt": "%b"},
        "6m":   {"buckets": 6,  "step": timedelta(days=30),  "fmt": "%b"},
        "year": {"buckets": 12, "step": timedelta(days=30),  "fmt": "%b"},
    }
    cfg = range_config.get(period, range_config["6m"])
    income_series = []

    for i in range(cfg["buckets"] - 1, -1, -1):
        bucket_end = now - cfg["step"] * i
        bucket_start = bucket_end - cfg["step"]
        label = bucket_start.strftime(cfg["fmt"])

        agg_r = await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0))
            .where(
                Payment.status == "completado",
                Payment.created_at >= bucket_start,
                Payment.created_at < bucket_end,
            )
        )
        income_series.append({"month": label, "income": float(agg_r.scalar() or 0)})

    return {
        "total_clients": total_clients,
        "active_reservations": active_reservations,
        "pending_quotations": pending_quotations,
        "sent_quotations": sent_quotations,
        "accepted_quotations": accepted_quotations,
        "monthly_income": monthly_income,
        "monthly_sales": monthly_sales,
        "new_clients_month": new_clients_month,
        "top_destinations": top_destinations,
        "top_brokers": top_brokers,
        "upcoming_trips": upcoming,
        "recent_reservations": recent_res,
        "income_series": income_series,
    }


# ==================== GEOAPIFY / DESTINATIONS / SERPAPI ====================

DESTINATIONS = {
    "punta_cana": {
        "name": "Punta Cana", "country": "República Dominicana",
        "lat": 18.5565, "lon": -68.3692,
        "img": "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?w=600",
        "desc": "Playas paradisíacas y resorts todo incluido en el Caribe.",
        "continent": "América", "price": 1200, "stars": 4.8, "trip_type": "Playa", "duration": 7
    }
}

PUNTA_CANA_HOTELS = [
    {"name": "Hyatt Ziva Cap Cana", "stars": "5 estrellas", "rating": 4.8, "type": "Todo Incluido", "desc": "Resort de lujo frente al mar con piscinas infinity y spa de clase mundial."},
    {"name": "Hyatt Zilara Cap Cana", "stars": "5 estrellas", "rating": 4.9, "type": "Solo Adultos", "desc": "Experiencia solo adultos con servicio personalizado, gastronomía gourmet y playas privadas."},
    {"name": "Secrets Cap Cana Resort & Spa", "stars": "5 estrellas", "rating": 4.7, "type": "Solo Adultos", "desc": "Unlimited-Luxury frente a la playa Juanillo, suites elegantes y piscinas infinitas."},
    {"name": "Sanctuary Cap Cana", "stars": "5 estrellas", "rating": 4.6, "type": "Lujo", "desc": "Arquitectura de castillo español con vistas al Caribe, 5 restaurantes y marina privada."},
    {"name": "Margaritaville Island Reserve Cap Cana", "stars": "5 estrellas", "rating": 4.7, "type": "Todo Incluido", "desc": "Estilo isleño relajado con rooftop pool, entretenimiento en vivo y suites temáticas."},
    {"name": "TRS Cap Cana Waterfront & Marina Hotel", "stars": "5 estrellas", "rating": 4.7, "type": "Solo Adultos", "desc": "Hotel boutique con acceso a marina, suites con piscina privada y servicio de mayordomo."},
    {"name": "Eden Roc Cap Cana", "stars": "5 estrellas", "rating": 4.8, "type": "Lujo", "desc": "Resort Relais & Châteaux con villas privadas, club de playa y campo de golf diseñado por Jack Nicklaus."},
    {"name": "Breathless Punta Cana Resort & Spa", "stars": "5 estrellas", "rating": 4.5, "type": "Solo Adultos", "desc": "Fiestas en la piscina, DJ en vivo, 11 restaurantes y ambiente vibrante las 24 horas."},
    {"name": "Excellence Punta Cana", "stars": "5 estrellas", "rating": 4.7, "type": "Solo Adultos", "desc": "Refugio romántico con spa de clase mundial, 12 restaurantes y servicio de playa VIP."},
    {"name": "Excellence El Carmen", "stars": "5 estrellas", "rating": 4.8, "type": "Solo Adultos", "desc": "Suites con jacuzzi privado, 23 piscinas y experiencias culinarias de autor."},
    {"name": "Finest Punta Cana", "stars": "5 estrellas", "rating": 4.6, "type": "Familiar", "desc": "Resort familiar de lujo con club para niños, teens club y sección solo adultos."},
    {"name": "Zoetry Agua Punta Cana", "stars": "5 estrellas", "rating": 4.8, "type": "Boutique", "desc": "Retiro wellness con suites frente al mar, yoga al amanecer y cocina orgánica gourmet."},
    {"name": "Iberostar Grand Bavaro", "stars": "5 estrellas", "rating": 4.7, "type": "Solo Adultos", "desc": "Elegancia colonial frente a Playa Bávaro con servicio de mayordomo y campo de golf."},
    {"name": "Royalton Bavaro Resort & Spa", "stars": "5 estrellas", "rating": 4.5, "type": "Familiar", "desc": "Parque acuático, casino, bolos y entretenimiento familiar con toque de lujo moderno."},
    {"name": "Royalton Punta Cana Resort & Spa", "stars": "5 estrellas", "rating": 4.4, "type": "Todo Incluido", "desc": "Opción popular con piscinas amplias, buffet variado y actividades para toda la familia."},
    {"name": "Melia Punta Cana Beach Resort", "stars": "5 estrellas", "rating": 4.5, "type": "Solo Adultos", "desc": "Nivel The Level con acceso exclusivo, 7 piscinas y playa de arena blanca."},
    {"name": "Paradisus Grand Cana", "stars": "5 estrellas", "rating": 4.6, "type": "Familiar", "desc": "Suites de lujo con servicio personalizado, actividades familiares y cenas temáticas."},
    {"name": "Barcelo Bavaro Palace", "stars": "5 estrellas", "rating": 4.5, "type": "Todo Incluido", "desc": "Mega resort con campo de golf, casino, spa y una de las playas más extensas de la zona."},
    {"name": "Hard Rock Hotel & Casino Punta Cana", "stars": "5 estrellas", "rating": 4.3, "type": "Todo Incluido", "desc": "El resort más grande con casino, 13 piscinas, minigolf y memorabilia de rock."},
    {"name": "Riu Palace Punta Cana", "stars": "5 estrellas", "rating": 4.4, "type": "Todo Incluido", "desc": "Clásico resort español con servicio 24h todo incluido, 4 piscinas y acceso directo a la playa."},
    {"name": "Riu Palace Bavaro", "stars": "5 estrellas", "rating": 4.4, "type": "Todo Incluido", "desc": "Hotel elegante con piscina central estilo laguna, amplias zonas verdes y restaurantes temáticos."},
    {"name": "Tortuga Bay Puntacana Resort & Club", "stars": "5 estrellas", "rating": 4.9, "type": "Boutique", "desc": "Diseñado por Oscar de la Renta, acceso a la playa privada y reserva ecológica."},
    {"name": "JW Marriott Punta Cana", "stars": "5 estrellas", "rating": 4.5, "type": "Lujo", "desc": "Nuevo resort con diseño contemporáneo, infinity pool y restaurantes de firma."},
    {"name": "Dreams Onyx Resort & Spa", "stars": "5 estrellas", "rating": 4.3, "type": "Familiar", "desc": "Parque acuático, club infantil, teens club y sección solo adultos Preferred Club."},
    {"name": "Live Aqua Beach Resort Punta Cana", "stars": "5 estrellas", "rating": 4.6, "type": "Solo Adultos", "desc": "Experiencia sensorial con aromaterapia, 8 restaurantes y piscinas de ensueño."},
]

def get_mock_hotels(city_name: str) -> list:
    return [
        {"name": f"Grand Hyatt {city_name}", "address": f"Av. Principal, {city_name}", "categories": ["accommodation.hotel"]},
        {"name": f"Sheraton Resort {city_name}", "address": f"Zona Turística, {city_name}", "categories": ["accommodation.hotel"]},
        {"name": f"Boutique Hotel Central {city_name}", "address": f"Centro Histórico, {city_name}", "categories": ["accommodation.hotel"]},
        {"name": f"Karabu Luxury Suites {city_name}", "address": f"Distrito Financiero, {city_name}", "categories": ["accommodation.hotel"]}
    ]

_destinations_cache = None

def _geoapify(path, params, version="v2", timeout=10):
    params["apiKey"] = GEOAPIFY_KEY
    qs = urllib.parse.urlencode(params)
    url = f"https://api.geoapify.com/{version}/{path}?{qs}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read())

@api.get("/places/destinations")
def places_destinations():
    global _destinations_cache
    if _destinations_cache is not None:
        return _destinations_cache

    results = {}
    for slug, d in DESTINATIONS.items():
        if slug == "punta_cana":
            hotels = [{"name": h["name"], "address": h["desc"][:60], "categories": ["accommodation.hotel"]} for h in PUNTA_CANA_HOTELS]
        else:
            hotels = []
            try:
                data = _geoapify("places", {
                    "categories": "accommodation.hotel",
                    "filter": f"circle:{d['lon']},{d['lat']},15000",
                    "limit": 4,
                }, timeout=1.0)
                for feat in data.get("features", []):
                    p = feat["properties"]
                    hotels.append({
                        "name": p.get("name", p.get("address_line1", "Hotel")),
                        "address": p.get("formatted", p.get("address_line2", "")),
                        "categories": p.get("categories", []),
                    })
            except Exception as e:
                logger.warning(f"Geoapify error for {slug}: {e}")
            if not hotels:
                hotels = get_mock_hotels(d["name"])

        results[slug] = {**d, "hotels": hotels, "count": len(hotels)}

    _destinations_cache = results
    return results

@api.get("/places/search")
def places_search(query: str = "", limit: int = 5):
    if not query or len(query) < 2:
        return {"suggestions": []}
    try:
        data = _geoapify("geocode/autocomplete", {
            "text": query, "format": "json", "limit": limit,
        }, version="v1")
        suggestions = []
        for r in data.get("results", [])[:limit]:
            suggestions.append({
                "formatted": r.get("formatted", ""),
                "city": r.get("city", ""),
                "country": r.get("country", ""),
                "lat": r.get("lat"),
                "lon": r.get("lon"),
            })
        return {"suggestions": suggestions}
    except Exception as e:
        logger.warning(f"Geoapify search error: {e}")
        return {"suggestions": []}


@api.get("/places/autocomplete")
async def places_autocomplete(q: str = "", limit: int = 7, db: AsyncSession = Depends(get_db)):
    """Búsqueda rápida de hoteles/lugares con LIKE para autocomplete."""
    if not q or len(q.strip()) < 2:
        return {"suggestions": []}
    try:
        pattern = f"%{q.strip()}%"
        result = await db.execute(
            select(Lugar).where(Lugar.nombre.ilike(pattern)).order_by(Lugar.nombre).limit(limit)
        )
        lugares = result.scalars().all()
        suggestions = [{
            "id": l.id,
            "nombre": l.nombre,
            "categoria": l.categoria,
            "rating": l.rating,
            "id_ciudad": l.id_ciudad,
        } for l in lugares]
        return {"suggestions": suggestions}
    except Exception as e:
        logger.warning(f"Autocomplete error: {e}")
        return {"suggestions": []}


# SerpApi
_serpapi_cache = {}
_cache_lock = threading.Lock()

@api.get("/places/hotels")
async def serpapi_hotels(slug: str = "punta_cana", db: AsyncSession = Depends(get_db)):
    d = DESTINATIONS.get(slug)
    if not d:
        return {"hotels": [], "error": "Destino no encontrado"}

    if slug == "punta_cana":
        # Intentar BD primero, fallback a lista estática
        try:
            result = await db.execute(select(Ciudad).where(Ciudad.ciudad == d["name"]))
            ciudad = result.scalar_one_or_none()
            if ciudad:
                lugares_r = await db.execute(
                    select(Lugar).where(Lugar.id_ciudad == ciudad.id).order_by(Lugar.nombre)
                )
                lugares = [l.to_dict() for l in lugares_r.scalars().all()]
                if lugares:
                    # Convertir al formato esperado por el frontend
                    hoteles = [{
                        "name": l["nombre"],
                        "stars": l.get("categoria", ""),
                        "rating": l.get("rating"),
                        "price": None,
                        "amenities": [],
                        "link": "",
                        "type": l.get("categoria", "Hotel"),
                        "desc": l.get("direccion_especifica", ""),
                    } for l in lugares]
                    return {"hotels": hoteles, "city": d["name"], "country": d["country"], "source": "bd_lugares"}
        except Exception as e:
            logger.warning(f"Error consultando lugares BD: {e}")

        return {"hotels": PUNTA_CANA_HOTELS, "city": d["name"], "country": d["country"], "source": "curado"}

    with _cache_lock:
        cached = _serpapi_cache.get(slug)
        if cached and cached["expires"] > datetime.now():
            return cached["data"]

    try:
        checkin = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        checkout = (datetime.now() + timedelta(days=37)).strftime("%Y-%m-%d")

        params = urllib.parse.urlencode({
            "engine": "google_hotels",
            "q": f"{d['name']} hotels",
            "check_in_date": checkin,
            "check_out_date": checkout,
            "currency": "USD", "gl": "do", "hl": "es",
            "api_key": SERPAPI_KEY,
        })
        url = f"https://serpapi.com/search?{params}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read())

        hotels = []
        for p in data.get("properties", [])[:6]:
            total_rate = p.get("total_rate", {}) or {}
            hotels.append({
                "name": p.get("name", ""),
                "stars": p.get("hotel_class", ""),
                "rating": p.get("overall_rating", None),
                "price": total_rate.get("lowest"),
                "amenities": p.get("amenities", [])[:5],
                "link": p.get("link", ""),
            })

        result = {"hotels": hotels, "city": d["name"], "country": d["country"]}
        with _cache_lock:
            _serpapi_cache[slug] = {"data": result, "expires": datetime.now() + timedelta(hours=1)}
        return result
    except Exception as e:
        logger.warning(f"SerpApi error for {slug}: {e}")
        return {"hotels": [], "city": d["name"], "error": str(e)}


# ==================== GEO: Poblar lugares desde Geoapify ====================

# Keywords de la franja costera/turística de Punta Cana
# Si un hotel contiene alguna de estas, pertenece a Punta Cana aunque Geoapify diga "Higüey"
PUNTA_CANA_COASTAL_KW = [
    'punta cana', 'bávaro', 'bavaro', 'cap cana', 'uvero alto',
    'arena gorda', 'cabeza de toro', 'macao', 'juanillo', 'cortecito',
    'el cortecito', 'los corales', 'playa blanca', 'cocotal',
    'bibijagua', 'verón', 'veron', 'friusa',
]


def _is_punta_cana_coastal(props: dict) -> bool:
    """Determina si un lugar de Geoapify está en la zona turística costera de Punta Cana."""
    text = ' '.join([
        props.get('formatted', ''),
        props.get('address_line1', ''),
        props.get('address_line2', ''),
        props.get('name', ''),
        props.get('city', ''),
        props.get('county', ''),
        props.get('district', ''),
    ]).lower()
    return any(kw in text for kw in PUNTA_CANA_COASTAL_KW)


async def _get_or_create_pais(db: AsyncSession, nombre: str) -> Pais:
    result = await db.execute(select(Pais).where(Pais.pais == nombre))
    pais = result.scalar_one_or_none()
    if not pais:
        pais = Pais(id=new_id(), pais=nombre)
        db.add(pais)
        await db.flush()
    return pais


async def _get_or_create_ciudad(db: AsyncSession, nombre: str, pais_id: str, lat=None, lon=None) -> Ciudad:
    result = await db.execute(select(Ciudad).where(Ciudad.ciudad == nombre, Ciudad.id_pais == pais_id))
    ciudad = result.scalar_one_or_none()
    if not ciudad:
        ciudad = Ciudad(id=new_id(), ciudad=nombre, id_pais=pais_id, lat=lat, lon=lon)
        db.add(ciudad)
        await db.flush()
    return ciudad


@api.get("/geo/populate")
async def geo_populate(slug: str = "punta_cana", limite: int = 20, db: AsyncSession = Depends(get_db)):
    """Consulta Geoapify y guarda lugares en BD para un destino.
    
    Lógica especial para Punta Cana: si un hotel está en la franja costera/turística
    (Bávaro, Cap Cana, Uvero Alto, etc.), se asigna a Punta Cana aunque Geoapify
    reporte la ciudad como "Higüey" o "Salvaleón de Higüey".
    """
    d = DESTINATIONS.get(slug)
    if not d:
        raise HTTPException(status_code=404, detail="Destino no encontrado")

    # 1. Upsert país
    pais = await _get_or_create_pais(db, d["country"])

    # 2. Upsert ciudad principal del destino
    ciudad = await _get_or_create_ciudad(db, d["name"], pais.id, d["lat"], d["lon"])

    # 3. Para Punta Cana, asegurar que Higüey también existe como ciudad separada
    ciudad_higuey = None
    if slug == "punta_cana":
        ciudad_higuey = await _get_or_create_ciudad(db, "Higüey", pais.id, 18.8000, -68.6500)

    # 4. Consultar Geoapify
    nuevos = 0
    try:
        params = {
            "categories": "accommodation.hotel",
            "filter": f"circle:{d['lon']},{d['lat']},15000",
            "limit": limite,
        }
        data = _geoapify("places", params, timeout=5)
        for feat in data.get("features", []):
            p = feat.get("properties", {})
            nombre = p.get("name") or p.get("address_line1", "")
            direccion = p.get("formatted") or p.get("address_line2", "")
            if not nombre:
                continue

            # Determinar a qué ciudad pertenece realmente
            ciudad_destino = ciudad  # default: la ciudad del slug

            if slug == "punta_cana":
                # Al popular Punta Cana, todo va a Punta Cana — sin importar
                # que Geoapify reporte "Higüey" en el campo city.
                # Hoteles en Bávaro, Cap Cana, Uvero Alto, etc. son Punta Cana.
                ciudad_destino = ciudad
            elif ciudad_higuey and _is_punta_cana_coastal(p):
                # Si se está poblando Higüey pero el hotel está en zona costera,
                # redirigir a Punta Cana
                ciudad_destino = ciudad

            # Verificar si ya existe en ESA ciudad
            existente = await db.execute(
                select(Lugar).where(Lugar.nombre == nombre, Lugar.id_ciudad == ciudad_destino.id).limit(1)
            )
            if existente.scalar_one_or_none():
                continue

            lugar = Lugar(
                id=new_id(),
                nombre=nombre,
                direccion_especifica=direccion,
                id_ciudad=ciudad_destino.id,
                categoria="accommodation.hotel",
            )
            db.add(lugar)
            nuevos += 1

        await db.commit()
    except Exception as e:
        logger.warning(f"Geoapify populate error for {slug}: {e}")
        raise HTTPException(status_code=502, detail=f"Error consultando Geoapify: {e}")

    return {
        "ok": True,
        "destino": d["name"],
        "pais": pais.to_dict(),
        "ciudad": ciudad.to_dict(),
        "nuevos_lugares": nuevos,
    }


@api.get("/geo/lugares")
async def geo_lugares(slug: str = "punta_cana", db: AsyncSession = Depends(get_db)):
    """Devuelve lugares guardados en BD para un destino."""
    d = DESTINATIONS.get(slug)
    if not d:
        raise HTTPException(status_code=404, detail="Destino no encontrado")

    # Buscar ciudad por nombre
    result = await db.execute(select(Ciudad).where(Ciudad.ciudad == d["name"]))
    ciudad = result.scalar_one_or_none()
    if not ciudad:
        return {"lugares": [], "ciudad": d["name"], "mensaje": "Ciudad no encontrada en BD. Usa /geo/populate primero."}

    lugares_r = await db.execute(
        select(Lugar).where(Lugar.id_ciudad == ciudad.id).order_by(Lugar.nombre)
    )
    lugares = [l.to_dict() for l in lugares_r.scalars().all()]

    return {
        "ciudad": ciudad.to_dict(),
        "pais": (await db.execute(select(Pais).where(Pais.id == ciudad.id_pais))).scalar_one().to_dict(),
        "total": len(lugares),
        "lugares": lugares,
    }


# -------------------- Startup / Shutdown --------------------
@app.on_event("startup")
async def startup():
    await init_db()

    # Migración: agregar columnas nuevas si no existen
    async with engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: sync_conn.execute(
            __import__('sqlalchemy').text("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS room_type VARCHAR DEFAULT ''")
        ))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(
            __import__('sqlalchemy').text("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'")
        ))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(
            __import__('sqlalchemy').text("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS deposit_percent FLOAT DEFAULT 0")
        ))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(
            __import__('sqlalchemy').text("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS hero_image VARCHAR DEFAULT ''")
        ))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(
            __import__('sqlalchemy').text("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS tax_percent FLOAT DEFAULT 18")
        ))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(
            __import__('sqlalchemy').text("ALTER TABLE quotations ADD COLUMN IF NOT EXISTS client_notes TEXT DEFAULT ''")
        ))
        await conn.run_sync(lambda sync_conn: sync_conn.execute(
            __import__('sqlalchemy').text("ALTER TABLE settings ADD COLUMN IF NOT EXISTS smtp_password VARCHAR DEFAULT ''")
        ))
        logger.info("Migration: room_type and services columns ensured")

    async with AsyncSessionLocal() as session:
        # Seed admin user — only from env vars, no defaults
        admin_email = os.environ.get("ADMIN_EMAIL")
        admin_password = os.environ.get("ADMIN_PASSWORD")
        if admin_email and admin_password:
            admin_email = admin_email.lower()
            existing = await session.execute(select(User).where(User.email == admin_email))
            user = existing.scalar_one_or_none()
            if not user:
                session.add(User(
                    id=new_id(), email=admin_email,
                    password_hash=hash_password(admin_password),
                    name="Administrador", role="super_admin",
                ))
                logger.info(f"Seeded admin: {admin_email}")
            else:
                if not verify_password(admin_password, user.password_hash):
                    user.password_hash = hash_password(admin_password)
                    logger.info(f"Updated admin password for {admin_email}")

        await session.commit()


@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()


# -------------------- File Upload --------------------
import base64
from fastapi import UploadFile, File as FileParam
from fastapi.responses import Response as FastAPIResponse

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"}
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

@api.post("/upload")
async def upload_file(file: UploadFile = FileParam(...), u=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Upload an image file. Stores in DB (persists across Render deploys). Returns public URL."""
    ext = Path(file.filename or "image.png").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Formato no permitido. Usa: {', '.join(ALLOWED_EXTENSIONS)}")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="La imagen no debe superar 10 MB")

    mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
                ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml", ".bmp": "image/bmp"}
    mime_type = mime_map.get(ext, "application/octet-stream")
    b64 = base64.b64encode(contents).decode("ascii")

    fid = new_id()
    db_upload = Upload(id=fid, filename=file.filename or "image.png", mime_type=mime_type, data=b64, created_by=u["id"])
    db.add(db_upload)
    await db.flush()

    url = f"/api/files/{fid}"
    logger.info(f"Uploaded to DB: {url} by user {u['email']}")
    return {"url": url, "filename": file.filename, "id": fid}


@api.get("/files/{fid}")
async def serve_file(fid: str, db: AsyncSession = Depends(get_db)):
    """Serve an uploaded file from the database."""
    result = await db.execute(select(Upload).where(Upload.id == fid))
    upload = result.scalar_one_or_none()
    if not upload:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    decoded = base64.b64decode(upload.data)
    return FastAPIResponse(content=decoded, media_type=upload.mime_type)

app.include_router(api)

# -------------------- Security Middleware --------------------
from starlette.middleware.base import BaseHTTPMiddleware

# HTTPS → HTTPS redirect (production only)
class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.scheme == "http" and "localhost" not in str(request.url.hostname or ""):
            url = request.url.replace(scheme="https")
            return FastAPIResponse(status_code=301, headers={"Location": str(url)})
        return await call_next(request)

# NOTE: Security headers are also applied via public/_headers for the static site

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://*.render.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://*.render.com https://*.onrender.com; "
            "frame-ancestors 'none'"
        )
        return response

app.add_middleware(HTTPSRedirectMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "https://karabuviajes.com,https://cotizacion.karabuviajes.com,https://karabu.onrender.com,https://cotizacion-pkvk.onrender.com").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
