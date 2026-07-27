import React, { useState } from 'react';
import {
  MapPin, Calendar, Users, Building2, Bed, CreditCard,
  CheckCircle2, XCircle, Send, Loader2, Sparkles,
  ShieldCheck, Clock, MessageSquare, RotateCcw, HeartHandshake
} from 'lucide-react';

const FALLBACK_IMAGE = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80`;

const DESTINOS_LOCALES = {
  'punta cana': '/destinos/punta-cana.jpg',
  'republica dominicana': '/destinos/Republica-Dominicana.jpg',
  'república dominicana': '/destinos/Republica-Dominicana.jpg',
  'miami': '/destinos/Miami.jpg',
  'new york': '/destinos/New York.jpg',
  'nueva york': '/destinos/New York.jpg',
  'orlando': '/destinos/Orlando.jpg',
  'cancun': '/destinos/Cancun.jpg',
  'cancún': '/destinos/Cancun.jpg',
  'bogota': '/destinos/Bogotá.jpg',
  'bogotá': '/destinos/Bogotá.jpg',
  'paris': '/destinos/Paris.jpg',
  'parís': '/destinos/Paris.jpg',
};

function getHeroImage(quotation) {
  if (quotation.gallery_images && quotation.gallery_images.length > 0) {
    return quotation.gallery_images[0];
  }
  if (quotation.destination) {
    const normalized = quotation.destination.toLowerCase().trim();
    const match = DESTINOS_LOCALES[normalized];
    if (match) return match;
    for (const [key, path] of Object.entries(DESTINOS_LOCALES)) {
      if (normalized.includes(key)) return path;
    }
  }
  if (quotation.destination) {
    return `https://source.unsplash.com/1600x900/?travel,${encodeURIComponent(quotation.destination)}`;
  }
  return FALLBACK_IMAGE;
}

export function HeroBanner({ data, onUpdateStatus }) {
  const { quotation, client } = data;
  const formData = quotation.form_data || {};

  const [mode, setMode] = useState('idle');
  const [rejectionComment, setRejectionComment] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const heroImage = getHeroImage(quotation);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  const calculateNights = (start, end) => {
    if (!start || !end) return null;
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(quotation.travel_date, quotation.return_date);
  const roomType = formData.hotelCategory || null;
  const hotelName = quotation.assigned_hotel || formData.preferredHotel || null;
  const adults = formData.adultsCount ?? quotation.travelers;
  const children = formData.childrenCount ?? 0;
  const babies = formData.babiesCount ?? 0;
  const hasBreakdown = formData.adultsCount !== undefined;

  const handleAccept = async () => {
    try {
      setLoadingAction('accept');
      setFeedbackMessage(null);
      await onUpdateStatus({ status: 'aceptada' });
      setFeedbackMessage('Propuesta aceptada. Tu asesor te contactará pronto.');
    } catch {
      setFeedbackMessage('Error al aceptar. Intenta de nuevo.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSendChanges = async (e) => {
    e.preventDefault();
    if (!rejectionComment.trim()) return;
    try {
      setLoadingAction('reject');
      setFeedbackMessage(null);
      await onUpdateStatus({
        status: 'rechazada',
        notes: `[Cambios solicitados]: ${rejectionComment.trim()}`
      });
      setFeedbackMessage('Cambios enviados. Tu asesor ajustará la propuesta.');
      setMode('idle');
      setRejectionComment('');
    } catch {
      setFeedbackMessage('Error al enviar. Intenta de nuevo.');
    } finally {
      setLoadingAction(null);
    }
  };

  const isAccepted = quotation.status === 'aceptada';
  const isRejected = quotation.status === 'rechazada';

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-end overflow-hidden rounded-b-2xl sm:rounded-b-3xl">
      {/* Full-screen background image — LA IMAGEN SE VE */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={quotation.destination}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 hover:scale-100"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        {/* Overlay sutil: más oscuro abajo, translúcido arriba — la imagen sigue visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      </div>

      {/* Contenido flotando encima */}
      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 pb-8 sm:pb-12 space-y-6">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-[#00A896]" />
            Propuesta Exclusiva
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md border border-white/10 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A896]" />
            Garantía Karabu
          </div>
        </div>

        {/* Saludo + destino */}
        <div className="max-w-3xl">
          <p className="text-sm sm:text-base font-semibold tracking-wide text-[#00A896] uppercase mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Destino Seleccionado
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-lg">
            ¡Hola {client.first_name}!
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-200 mt-2 leading-relaxed drop-shadow-md">
            Hemos preparado tu itinerario personalizado a{' '}
            <span className="text-white font-bold underline decoration-[#00A896] decoration-2 underline-offset-4">
              {quotation.destination}
            </span>
          </p>
        </div>

        {/* Barra de datos — semi-transparente, la imagen se ve detrás */}
        <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fechas */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/10 text-[#00A896] border border-white/10 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Fechas</p>
              <p className="text-sm font-semibold text-white">Ida: {formatDate(quotation.travel_date)}</p>
              <p className="text-sm font-semibold text-white">Vuelta: {formatDate(quotation.return_date)}</p>
              {nights && <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3 text-[#00A896]" />{nights} {nights === 1 ? 'noche' : 'noches'}</p>}
            </div>
          </div>

          {/* Hotel + Tipo habitación */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/10 text-amber-400 border border-white/10 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Hospedaje</p>
              {hotelName ? (
                <p className="text-sm font-semibold text-white">{hotelName}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">Por confirmar</p>
              )}
              {roomType && (
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <Bed className="w-3 h-3 text-[#00A896]" />{roomType}
                </p>
              )}
            </div>
          </div>

          {/* Viajeros */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/10 text-sky-400 border border-white/10 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Viajeros</p>
              <p className="text-sm font-semibold text-white">{quotation.travelers} {quotation.travelers === 1 ? 'Pasajero' : 'Pasajeros'}</p>
              {hasBreakdown && (
                <p className="text-xs text-slate-300 mt-0.5">
                  {adults > 0 && `${adults} adulto${adults !== 1 ? 's' : ''}`}
                  {children > 0 && `, ${children} niño${children !== 1 ? 's' : ''}`}
                  {babies > 0 && `, ${babies} bebé${babies !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
          </div>

          {/* Precio total + por persona */}
          <div className="flex items-center justify-between sm:justify-start gap-3 lg:border-l lg:border-white/15 lg:pl-4">
            <div>
              <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Inversión Total</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">${quotation.amount.toLocaleString()}</span>
                <span className="text-xs font-semibold text-[#00A896]">{quotation.currency}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ${(quotation.amount / quotation.travelers).toLocaleString(undefined, { maximumFractionDigits: 0 })} {quotation.currency} / persona
              </p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedbackMessage && (
          <div className={`p-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
            feedbackMessage.includes('aceptada')
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-[#FF6B35]/20 text-orange-300 border border-[#FF6B35]/30'
          }`}>
            {feedbackMessage.includes('aceptada')
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <XCircle className="w-4 h-4 shrink-0" />}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Botones — SIN MODAL */}
        {!isAccepted && !isRejected && mode === 'idle' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleAccept}
              disabled={loadingAction !== null}
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-[#00A896] to-[#02C39A] hover:from-[#008F80] hover:to-[#00A896] shadow-lg shadow-[#00A896]/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loadingAction === 'accept'
                ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Procesando...</span></>
                : <><CheckCircle2 className="w-5 h-5" /><span>ACEPTAR PROPUESTA</span></>}
            </button>
            <button
              onClick={() => setMode('requesting_changes')}
              disabled={loadingAction !== null}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-bold text-sm text-[#FF6B35] bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <XCircle className="w-5 h-5" /><span>SOLICITAR CAMBIOS</span>
            </button>
          </div>
        )}

        {/* Aceptada — inline, sin popup */}
        {isAccepted && mode === 'idle' && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
            <p className="text-sm font-bold">¡Propuesta Aceptada!</p>
            <p className="text-xs text-emerald-400/80">Tu asesor se pondrá en contacto contigo para coordinar los detalles finales.</p>
          </div>
        )}

        {/* Rechazada */}
        {isRejected && mode === 'idle' && (
          <div className="p-4 rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-orange-300 text-center space-y-3">
            <XCircle className="w-8 h-8 mx-auto text-[#FF6B35]" />
            <p className="text-sm font-bold">Cambios Solicitados</p>
            <p className="text-xs text-orange-400/80">Tu asesor está revisando tus comentarios y ajustará la propuesta.</p>
            <button
              onClick={handleAccept}
              disabled={loadingAction === 'accept'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00A896] hover:bg-[#008F80] transition shadow-md"
            >
              {loadingAction === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Aceptar de todas formas
            </button>
          </div>
        )}

        {/* Formulario de cambios */}
        {mode === 'requesting_changes' && (
          <form onSubmit={handleSendChanges} className="space-y-3">
            <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF6B35]" />¿Qué cambios deseas?
              </label>
              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Ej: ajustar fechas, cambiar hotel, agregar excursiones..."
                rows={3}
                required
                className="w-full p-3 rounded-xl text-sm bg-black/40 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] placeholder:text-slate-500 transition"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => { setMode('idle'); setRejectionComment(''); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/20 border border-white/10 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />Volver
                </button>
                <button
                  type="submit"
                  disabled={loadingAction === 'reject' || !rejectionComment.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#E85A24] shadow-md transition disabled:opacity-50"
                >
                  {loadingAction === 'reject'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Enviando...</span></>
                    : <><Send className="w-4 h-4" /><span>Enviar Cambios</span></>}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Nota sutil */}
        <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-[#00A896]" />
          Sin compromisos ocultos. Tu asesor recibe notificación instantánea.
        </p>
      </div>
    </div>
  );
}
