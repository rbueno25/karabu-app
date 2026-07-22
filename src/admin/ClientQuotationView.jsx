import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import StatusBadge from "./StatusBadge";
import { formatDate, formatCurrency } from "../lib/format";
import { toast } from "sonner";
import { 
  Loader2, Calendar, Users, DollarSign, CheckCircle, 
  XCircle, Send, User, Mail, Phone, Info
} from "lucide-react";

// Image matching helper based on destination name
const DESTINATION_IMAGES = [
  { keywords: ["punta cana", "dominicana", "bavaro"], url: "https://images.unsplash.com/photo-1548889291-1f5abf8d8f64?w=1000", desc: "Playa caribeña en Punta Cana" },
  { keywords: ["orlando", "disney", "universal"], url: "https://images.unsplash.com/photo-1560986992-f7e5b1c1f909?w=1000", desc: "Diversión en Orlando" },
  { keywords: ["cancun", "mexico", "riviera maya"], url: "https://images.unsplash.com/photo-1571281100235-ecb6e9e7bcf8?w=1000", desc: "Playa de Cancún" },
  { keywords: ["miami", "south beach"], url: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1000", desc: "Ocean Drive en Miami" },
  { keywords: ["nueva york", "new york", "manhattan"], url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1000", desc: "Rascacielos de Nueva York" },
  { keywords: ["paris", "francia", "torre eiffel"], url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000", desc: "Torre Eiffel en París" },
  { keywords: ["roma", "italia", "coliseo"], url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1000", desc: "Coliseo Romano" },
  { keywords: ["buenos aires", "argentina"], url: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1000", desc: "El Obelisco de Buenos Aires" },
  { keywords: ["cusco", "peru", "machu"], url: "https://images.unsplash.com/photo-1587595421960-47cbab8a2b58?w=1000", desc: "Machu Picchu en Cusco" },
  { keywords: ["toronto", "canada"], url: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=1000", desc: "CN Tower de Toronto" }
];

const getDestinationImage = (destName = "") => {
  const norm = destName.toLowerCase();
  const match = DESTINATION_IMAGES.find(d => d.keywords.some(k => norm.includes(k)));
  return match ? match.url : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000";
};

export default function ClientQuotationView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Client decisions
  const [status, setStatus] = useState("idle"); // idle, accepted, rejecting, rejected
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadQuotation = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quotations/${id}`);
      setData(res.data);
      if (res.data.quotation.status === "aceptada") setStatus("accepted");
      if (res.data.quotation.status === "rechazada") setStatus("rejected");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar la propuesta de viaje");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotation();
    // eslint-disable-next-line
  }, [id]);

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const body = {
        client_id: data.quotation.client_id,
        destination: data.quotation.destination,
        travel_date: data.quotation.travel_date,
        return_date: data.quotation.return_date,
        travelers: Number(data.quotation.travelers),
        amount: Number(data.quotation.amount),
        currency: data.quotation.currency,
        notes: data.quotation.notes,
        status: "aceptada",
        sent_via: data.quotation.sent_via,
        sent_at: data.quotation.sent_at
      };
      await api.put(`/quotations/${id}`, body);
      setStatus("accepted");
      toast.success("¡Propuesta aceptada con éxito!");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al aceptar la propuesta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error("Por favor ingresa tus comentarios");
      return;
    }
    setSubmitting(true);
    try {
      const fullNotes = data.quotation.notes 
        ? `${data.quotation.notes}\n\n[Comentario de rechazo del cliente]: ${comments}`
        : `[Comentario de rechazo del cliente]: ${comments}`;

      const body = {
        client_id: data.quotation.client_id,
        destination: data.quotation.destination,
        travel_date: data.quotation.travel_date,
        return_date: data.quotation.return_date,
        travelers: Number(data.quotation.travelers),
        amount: Number(data.quotation.amount),
        currency: data.quotation.currency,
        notes: fullNotes,
        status: "rechazada",
        sent_via: data.quotation.sent_via,
        sent_at: data.quotation.sent_at
      };
      await api.put(`/quotations/${id}`, body);
      setStatus("rejected");
      toast.success("Comentarios enviados. Tu asesor ajustará la propuesta.");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al enviar comentarios");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center text-gray-500 flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="font-medium text-sm">Cargando propuesta de viaje…</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[16px] border border-gray-200 p-8 text-center shadow-sm">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Enlace Inválido</h3>
          <p className="text-sm text-gray-500 mt-2">La propuesta de viaje solicitada no existe o ha sido dada de baja del sistema.</p>
        </div>
      </div>
    );
  }

  const { quotation, client, broker } = data;
  const imageUrl = getDestinationImage(quotation.destination);

  return (
    <div data-testid="client-quotation-view-page" className="min-h-screen bg-gray-50 text-gray-800 flex flex-col antialiased">
      {/* Navbar Premium */}
      <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        <div className="text-lg font-extrabold tracking-wider text-gray-950 flex items-center gap-2">
          <span className="bg-blue-600 text-white px-2.5 py-1 rounded-[6px] text-xs font-black">K</span>
          <span>KARABU VIAJES</span>
        </div>
        <div className="text-xs font-semibold text-gray-400">PROPUESTA DIGITAL</div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Banner de Bienvenida */}
        <div className="bg-white border border-gray-250 rounded-[16px] p-6 md:p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">¡Hola, {client.first_name}!</span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Hemos preparado tu viaje soñado a {quotation.destination}</h2>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            A continuación, encontrarás el itinerario, las condiciones generales y el costo estimado de la propuesta. Recuerda que puedes aceptarla o solicitar cambios directamente desde esta página.
          </p>
        </div>

        {/* Imagen del Destino */}
        <div className="h-64 md:h-80 w-full rounded-[16px] overflow-hidden relative shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-gray-200">
          <img src={imageUrl} alt={quotation.destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/20 to-transparent flex items-end p-6 md:p-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 block mb-1">Destino Propuesto</span>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{quotation.destination}</h1>
            </div>
          </div>
        </div>

        {/* Detalles en Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Detalle 1: Fechas */}
          <div className="bg-white rounded-[16px] border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-start gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-[10px] shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Fechas del Viaje</span>
              <span className="text-sm font-semibold text-gray-800 block">Salida: {formatDate(quotation.travel_date)}</span>
              <span className="text-sm font-semibold text-gray-800 block">Regreso: {formatDate(quotation.return_date)}</span>
            </div>
          </div>

          {/* Card Detalle 2: Personas */}
          <div className="bg-white rounded-[16px] border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-start gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-[10px] shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Viajeros</span>
              <span className="text-sm font-semibold text-gray-800 block">{quotation.travelers} {quotation.travelers === 1 ? 'persona' : 'personas'} cotizadas</span>
            </div>
          </div>

          {/* Card Detalle 3: Precio */}
          <div className="bg-white rounded-[16px] border border-gray-200 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-start gap-4">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-[10px] shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Precio Total</span>
              <span className="text-lg font-bold text-gray-900 block leading-tight">
                {formatCurrency(quotation.amount, quotation.currency)}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">{quotation.currency} total de impuestos incluidos</span>
            </div>
          </div>
        </div>

        {/* Especificaciones / Itinerario */}
        <div className="bg-white rounded-[16px] border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" /> Especificaciones de tu Viaje
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {quotation.notes || "No se especificaron detalles adicionales. Por favor contacta a tu asesor para armar el plan detallado."}
          </p>
        </div>

        {/* Broker Information */}
        <div className="bg-white rounded-[16px] border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
            {broker.name[0]}
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Tu Asesor de Viajes</span>
            <h4 className="text-sm font-bold text-gray-900">{broker.name}</h4>
            <div className="flex gap-4 mt-0.5 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {broker.email}</span>
              {client.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {broker.name ? "Karabu Office" : ""}</span>}
            </div>
          </div>
        </div>

        {/* Decision Panel */}
        <div className="bg-white rounded-[16px] border border-gray-200 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] text-center">
          {status === "idle" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">¿Qué te parece esta propuesta?</h3>
              <p className="text-xs text-gray-500">Puedes aceptarla o pedirle a tu asesor que la modifique.</p>
              
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => setStatus("rejecting")}
                  data-testid="proposal-reject-btn"
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  <XCircle className="h-4 w-4 text-red-500" /> Solicitar Cambios
                </button>
                <button
                  onClick={handleAccept}
                  disabled={submitting}
                  data-testid="proposal-accept-btn"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Aceptar Propuesta
                </button>
              </div>
            </div>
          )}

          {/* Accepted State */}
          {status === "accepted" && (
            <div className="py-4 space-y-3" data-testid="success-message">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">¡Propuesta Aceptada!</h3>
              <p className="text-sm text-gray-650 max-w-md mx-auto">
                Has aceptado la propuesta de viaje. Tu asesor, <strong>{broker.name}</strong>, se pondrá en contacto contigo en breve para proceder con la reserva y concretar el pago.
              </p>
            </div>
          )}

          {/* Rejecting Form State */}
          {status === "rejecting" && (
            <form onSubmit={handleReject} className="space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="text-sm font-bold text-gray-900">¿Qué te gustaría cambiar?</h4>
                <button 
                  type="button" 
                  onClick={() => setStatus("idle")} 
                  className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
                >
                  Cancelar
                </button>
              </div>
              <p className="text-xs text-gray-500">Por favor, escribe de forma detallada qué cambios prefieres (ej: cambio de fechas, categoría de hotel, aerolínea, o ajuste de presupuesto).</p>
              
              <textarea
                data-testid="reject-comments-textarea"
                required
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Escribe tus comentarios aquí..."
                className="w-full rounded-[10px] border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-[10px] hover:bg-gray-50"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="reject-submit-btn"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar Comentarios
                </button>
              </div>
            </form>
          )}

          {/* Rejected State */}
          {status === "rejected" && (
            <div className="py-4 space-y-3">
              <CheckCircle className="h-12 w-12 text-blue-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900">Comentarios Enviados</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Hemos enviado tus comentarios de ajuste a tu asesor <strong>{broker.name}</strong>. Se comunicará contigo para presentarte una propuesta modificada.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
