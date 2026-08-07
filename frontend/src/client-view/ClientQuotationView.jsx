import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { getQuotation, updateQuotationStatus } from './api-adapter';
import {
  Compass, Loader2, AlertCircle, RefreshCw, ShieldCheck,
  CheckCircle2, Calendar, Building2, Users, CreditCard,
  DollarSign, Sun, Moon, ArrowDown, RotateCcw, Check, Plane,
  Car, Share2, MapPin, Sparkles, MessageSquare, Send, Award,
  Phone, Mail, Bed, Clock
} from 'lucide-react';

export default function ClientQuotationView() {
  const getInitialId = () => {
    const hash = window.location.hash;
    const match = hash.match(/#\/(?:cotizacion|entregable)\/([^/?]+)/);
    if (match && match[1]) return match[1];
    return '';
  };

  const [currentId, setCurrentId] = useState(getInitialId());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const loadQuotationData = async (idToFetch) => {
    setLoading(true); setError(null);
    try { const result = await getQuotation(idToFetch); setData(result); }
    catch (err) { setError(err.message || 'Error al cargar la propuesta'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (currentId) loadQuotationData(currentId); }, [currentId]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) { navigator.clipboard.writeText(url); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 3000); }
  };

  const handleDirectAccept = async () => {
    setIsSubmitting(true); setInlineFeedback(null);
    try {
      await updateQuotationStatus(currentId, { status: 'aceptada', notes: 'Propuesta aceptada directamente por el cliente.' });
      if (data) setData((prev) => ({ ...prev, quotation: { ...prev.quotation, status: 'aceptada' } }));
      setShowChangeForm(false);
      setInlineFeedback({ type: 'success', message: '¡Propuesta ACEPTADA! Tu asesor te contactará para coordinar los detalles.' });
    } catch (err) {
      setInlineFeedback({ type: 'error', message: 'No se pudo procesar: ' + err.message });
    } finally { setIsSubmitting(false); }
  };

  const handleSubmitChanges = async (e) => {
    e.preventDefault();
    if (!changeNotes.trim()) return;
    setIsSubmitting(true); setInlineFeedback(null);
    try {
      await updateQuotationStatus(currentId, { status: 'cambios_solicitados', notes: changeNotes });
      if (data) setData((prev) => ({ ...prev, quotation: { ...prev.quotation, status: 'cambios_solicitados', notes: changeNotes } }));
      setShowChangeForm(false);
      setInlineFeedback({ type: 'info', message: 'Solicitud de cambios enviada. Tu asesor ajustará la propuesta.' });
    } catch (err) {
      setInlineFeedback({ type: 'error', message: 'Error: ' + err.message });
    } finally { setIsSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F2A4A] flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-[#0D9387]/20 text-[#0D9387] flex items-center justify-center animate-pulse mb-4 border border-[#0D9387]/30 shadow-2xl">
          <Compass className="w-8 h-8 animate-spin text-[#0D9387]" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">Cargando propuesta de viaje...</h3>
        <p className="text-sm text-slate-300 mt-1">Karabu Viajes — Cotización #{currentId}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F2A4A] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 max-w-md w-full shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold">No pudimos cargar la propuesta</h3>
          <p className="text-xs text-slate-300 mt-2 mb-6">{error}</p>
          <button onClick={() => loadQuotationData(currentId)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-[#0D9387] hover:bg-[#0b7d72] transition shadow-lg"><RefreshCw className="w-4 h-4" /> Reintentar</button>
        </div>
      </div>
    );
  }

  const q = data?.quotation || {};
  const clientName = data?.client?.first_name ? `${data.client.first_name} ${data.client.last_name || ''}`.trim() : 'Cliente';
  const destination = q.destination || 'Destino';
  const travelDate = q.travel_date || '—';
  const returnDate = q.return_date || '—';
  const hotelName = q.assigned_hotel || 'Hotel por confirmar';
  const rawRoomType = q.room_type || q.form_data?.roomType || '';
  const roomType = rawRoomType ? `Habitación ${rawRoomType}` : '';
  const travelers = q.travelers || 1;
  const adults = q.form_data?.adultsCount ?? travelers;
  const children = q.form_data?.childrenCount ?? 0;

  const nights = (() => {
    if (!travelDate || !returnDate || travelDate === '—' || returnDate === '—') return 1;
    const d1 = new Date(travelDate + 'T12:00');
    const d2 = new Date(returnDate + 'T12:00');
    const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000);
    return diff > 0 ? diff : 1;
  })();

  const totalAmount = q.amount || 0;
  const taxPercent = q.tax_percent ?? 0;
  const totalWithTax = Math.round(totalAmount * (1 + taxPercent / 100));
  const perNightPerPerson = nights > 0 && travelers > 0 ? Math.round(totalWithTax / nights / travelers) : totalWithTax;
  const status = q.status || 'enviada';
  const broker = data?.broker || {};

  const sencilla = q.form_data?.habitacionesSencilla ?? 0;
  const doble = q.form_data?.habitacionesDoble ?? 0;
  const triple = q.form_data?.habitacionesTriple ?? 0;
  const totalRooms = sencilla + doble + triple;
  const roomsSummary = totalRooms > 0
    ? `${totalRooms} hab.${sencilla > 0 ? ` (${sencilla} sen.)` : ''}${doble > 0 ? ` (${doble} dob.)` : ''}${triple > 0 ? ` (${triple} trip.)` : ''}`
    : (q.room_type ? `Hab. ${q.room_type}` : '');

  const customServices = Array.isArray(q.services) && q.services.length > 0 ? q.services : null;
  const hasServices = customServices && customServices.length > 0;
  const sumActiveServices = hasServices ? customServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0) : 0;
  const serviceFeePrice = hasServices ? (totalAmount > sumActiveServices ? totalAmount - sumActiveServices : 0) : 0;

  const bookingPrice = q.booking_price || Math.round(totalWithTax * 1.15);
  const expediaPrice = q.expedia_price || Math.round(totalWithTax * 1.12);
  const heroBgImage = q.hero_image || q.gallery_images?.[0] || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#070F1E] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans">
      {/* ═══════ NAVBAR — compacto, mismo estilo que landing ═══════ */}
      <header className="sticky top-0 z-50 bg-[#0F2A4A] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Logo light={true} showText={true} className="scale-[0.85] origin-left" />
              <span className="hidden sm:inline text-[11px] font-mono text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">#{currentId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                  status === 'aceptada' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  status === 'cambios_solicitados' || status === 'rechazada' ? 'bg-[#FF6B35]/20 text-orange-300 border-[#FF6B35]/30' :
                  'bg-[#0D9387]/20 text-teal-300 border-[#0D9387]/30'
              }`}>
                {status === 'aceptada' ? <><CheckCircle2 className="w-3 h-3" /> Aceptada</> :
                 status === 'cambios_solicitados' || status === 'rechazada' ? <><RotateCcw className="w-3 h-3" /> Cambios</> :
                 <><Sparkles className="w-3 h-3 text-teal-300" /> Lista</>}
              </span>
              <button onClick={handleShare} className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all" title="Compartir">
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all" title="Tema">
                {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════ SECTION 1 — HERO ═══════ */}
      <section className="relative w-full h-[85vh] max-h-[700px] flex flex-col justify-between overflow-hidden bg-[#0F2A4A]">
        <img src={heroBgImage} alt={destination} className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2A4A]/60 via-black/20 to-black/80 pointer-events-none" />

        <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 mt-auto mb-auto text-center sm:text-left pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-teal-300 text-xs font-medium mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#0D9387]" />{destination}
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-lg leading-tight">¡Hola {clientName}!</h1>
          <p className="text-lg sm:text-2xl text-slate-200 font-medium mt-2 drop-shadow-md">Tu cotización a <span className="text-teal-300 font-semibold">{destination}</span> está lista</p>
        </div>

        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-4">
          <div className="backdrop-blur-xl bg-black/55 border border-white/20 shadow-2xl rounded-2xl p-4 sm:p-5 text-white">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0D9387] via-teal-300 to-[#FF6B35]" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-5 h-5 text-teal-300 shrink-0" />
                <div><span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Fechas</span><span className="text-xs text-white">{travelDate} — {returnDate}</span>{nights > 0 && <span className="text-[10px] text-teal-300 block mt-0.5">{nights} {nights === 1 ? 'noche' : 'noches'}</span>}</div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Building2 className="w-5 h-5 text-teal-300 shrink-0" />
                <div><span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Hospedaje</span><span className="text-xs text-white line-clamp-1">{hotelName}</span>{roomType && <span className="text-[11px] text-slate-300 line-clamp-1">{roomType}</span>}{roomsSummary && <span className="text-[10px] text-teal-300 block mt-0.5">{roomsSummary}</span>}</div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <Users className="w-5 h-5 text-teal-300 shrink-0" />
                <div><span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Viajeros</span><span className="text-xs text-white">{travelers} pasajeros</span>{children > 0 && <span className="text-[11px] text-slate-300 block">{adults} adultos, {children} niño{children!==1?'s':''}</span>}</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D9387]/20 border border-[#0D9387]/40">
                <div><span className="text-[10px] uppercase tracking-wider text-teal-200 font-medium block">Total</span><span className="text-xl sm:text-2xl font-bold text-white">${totalWithTax.toLocaleString()} <span className="text-xs text-teal-200">USD</span></span></div>
                <div className="text-right border-l border-white/15 pl-3"><span className="text-[10px] text-slate-300 block">P/P/N</span><span className="text-sm font-semibold text-teal-300">${perNightPerPerson.toLocaleString()} USD</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 pb-3 text-center">
          <button onClick={() => document.getElementById('contenido')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white transition bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15">
            <span>Ver detalles</span><ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#0D9387]" />
          </button>
        </div>

        {/* Botones de acción en el hero */}
        <div className="relative z-20 w-full max-w-2xl mx-auto px-4 pb-6">
          {status === 'aceptada' ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-center text-sm font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> PROPUESTA ACEPTADA — Tu asesor te contactará
            </div>
          ) : status === 'cambios_solicitados' || status === 'rechazada' ? (
            <div className="p-3 rounded-xl bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-orange-200 text-center text-sm font-medium flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> CAMBIOS SOLICITADOS — Tu asesor ajustará la propuesta
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button type="button" onClick={handleDirectAccept} disabled={isSubmitting}
                className="flex-1 font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 text-sm bg-[#0D9387] hover:bg-[#0b7d72] active:scale-[0.98] text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 stroke-[3]" />ACEPTAR PROPUESTA</>}
              </button>
              <button type="button" onClick={() => { setShowChangeForm(!showChangeForm); setInlineFeedback(null); }} disabled={isSubmitting}
                className="flex-1 font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 text-sm bg-[#FF6B35] hover:bg-[#e05a28] active:scale-[0.98] text-white">
                <RotateCcw className="w-4 h-4" />SOLICITAR CAMBIOS
              </button>
            </div>
          )}

          {inlineFeedback && (
            <div className={`mt-3 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              inlineFeedback.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' :
              inlineFeedback.type === 'info' ? 'bg-[#FF6B35]/20 border-[#FF6B35]/30 text-orange-200' :
              'bg-red-500/20 border-red-500/30 text-red-200'
            }`}><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /><span>{inlineFeedback.message}</span></div>
          )}

          {showChangeForm && (
            <form onSubmit={handleSubmitChanges} className="mt-3 bg-black/40 backdrop-blur-md p-3.5 rounded-xl border border-[#FF6B35]/30 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-200"><MessageSquare className="w-3.5 h-3.5 text-[#FF6B35]" />Ajustes requeridos:</div>
              <textarea rows={2} required placeholder="Ej: cambiar fecha, upgrade de habitación..." value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)} className="w-full text-xs p-2.5 rounded-lg border border-white/20 bg-black/60 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#FF6B35] outline-none" />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowChangeForm(false)} className="px-3 py-1 rounded-lg text-xs text-slate-300 hover:text-white">Cancelar</button>
                <button type="submit" disabled={isSubmitting || !changeNotes.trim()} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#FF6B35] hover:bg-[#e05a28] transition flex items-center gap-1 disabled:opacity-50">{isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" />Enviar</>}</button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ═══════ SECTION 2 — CONTENIDO ═══════ */}
      <section id="contenido" className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#070F1E] transition-colors">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* ── 1. COMPARATIVA DE PRECIOS ── */}
          <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6 text-center sm:text-left">
              <h3 className="text-xl font-semibold text-[#0F2A4A] dark:text-white flex items-center justify-center sm:justify-start gap-2"><Award className="w-5 h-5 text-[#0D9387]" />Comparativa de Precios</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comparación de tarifas estimadas para este itinerario</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-2xl border-2 border-[#0D9387] bg-white dark:bg-[#0F2A4A] p-5 text-center shadow-md">
                <div className="w-full h-28 rounded-xl bg-white flex items-center justify-center p-3 mb-3"><img src="/karabu-comparador.jpeg" alt="Karabu" className="h-full w-full object-contain rounded-lg" /></div>
                <div className="text-sm font-semibold text-[#0F2A4A] dark:text-white uppercase tracking-wider mb-1">Karabu Viajes</div>
                <div className="text-xl sm:text-2xl font-bold text-[#0D9387]">${totalWithTax.toLocaleString()} <span className="text-xs text-slate-400">USD</span></div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 text-center shadow-sm">
                <div className="w-full h-28 rounded-xl bg-[#003580] flex items-center justify-center p-3 mb-3"><img src="/booking-logo.svg" alt="Booking" className="h-full w-full object-contain rounded-lg" /></div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">Booking.com</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200">${bookingPrice.toLocaleString()} <span className="text-xs text-slate-400">USD</span></div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 text-center shadow-sm">
                <div className="w-full h-28 rounded-xl bg-[#FFE000] flex items-center justify-center p-3 mb-3"><img src="/expedia-logo.svg" alt="Expedia" className="h-full w-full object-contain rounded-lg" /></div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">Expedia</div>
                <div className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200">${expediaPrice.toLocaleString()} <span className="text-xs text-slate-400">USD</span></div>
              </div>
            </div>
          </div>

          {/* ── 2. RESUMEN DE TARIFA + P/P/N ── */}
          <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9387] block mb-2">Resumen de tarifa</span>
            <h3 className="text-lg font-semibold text-[#0F2A4A] dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0D9387]" />{hotelName}
              {roomType && <span className="text-base font-normal text-slate-500"> · {roomType}</span>}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#0D9387]" />{nights} {nights === 1 ? 'noche' : 'noches'}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[#0D9387]" />{travelers} {travelers === 1 ? 'viajero' : 'viajeros'}</span>
              <span className="text-slate-400">{q.currency || 'USD'}</span>
            </p>

            {/* P/P/N formula */}
            <div className="mt-4 p-4 rounded-xl bg-[#0D9387]/5 dark:bg-[#0D9387]/10 border border-[#0D9387]/15">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-[#0F2A4A] dark:text-white">${totalWithTax.toLocaleString()}</span>
                  <span className="mx-1.5 text-slate-400">÷</span>
                  <span>{nights} noches</span>
                  <span className="mx-1.5 text-slate-400">÷</span>
                  <span>{travelers} pers.</span>
                  <span className="mx-1.5 text-slate-400">=</span>
                </div>
                <div className="bg-[#0D9387] text-white px-4 py-2 rounded-xl text-center">
                  <span className="text-[10px] uppercase tracking-wider block opacity-80">P/P/N</span>
                  <span className="text-xl font-bold">${perNightPerPerson.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. SERVICIOS / DESGLOSE ── */}
          {hasServices && (
            <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-[#0F2A4A] dark:text-white mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0D9387]" />Servicios incluidos
              </h3>
              <div className="space-y-3">
                {customServices.map((srv, idx) => {
                  const IconComponent = srv.name?.toLowerCase().includes('vuelo') ? Plane : srv.name?.toLowerCase().includes('hospedaj') || srv.name?.toLowerCase().includes('hotel') ? Building2 : srv.name?.toLowerCase().includes('traslado') ? Car : srv.name?.toLowerCase().includes('seguro') ? ShieldCheck : CheckCircle2;
                  return (
                    <div key={srv.id || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070F1E]/60 border border-slate-200/80 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[#0D9387]/15 text-[#0D9387] flex items-center justify-center shrink-0"><IconComponent className="w-4 h-4" /></span><span className="font-medium">{srv.name}</span></div>
                      <span className="font-semibold text-[#0F2A4A] dark:text-white">${(Number(srv.price) || 0).toLocaleString()} USD</span>
                    </div>
                  );
                })}
                {serviceFeePrice > 0 && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-sm text-emerald-800 dark:text-emerald-200">
                    <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"><Award className="w-4 h-4" /></span><span className="font-medium">Gastos de gestión</span></div>
                    <span className="font-semibold">${serviceFeePrice.toLocaleString()} USD</span>
                  </div>
                )}
              </div>
              <div className="mt-5 pt-4 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between bg-[#0D9387]/10 p-4 rounded-xl">
                <span className="text-base font-bold text-[#0F2A4A] dark:text-white">Total</span>
                <span className="text-2xl font-bold text-[#0D9387]">${totalWithTax.toLocaleString()} USD</span>
              </div>
            </div>
          )}

          {/* ── 3b. Total sin servicios ── */}
          {!hasServices && (
            <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between bg-[#0D9387]/10 p-4 rounded-xl border border-[#0D9387]/30">
                <span className="text-base font-bold text-[#0F2A4A] dark:text-white">Total</span>
                <span className="text-2xl font-bold text-[#0D9387]">${totalWithTax.toLocaleString()} USD</span>
              </div>
            </div>
          )}

          {/* ── 4. IMPUESTOS INCLUIDOS ── */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 inline-flex items-center gap-2 bg-white dark:bg-slate-800/80 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#0D9387]" />Impuestos y tasas incluidos en el precio final
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 3 — ASESOR ═══════ */}
      {broker.name && (
        <section className="w-full bg-white dark:bg-[#0F2A4A] py-10 sm:py-14 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0D9387]">Tu asesor</span>
              <h2 className="text-xl font-bold text-[#0F2A4A] dark:text-white mt-1">¿Tienes dudas? Contáctanos</h2>
            </div>

            <div className="bg-slate-50 dark:bg-[#0F2A4A]/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8">
              {/* Avatar + info */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  {broker.avatar_url ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#0D9387] shadow-lg">
                      <img src={broker.avatar_url} alt={broker.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0D9387] to-[#0F2A4A] text-white flex items-center justify-center text-3xl font-bold border-4 border-[#0D9387] shadow-lg">
                      {broker.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#0F2A4A] dark:text-white">{broker.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{broker.role === 'super_admin' ? 'Administrador' : broker.role === 'admin' ? 'Asesor' : 'Especialista de Viajes'}{broker.department ? ` · ${broker.department}` : ''}</p>
                {broker.phone && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-mono">{broker.phone}</p>}
              </div>

              {/* Contact buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {broker.phone && (
                  <a href={`https://wa.me/${broker.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                )}
                {broker.email && (
                  <a href={`mailto:${broker.email}`}
                    className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#0F2A4A] dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-[#0D9387] dark:hover:border-[#0D9387] transition-colors shadow-sm">
                    <Mail className="w-5 h-5 text-[#0D9387]" />
                    Correo
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ SECTION 4 — BOTONES DE ACCIÓN ═══════ */}
      <section className="w-full bg-slate-50 dark:bg-[#070F1E] py-8 sm:py-10 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto space-y-4">
          {inlineFeedback && (
            <div className={`p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${
              inlineFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' :
              inlineFeedback.type === 'info' ? 'bg-[#FF6B35]/10 border-[#FF6B35]/30 text-orange-700 dark:text-orange-300' :
              'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
            }`}><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{inlineFeedback.message}</span></div>
          )}

          {showChangeForm && (
            <form onSubmit={handleSubmitChanges} className="bg-white dark:bg-[#0F2A4A]/60 border border-[#FF6B35]/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FF6B35]"><MessageSquare className="w-4 h-4" />¿Qué cambios necesitas?</div>
              <textarea rows={3} required placeholder="Ej: cambiar fecha, upgrade de habitación..." value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)} className="w-full text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#FF6B35] outline-none" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowChangeForm(false)} className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition">Cancelar</button>
                <button type="submit" disabled={isSubmitting || !changeNotes.trim()} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#e05a28] transition flex items-center gap-2 disabled:opacity-50">{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Enviar</>}</button>
              </div>
            </form>
          )}

          {status === 'aceptada' ? (
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="font-bold text-base">¡Propuesta Aceptada!</p>
              <p className="text-sm mt-1">Tu asesor se pondrá en contacto para coordinar los detalles.</p>
            </div>
          ) : status === 'cambios_solicitados' || status === 'rechazada' ? (
            <div className="p-5 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-orange-700 dark:text-orange-300 text-center">
              <RotateCcw className="w-8 h-8 mx-auto mb-2 text-[#FF6B35]" />
              <p className="font-bold text-base">Cambios Solicitados</p>
              <p className="text-sm mt-1">Tu asesor está revisando tus comentarios y ajustará la propuesta.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={handleDirectAccept} disabled={isSubmitting}
                className="flex-1 font-semibold py-3.5 px-6 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 text-base bg-[#0D9387] hover:bg-[#0b7d72] active:scale-[0.98] text-white">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 stroke-[3]" />ACEPTAR PROPUESTA</>}
              </button>
              <button type="button" onClick={() => { setShowChangeForm(!showChangeForm); setInlineFeedback(null); }} disabled={isSubmitting}
                className="flex-1 font-semibold py-3.5 px-6 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 text-base bg-[#FF6B35] hover:bg-[#e05a28] active:scale-[0.98] text-white shadow-[#FF6B35]/25">
                <RotateCcw className="w-5 h-5" />SOLICITAR CAMBIOS
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070F1E] py-6 px-4 text-center transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2"><span className="font-bold text-[#0F2A4A] dark:text-white tracking-wider">KARABU <span className="text-[#0D9387]">VIAJES</span></span><span>— Agencia Oficial</span></div>
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#0D9387]" /><span>Documento seguro · Garantía Karabu</span></div>
        </div>
      </footer>
    </div>
  );
}
