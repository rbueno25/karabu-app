"""SQLAlchemy ORM models for Karabu Viajes."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship

from database import Base


def new_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_id)
    username = Column(String, unique=True, nullable=True, index=True)  # unique handle for login/mentions
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="advisor")  # super_admin, admin, advisor
    status = Column(String, nullable=False, default="activo")
    phone = Column(String, default="")  # WhatsApp / teléfono
    avatar_url = Column(String, default="")  # foto de perfil
    department = Column(String, default="")  # sucursal / área
    notes = Column(Text, default="")  # notas internas
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    def to_dict(self, safe=True):
        d = {
            "id": self.id, "username": self.username,
            "email": self.email, "name": self.name,
            "role": self.role, "status": self.status,
            "phone": self.phone, "avatar_url": self.avatar_url,
            "department": self.department, "notes": self.notes,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        return d


class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True, default=new_id)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=False)
    document_id = Column(String, default="")
    address = Column(String, default="")
    notes = Column(Text, default="")
    status = Column(String, nullable=False, default="activo")  # activo, inactivo
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    quotations = relationship("Quotation", back_populates="client", lazy="selectin")
    reservations = relationship("Reservation", back_populates="client", lazy="selectin")
    payments = relationship("Payment", back_populates="client", lazy="selectin")

    Index("ix_clients_deleted", deleted_at)

    def to_dict(self):
        return {
            "id": self.id, "first_name": self.first_name, "last_name": self.last_name,
            "email": self.email, "phone": self.phone, "document_id": self.document_id,
            "address": self.address, "notes": self.notes, "status": self.status,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String, primary_key=True, default=new_id)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False, index=True)
    destination = Column(String, nullable=False)
    travel_date = Column(String, default="")
    return_date = Column(String, default="")
    travelers = Column(Integer, default=1)
    amount = Column(Float, default=0)
    currency = Column(String, default="USD")
    notes = Column(Text, default="")
    client_notes = Column(Text, default="")  # mensajes del cliente: cambios solicitados, rechazo, etc.
    assigned_hotel = Column(String, default="")  # hotel assigned by advisor if client didn't specify
    room_type = Column(String, default="")  # tipo de habitación (ej: Doble Deluxe, Suite)
    services = Column(JSON, default=list)  # desglose por servicio [{name, price}, ...]
    deposit_percent = Column(Float, default=0)  # % de anticipo/seña a pagar
    hero_image = Column(String, default="")  # imagen personalizada del hero
    gallery_images = Column(JSON, default=list)  # carrusel de imágenes del destino
    dossier_id = Column(String, ForeignKey("dossiers.id"), nullable=True, index=True)
    code = Column(String, nullable=True, index=True)  # COT-2026-00001
    tax_percent = Column(Float, default=0)  # comisión extra sobre el total (solo interno)
    booking_price = Column(Float, nullable=True)  # comparison: Booking.com price
    expedia_price = Column(Float, nullable=True)  # comparison: Expedia price
    form_data = Column(JSON, default=dict)  # raw form submission data for public leads
    status = Column(String, nullable=False, default="borrador")  # borrador, enviada, aceptada, rechazada, expirada
    sent_via = Column(String, default="")
    sent_at = Column(String, default="")
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    client = relationship("Client", back_populates="quotations")
    dossier = relationship("Dossier", back_populates="quotations")

    def to_dict(self):
        return {
            "id": self.id, "client_id": self.client_id, "destination": self.destination,
            "travel_date": self.travel_date, "return_date": self.return_date,
            "travelers": self.travelers, "amount": self.amount, "currency": self.currency,
            "notes": self.notes,
            "client_notes": self.client_notes or "",
            "status": self.status,
            "assigned_hotel": self.assigned_hotel,
            "room_type": self.room_type,
            "services": self.services or [],
            "deposit_percent": self.deposit_percent,
            "hero_image": self.hero_image,
            "gallery_images": self.gallery_images or [],
            "dossier_id": self.dossier_id,
            "code": self.code or "",
            "tax_percent": self.tax_percent,
            "booking_price": self.booking_price, "expedia_price": self.expedia_price,
            "form_data": self.form_data or {},
            "sent_via": self.sent_via, "sent_at": self.sent_at,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, default=new_id)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False, index=True)
    quotation_id = Column(String, ForeignKey("quotations.id"), nullable=True)
    destination = Column(String, nullable=False)
    departure_date = Column(String, nullable=False)
    return_date = Column(String, nullable=False)
    travelers = Column(Integer, default=1)
    services = Column(Text, default="")
    notes = Column(Text, default="")
    total_amount = Column(Float, default=0)
    currency = Column(String, default="USD")
    status = Column(String, nullable=False, default="pendiente")  # pendiente, confirmada, pagada, en_viaje, finalizada, cancelada
    passengers = Column(JSON, default=list)
    documents = Column(JSON, default=list)
    dossier_id = Column(String, ForeignKey("dossiers.id"), nullable=True, index=True)
    code = Column(String, nullable=True, index=True)  # RES-2026-00001
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    client = relationship("Client", back_populates="reservations")
    dossier = relationship("Dossier", back_populates="reservations")
    payments = relationship("Payment", back_populates="reservation", lazy="selectin")

    def to_dict(self):
        return {
            "id": self.id, "client_id": self.client_id, "quotation_id": self.quotation_id,
            "destination": self.destination, "departure_date": self.departure_date,
            "return_date": self.return_date, "travelers": self.travelers,
            "services": self.services, "notes": self.notes,
            "total_amount": self.total_amount, "currency": self.currency,
            "status": self.status, "passengers": self.passengers or [],
            "documents": self.documents or [],
            "dossier_id": self.dossier_id,
            "code": self.code or "",
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=new_id)
    reservation_id = Column(String, ForeignKey("reservations.id"), nullable=False, index=True)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    method = Column(String, nullable=False)  # efectivo, tarjeta, transferencia, otro
    reference = Column(String, default="")
    payment_date = Column(String, default="")
    status = Column(String, nullable=False, default="completado")  # pendiente, completado, fallido, reembolsado
    notes = Column(Text, default="")
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    reservation = relationship("Reservation", back_populates="payments")
    client = relationship("Client", back_populates="payments")

    def to_dict(self):
        return {
            "id": self.id, "reservation_id": self.reservation_id, "client_id": self.client_id,
            "amount": self.amount, "method": self.method, "reference": self.reference,
            "payment_date": self.payment_date, "status": self.status, "notes": self.notes,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(String, primary_key=True, default=new_id)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    image_url = Column(String, default="")
    description = Column(Text, default="")
    status = Column(String, nullable=False, default="activo")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "country": self.country,
            "image_url": self.image_url, "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Package(Base):
    __tablename__ = "packages"

    id = Column(String, primary_key=True, default=new_id)
    name = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    duration_days = Column(Integer, default=1)
    description = Column(Text, default="")
    status = Column(String, nullable=False, default="activo")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "destination": self.destination,
            "price": self.price, "currency": self.currency,
            "duration_days": self.duration_days, "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Setting(Base):
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default="global")
    company_name = Column(String, default="Karabu Viajes")
    company_email = Column(String, default="")
    company_phone = Column(String, default="")
    company_address = Column(String, default="")
    logo_url = Column(String, default="")
    social_facebook = Column(String, default="")
    social_instagram = Column(String, default="")
    social_twitter = Column(String, default="")
    social_whatsapp = Column(String, default="")
    default_currency = Column(String, default="USD")
    tax_percent = Column(Float, default=0)
    smtp_host = Column(String, default="")
    smtp_port = Column(Integer, default=587)
    smtp_user = Column(String, default="")
    smtp_from = Column(String, default="")
    smtp_password = Column(String, default="")
    template_quotation = Column(Text, default="")
    template_reservation = Column(Text, default="")
    session_hours = Column(Integer, default=12)
    require_2fa = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {
            "id": self.id, "company_name": self.company_name,
            "company_email": self.company_email, "company_phone": self.company_phone,
            "company_address": self.company_address, "logo_url": self.logo_url,
            "social_facebook": self.social_facebook, "social_instagram": self.social_instagram,
            "social_twitter": self.social_twitter, "social_whatsapp": self.social_whatsapp,
            "default_currency": self.default_currency, "tax_percent": self.tax_percent,
            "smtp_host": self.smtp_host, "smtp_port": self.smtp_port,
            "smtp_user": self.smtp_user, "smtp_from": self.smtp_from,
            "smtp_password": "••••••" if self.smtp_password else "",
            "template_quotation": self.template_quotation,
            "template_reservation": self.template_reservation,
            "session_hours": self.session_hours, "require_2fa": self.require_2fa,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# ==================== GEO: Paises, Ciudades, Lugares ====================

class Pais(Base):
    __tablename__ = "paises"

    id = Column(String, primary_key=True, default=new_id)
    pais = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    ciudades = relationship("Ciudad", back_populates="pais", lazy="selectin")

    def to_dict(self):
        return {"id": self.id, "pais": self.pais}


class Ciudad(Base):
    __tablename__ = "ciudades"

    id = Column(String, primary_key=True, default=new_id)
    ciudad = Column(String, nullable=False)
    id_pais = Column(String, ForeignKey("paises.id"), nullable=False, index=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    pais = relationship("Pais", back_populates="ciudades")
    lugares = relationship("Lugar", back_populates="ciudad", lazy="selectin")

    def to_dict(self):
        return {
            "id": self.id, "ciudad": self.ciudad, "id_pais": self.id_pais,
            "lat": self.lat, "lon": self.lon,
        }


class Lugar(Base):
    __tablename__ = "lugares"

    id = Column(String, primary_key=True, default=new_id)
    nombre = Column(String, nullable=False)
    direccion_especifica = Column(String, nullable=True)
    id_ciudad = Column(String, ForeignKey("ciudades.id"), nullable=False, index=True)
    categoria = Column(String, default="accommodation.hotel")
    rating = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    ciudad = relationship("Ciudad", back_populates="lugares")

    def to_dict(self):
        return {
            "id": self.id, "nombre": self.nombre,
            "direccion_especifica": self.direccion_especifica,
            "id_ciudad": self.id_ciudad,
            "categoria": self.categoria,
            "rating": self.rating,
        }


class Dossier(Base):
    __tablename__ = "dossiers"

    id = Column(String, primary_key=True, default=new_id)
    code = Column(String, unique=True, nullable=False, index=True)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False, index=True)
    status = Column(String, nullable=False, default="abierto")
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)

    client = relationship("Client")
    quotations = relationship("Quotation", back_populates="dossier", lazy="selectin")
    reservations = relationship("Reservation", back_populates="dossier", lazy="selectin")

    def to_dict(self):
        return {
            "id": self.id, "code": self.code,
            "client_id": self.client_id, "status": self.status,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=new_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # new_lead, accepted, rejected, payment, upcoming_trip, assigned, converted, regret
    title = Column(String, nullable=False)
    message = Column(Text, default="")
    link = Column(String, default="")  # e.g. /admin/cotizaciones/{id}
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "link": self.link,
            "read": self.read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Upload(Base):
    """Stores uploaded files in the database (bypasses ephemeral Render filesystem)."""
    __tablename__ = "uploads"

    id = Column(String, primary_key=True, default=new_id)
    filename = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    data = Column(Text, nullable=False)  # base64-encoded file content
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "mime_type": self.mime_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
