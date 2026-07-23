import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import StatusBadge from "./StatusBadge";
import { formatDate, formatCurrency } from "../lib/format";
import { toast } from "sonner";
import { 
  Loader2, Calendar, Users, DollarSign, CheckCircle2, 
  XCircle, Send, User, Mail, Phone, Info, FileText,
  RotateCcw, HeartHandshake, ShieldCheck, AlertCircle,
  Sparkles, MessageSquare, Compass, MapPin, Briefcase,
  Hotel, CreditCard, Tag
} from "lucide-react";

// Image matching helper based on destination name
const DESTINATION_IMAGES = [
  { keywords: ["punta cana", "dominicana", "bavaro"], url: "https://images.unsplash.com/photo-1548889291-1f5abf8d8f64?w=1200&fit=crop" },
  { keywords: ["orlando", "disney", "universal"], url: "https://images.unsplash.com/photo-1560986992-f7e5b1c1f909?w=1200&fit=crop" },
  { keywords: ["cancun", "mexico", "riviera maya"], url: "https://images.unsplash.com/photo-1571281100235-ecb6e9e7bcf8?w=1200&fit=crop" },
  { keywords: ["miami", "south beach"], url: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1200&fit=crop" },
  { keywords: ["nueva york", "new york", "manhattan"], url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&fit=crop" },
  { keywords: ["paris", "francia", "torre eiffel"], url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&fit=crop" },
  { keywords: ["roma", "italia", "coliseo"], url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&fit=crop" },
  { keywords: ["buenos aires", "argentina"], url: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&fit=crop" },
  { keywords: ["cusco", "peru", "machu"], url: "https://images.unsplash.com/photo-1587595421960-47cbab8a2b58?w=1200&fit=crop" },
  { keywords: ["toronto", "canada"], url: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=1200&fit=crop" }
];

const getDestinationImage = (destName = "") => {
  const norm = destName.toLowerCase();
  const match = DESTINATION_IMAGES.find(d => d.keywords.some(k => norm.includes(k)));
  return match ? match.url : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&fit=crop";
};

export default function ClientQuotationView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Client decisions
  const [mode, setMode] = useState("idle"); // idle | requesting_changes
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionType, setActionType] = useState(null); // accept | reject

  const loadQuotation = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quotations/${id}`);
      setData(res.data);
      if (res.data.quotation.status === "aceptada") setMode("accepted");
      if (res.data.quotation.status === "rechazada") setMode("rejected");
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
    setActionType("accept");
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
      setMode("accepted");
      toast.success("¡Propuesta aceptada con éxito!");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al aceptar la propuesta");
    } finally {
      setSubmitting(false);
      setActionType(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error("Por favor ingresa tus comentarios");
      return;
    }
    setSubmitting(true);
    setActionType("reject");
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
      setMode("rejected");
      toast.success("Comentarios enviados. Tu asesor ajustará la propuesta.");
      setComments("");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al enviar comentarios");
    } finally {
      setSubmitting(false);
      setActionType(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070F1E] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center animate-pulse">
            <Compass className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Cargando tu propuesta de viaje...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Obteniendo detalles de Karabu Viajes</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070F1E] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#0D1B2A] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xl">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enlace Inválido</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">La propuesta de viaje solicitada no existe o ha sido dada de baja.</p>
        </div>
      </div>
    );
  }

  const { quotation, client, broker } = data;
  const imageUrl = getDestinationImage(quotation.destination);
  const formData = quotation.form_data;
  const isFinal = mode === "accepted" || mode === "rejected";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">

      {/* ── Navbar Premium ── */}
      <nav className="bg-white/90 dark:bg-[#0D1B2A]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="bg-brand-turquoise text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black">K</span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            KARABU <span className="text-brand-turquoise">VIAJES</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge value={quotation.status} />
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Propuesta Digital</span>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 1. Hero Banner */}
        <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-xl shadow-brand-navy/10">
          <img src={imageUrl} alt={quotation.destination} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-turquoise/20 text-brand-turquoise backdrop-blur-sm mb-2">
              <MapPin className="w-3 h-3" /> Destino Propuesto
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{quotation.destination}</h1>
          </div>
        </div>

        {/* 2. Welcome Banner */}
        <div className="bg-white dark:bg-[#0D1B2A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-turquoise block mb-2">¡Hola, {client.first_name}!</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Hemos preparado tu viaje soñado a {quotation.destination}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            A continuación encuentras el itinerario, las condiciones y el costo estimado. Puedes aceptarla o solicitar cambios directamente desde esta página.
          </p>
        </div>

        {/* 3. Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Fechas */}
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 flex items-start gap-4 shadow-sm">
            <div className="p-2.5 bg-brand-turquoise/10 text-brand-turquoise rounded-xl shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Fechas del Viaje</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block">Salida: {formatDate(quotation.travel_date)}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block">Regreso: {formatDate(quotation.return_date)}</span>
            </div>
          </div>

          {/* Viajeros */}
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 flex items-start gap-4 shadow-sm">
            <div className="p-2.5 bg-brand-turquoise/10 text-brand-turquoise rounded-xl shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Viajeros</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                {quotation.travelers} {quotation.travelers === 1 ? 'persona' : 'personas'} cotizadas
              </span>
            </div>
          </div>

          {/* Precio */}
          <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl border-2 border-brand-turquoise/30 dark:border-brand-turquoise/40 p-5 flex items-start gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-turquoise to-brand-orange" />
            <div className="p-2.5 bg-brand-turquoise text-white rounded-xl shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Precio Total</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white block leading-tight">
                {formatCurrency(quotation.amount, quotation.currency)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{quotation.currency} impuestos incluidos</span>
            </div>
          </div>
        </div>

        {/* 4. Form Data Details (si vino del form web) */}
        {formData && Object.keys(formData).length > 0 && (
          <div className="bg-white dark:bg-[#0D1B2A] rounded-3xl border border-brand-turquoise/20 dark:border-brand-turquoise/30 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Detalles de tu Solicitud</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Información enviada en el formulario de cotización</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {formData.fullName && (
                <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Nombre" value={formData.fullName} />
              )}
              {formData.email && (
                <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={formData.email} />
              )}
              {formData.phone && (
                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Teléfono" value={formData.phone} />
              )}
              {formData.adultsCount !== undefined && (
                <InfoRow icon={<Users className="w-3.5 h-3.5" />} label="Viajeros" 
                  value={`${formData.adultsCount} adultos${formData.childrenCount > 0 ? `, ${formData.childrenCount} niños` : ''}${formData.babiesCount > 0 ? `, ${formData.babiesCount} bebés` : ''}`} />
              )}
              {formData.budgetRange && (
                <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Presupuesto" value={formData.budgetRange} dark />
              )}
              {formData.travelType && (
                <InfoRow icon={<Briefcase className="w-3.5 h-3.5" />} label="Tipo de viaje" value={formData.travelType} />
              )}
              {formData.hotelCategory && (
                <InfoRow icon={<Hotel className="w-3.5 h-3.5" />} label="Categoría hotel" value={formData.hotelCategory} />
              )}
              {formData.preferredHotel && (
                <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Hotel preferido" value={formData.preferredHotel} />
              )}
              {formData.flexibleDates && (
                <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Fechas flexibles" value={formData.flexibleDates} />
              )}
              {formData.preferredContact && (
                <InfoRow icon={<Send className="w-3.5 h-3.5" />} label="Recibir por" 
                  value={formData.preferredContact === 'ambos' ? 'Email y WhatsApp' : formData.preferredContact} />
              )}
            </div>
            {formData.additionalServices?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">Servicios requeridos</span>
                <div className="flex flex-wrap gap-2">
                  {formData.additionalServices.map((s, i) => (
                    <span key={i} className="bg-brand-turquoise/10 text-brand-turquoise text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.comments && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Comentarios adicionales</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">"{formData.comments}"</p>
              </div>
            )}
          </div>
        )}

        {/* 5. Notas / Especificaciones */}
        <div className="bg-white dark:bg-[#0D1B2A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-brand-navy dark:bg-white/10 text-white flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Resumen de la Propuesta</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Especificaciones redactadas por tu asesor</p>
            </div>
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            {quotation.notes || "No se han incluido especificaciones adicionales. Por favor contacta a tu asesor para más detalles."}
          </div>
        </div>

        {/* 6. Broker Card */}
        <div className="bg-white dark:bg-[#0D1B2A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 flex items-center gap-4 flex-wrap shadow-sm">
          <div className="h-12 w-12 rounded-full bg-brand-turquoise/10 text-brand-turquoise flex items-center justify-center font-bold text-lg shrink-0">
            {broker.name[0]}
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Tu Asesor de Viajes</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{broker.name}</h4>
            <div className="flex gap-4 mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {broker.email}</span>
            </div>
          </div>
        </div>

        {/* 7. Decision Panel */}
        <div className="w-full rounded-3xl bg-gradient-to-b from-white via-white to-slate-50 dark:from-[#0D1B2A] dark:via-[#0D1B2A] dark:to-[#070F1E] border-2 border-brand-turquoise/30 dark:border-brand-turquoise/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative top bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-turquoise via-brand-orange to-brand-navy" />

          <div className="max-w-2xl mx-auto text-center space-y-5">

            {/* Title */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-turquoise/10 text-brand-turquoise mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Panel de Decisión
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                ¿Qué deseas hacer con esta propuesta?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-1.5">
                Revisa los detalles y elige una opción. Tu asesor recibirá la confirmación en tiempo real.
              </p>
            </div>

            {/* Accepted State */}
            {mode === "accepted" && (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">¡Propuesta Aceptada con Éxito!</h3>
                <p className="text-xs sm:text-sm max-w-md mx-auto text-emerald-800 dark:text-emerald-200">
                  Hemos registrado tu aceptación. Tu asesor se pondrá en contacto contigo para coordinar los detalles finales.
                </p>
                <button
                  onClick={() => { setMode("requesting_changes"); setComments(""); }}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline inline-flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> ¿Necesitas agregar algún cambio posterior?
                </button>
              </div>
            )}

            {/* Rejected State */}
            {mode === "rejected" && (
              <div className="p-6 rounded-2xl bg-brand-orange/10 border border-brand-orange/30 text-brand-orange space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-brand-orange text-white flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Solicitud de Cambios Enviada</h3>
                <p className="text-xs sm:text-sm max-w-md mx-auto text-slate-700 dark:text-slate-300">
                  Tus comentarios han sido notificados a tu asesor. Revisará tus preferencias y te enviará una propuesta ajustada.
                </p>
                <button
                  onClick={handleAccept}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-turquoise hover:bg-[#008F80] transition shadow-md disabled:opacity-50"
                >
                  {submitting && actionType === "accept" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Cambiar de opinión y Aceptar
                </button>
              </div>
            )}

            {/* IDLE MODE: 2 Botones principales */}
            {mode === "idle" && (
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
                {/* ✅ ACEPTAR */}
                <button
                  onClick={handleAccept}
                  disabled={submitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-brand-turquoise to-[#02C39A] hover:from-[#008F80] hover:to-brand-turquoise shadow-lg shadow-brand-turquoise/25 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {submitting && actionType === "accept" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> ACEPTAR PROPUESTA</>
                  )}
                </button>

                {/* ❌ SOLICITAR CAMBIOS */}
                <button
                  onClick={() => setMode("requesting_changes")}
                  disabled={submitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 sm:px-8 py-3.5 rounded-2xl font-bold text-sm text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 border border-brand-orange/30 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" /> SOLICITAR CAMBIOS
                </button>
              </div>
            )}

            {/* REQUESTING CHANGES: Textarea + Enviar + Cancelar */}
            {mode === "requesting_changes" && !isFinal && (
              <form onSubmit={handleReject} className="pt-2 text-left space-y-4 max-w-xl mx-auto">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-orange" />
                    ¿Qué cambios deseas realizar?
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Escribe aquí tus observaciones (ej. ajustar fechas, cambiar hotel, modificar presupuesto)..."
                    rows={4}
                    required
                    className="w-full p-3 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange transition"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => { setMode("idle"); setComments(""); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Volver
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !comments.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-orange hover:bg-[#E85A24] shadow-md transition disabled:opacity-50"
                    >
                      {submitting && actionType === "reject" ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Enviar Comentarios</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Trust notice */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-brand-turquoise" />
                Al aceptar o solicitar cambios, tu asesor recibirá una notificación instantánea sin compromisos ocultos.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1B2A] py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-white">
              KARABU <span className="text-brand-turquoise">VIAJES</span>
            </span>
            <span>— Propuesta Digital de Viaje</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-brand-turquoise" />
            <span>Documento seguro · Karabu Cloud</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper: info row with icon
function InfoRow({ icon, label, value, dark }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
      <span className="text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">{label}</span>
        <span className={`text-sm font-semibold truncate block ${dark ? 'text-brand-turquoise' : 'text-slate-900 dark:text-white'}`}>{value}</span>
      </div>
    </div>
  );
}
