import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { getQuotation, updateQuotationStatus } from './api-adapter';
import { BrokerCard } from './components/BrokerCard';
import {
  Compass, Loader2, AlertCircle, RefreshCw, ShieldCheck,
  CheckCircle2, Calendar, Building2, Bed, Users, CreditCard,
  DollarSign, Sun, Moon, ArrowDown, RotateCcw, Check, Plane,
  Car, Share2, MapPin, Sparkles, MessageSquare, Send, Award,
  Phone, Mail
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
  const [scrolled, setScrolled] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectId = (newId) => {
    setCurrentId(newId);
    window.location.hash = `#/cotizacion/${newId}`;
  };

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
      setInlineFeedback({ type: 'success', message: '¡Propuesta ACEPTADA con éxito! Tu asesor te contactará para coordinar los detalles.' });
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

  const scrollToPriceBreakdown = () => {
    const section = document.getElementById('desglose');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F2A4A] flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-[#0D9387]/20 text-[#0D9387] flex items-center justify-center animate-pulse mb-4 border border-[#0D9387]/30 shadow-2xl">
          <Compass className="w-8 h-8 animate-spin text-[#0D9387]" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Cargando propuesta de viaje...</h3>
        <p className="text-sm text-slate-300 mt-1">Karabu Viajes — Cotización #{currentId}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F2A4A] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 max-w-md w-full shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold">No pudimos cargar la propuesta</h3>
          <p className="text-xs text-slate-300 mt-2 mb-6">{error}</p>
          <button onClick={() => loadQuotationData(currentId)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#0D9387] hover:bg-[#0b7d72] transition shadow-lg"><RefreshCw className="w-4 h-4" /> Reintentar</button>
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

  // Nights calculation for P/P/N
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
  const perPersonAmount = travelers > 0 ? Math.round(totalWithTax / travelers) : totalWithTax;
  const perNightPerPerson = nights > 0 && travelers > 0 ? Math.round(totalWithTax / nights / travelers) : totalWithTax;
  const status = q.status || 'enviada';
  const broker = data?.broker || {};

  // Rooms summary from form_data
  const sencilla = q.form_data?.habitacionesSencilla ?? 0;
  const doble = q.form_data?.habitacionesDoble ?? 0;
  const triple = q.form_data?.habitacionesTriple ?? 0;
  const totalRooms = sencilla + doble + triple;
  const roomsSummary = totalRooms > 0
    ? `${totalRooms} hab.${sencilla > 0 ? ` (${sencilla} sen.)` : ''}${doble > 0 ? ` (${doble} dob.)` : ''}${triple > 0 ? ` (${triple} trip.)` : ''}`
    : '';

  const customServices = Array.isArray(q.services) && q.services.length > 0 ? q.services : null;
  const hasServices = customServices && customServices.length > 0;
  const sumActiveServices = hasServices ? customServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0) : 0;
  const serviceFeePrice = hasServices ? (totalAmount > sumActiveServices ? totalAmount - sumActiveServices : 0) : 0;

  const bookingPrice = q.booking_price || Math.round(totalWithTax * 1.15);
  const expediaPrice = q.expedia_price || Math.round(totalWithTax * 1.12);
  const heroBgImage = q.hero_image || q.gallery_images?.[0] || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-[#0D9387] selection:text-white">

      {/* ═══════════════ NAVBAR STICKY GLOBAL ═══════════════ */}
      <header className="fixed top-0 inset-x-0 z-40 transition-all duration-300 bg-[#0F2A4A] border-b border-[#0D9387]/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo light={true} showText={true} className="scale-[1.0] origin-left" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex text-xs font-mono font-medium px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-slate-200 shadow-sm">#{currentId}</span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 ${
                status === 'aceptada' ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40' :
                status === 'cambios_solicitados' || status === 'rechazada' ? 'bg-[#FF6B35]/25 text-orange-300 border-[#FF6B35]/40' :
                'bg-[#0D9387]/25 text-teal-300 border-[#0D9387]/40'
            }`}>
              {status === 'aceptada' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Aceptada</> :
               status === 'cambios_solicitados' || status === 'rechazada' ? <><RotateCcw className="w-3.5 h-3.5" /> Cambios</> :
               <><Sparkles className="w-3.5 h-3.5 text-teal-300" /> Lista</>}
            </span>
            <button onClick={handleShare} className="p-2.5 rounded-xl transition-all duration-300 shadow-md flex items-center gap-1 text-xs font-medium bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white" title="Compartir">
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4 text-teal-200" />}
              <span className="hidden md:inline">{copiedLink ? 'Copiado' : 'Compartir'}</span>
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl transition-all duration-300 shadow-md bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20" title="Tema">
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-teal-200" />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ SECTION 1 — HERO PANTALLA COMPLETA ═══════════════ */}
      <section className="relative w-full h-screen max-h-screen flex flex-col justify-between overflow-hidden bg-[#0F2A4A]">
        <img src={heroBgImage} alt={destination} className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F2A4A]/70 via-black/30 to-black/85 pointer-events-none" />

        {/* Spacer para compensar el navbar fixed */}
                <div className="shrink-0 h-16" />

        {/* SALUDO FLOTANTE */}
        <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 my-auto text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-teal-300 text-xs font-semibold mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#0D9387]" /><span>Destino: {destination}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-xl leading-tight">¡Hola <span className="text-white">{clientName}</span>!</h1>
          <p className="text-xl sm:text-2xl text-slate-100 font-bold mt-2 drop-shadow-md">Tu cotización a <span className="text-teal-300">{destination}</span> está lista</p>
        </div>

        {/* BARRA GLASS CON DATOS */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-4">
          <div className="backdrop-blur-xl bg-black/60 border border-white/20 shadow-2xl rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D9387] via-teal-300 to-[#FF6B35]" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-[#0D9387]/20 border border-[#0D9387]/30"><Calendar className="w-5 h-5 text-teal-300" /></div>
                <div><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Fechas</span><div className="font-bold text-xs text-white">{travelDate} — {returnDate}</div>{nights > 0 && <div className="text-[10px] text-teal-300 mt-0.5">{nights} {nights === 1 ? 'noche' : 'noches'}</div>}</div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-[#0D9387]/20 border border-[#0D9387]/30"><Building2 className="w-5 h-5 text-teal-300" /></div>
                <div><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Hospedaje</span><div className="font-bold text-xs text-white line-clamp-1">{hotelName}</div>{roomType && <div className="text-[11px] text-slate-300 line-clamp-1">{roomType}</div>}{roomsSummary && <div className="text-[10px] text-teal-300 mt-0.5">{roomsSummary}</div>}</div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-[#0D9387]/20 border border-[#0D9387]/30"><Users className="w-5 h-5 text-teal-300" /></div>
                <div><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Viajeros</span><div className="font-bold text-xs text-white">{travelers} pasajeros</div>{children > 0 && <div className="text-[11px] text-slate-300">{adults} adultos, {children} niño{children!==1?'s':''}</div>}</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D9387]/20 border border-[#0D9387]/40">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-300 shrink-0" />
                  <div><span className="text-[10px] uppercase tracking-wider text-teal-200 font-bold block">Total</span><span className="text-xl sm:text-2xl font-black text-white">${totalWithTax.toLocaleString()} <span className="text-xs text-teal-200">USD</span></span></div>
                </div>
                <div className="text-right border-l border-white/15 pl-3"><span className="text-[10px] text-slate-300 block">P/P/N</span><span className="text-sm font-bold text-teal-300">${perNightPerPerson.toLocaleString()} USD</span></div>
              </div>
            </div>

            {inlineFeedback && (
              <div className={`p-3 rounded-xl border mb-3 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
                inlineFeedback.type === 'success' ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-200' :
                inlineFeedback.type === 'info' ? 'bg-[#FF6B35]/25 border-[#FF6B35]/40 text-orange-200' :
                'bg-red-500/25 border-red-500/40 text-red-200'
              }`}><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{inlineFeedback.message}</span></div>
            )}

            {showChangeForm && (
              <form onSubmit={handleSubmitChanges} className="mb-3 bg-black/60 p-3.5 rounded-xl border border-[#FF6B35]/40 text-left space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-200"><MessageSquare className="w-4 h-4 text-[#FF6B35]" />Ajustes requeridos:</div>
                <textarea rows={2} required placeholder="Ej: cambiar fecha, upgrade de habitación..." value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)} className="w-full text-xs p-2.5 rounded-lg border border-white/20 bg-black/70 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#FF6B35] outline-none" />
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowChangeForm(false)} className="px-3 py-1 rounded-lg text-xs text-slate-300 hover:text-white">Cancelar</button>
                  <button type="submit" disabled={isSubmitting || !changeNotes.trim()} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#e05a28] transition flex items-center gap-1 disabled:opacity-50">{isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" />Enviar</>}</button>
                </div>
              </form>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {status === 'aceptada' ? (
                <div className="w-full py-4 px-6 rounded-xl bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-center font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> PROPUESTA ACEPTADA — Tu asesor te contactará
                </div>
              ) : status === 'cambios_solicitados' || status === 'rechazada' ? (
                <div className="w-full py-4 px-6 rounded-xl bg-[#FF6B35]/25 border border-[#FF6B35]/40 text-orange-200 text-center font-bold text-sm flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5" /> CAMBIOS SOLICITADOS — Tu asesor ajustará la propuesta
                </div>
              ) : (
                <>
              <button type="button" onClick={handleDirectAccept} disabled={isSubmitting || status === 'aceptada'}
                className={`w-full sm:w-1/2 font-bold py-3 px-6 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                  status === 'aceptada' ? 'bg-emerald-600 text-white cursor-default opacity-90' : 'bg-[#0D9387] hover:bg-[#0b7d72] active:scale-[0.98] text-white border border-teal-400/30'
                }`}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> :
                 status === 'aceptada' ? <><CheckCircle2 className="w-5 h-5" />PROPUESTA ACEPTADA</> :
                 <><Check className="w-5 h-5 stroke-[3]" />ACEPTAR PROPUESTA</>}
              </button>
              <button type="button" onClick={() => { setShowChangeForm(!showChangeForm); setInlineFeedback(null); }} disabled={isSubmitting}
                className="w-full sm:w-1/2 bg-[#FF6B35] hover:bg-[#e05a28] active:scale-[0.98] font-bold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base text-white shadow-lg shadow-[#FF6B35]/25">


                <RotateCcw className="w-5 h-5" />SOLICITAR CAMBIOS
              </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <div className="relative z-20 pb-3 text-center shrink-0">
          <button onClick={scrollToPriceBreakdown} className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white transition group cursor-pointer bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15">
            <span>Ver desglose completo</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#0D9387]" />
          </button>
        </div>
      </section>

      {/* ═══════════════ BROKER CARD — TU ASESOR ═══════════════ */}
      {broker.name && (
        <section className="w-full bg-white dark:bg-[#070F1E] py-8 sm:py-12 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0F2A4A] border border-slate-200 dark:border-slate-700 shadow-lg p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="shrink-0 relative">
              {broker.avatar_url ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#0D9387] shadow-md shadow-[#0D9387]/15">
                  <img src={broker.avatar_url} alt={broker.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#0D9387] to-[#0F2A4A] text-white flex items-center justify-center text-xl sm:text-2xl font-bold border-2 border-[#0D9387]">
                  {broker.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-sm" title="Asesor verificado">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#0F2A4A] text-white text-xs">
                {broker.agency_name || 'Karabu Viajes'}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{broker.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{broker.role || 'Especialista de Viajes'} · {broker.department || 'Asesoría personalizada'}</p>
              {broker.phone && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono">{broker.phone}</p>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                {broker.phone && (
                  <a href={`https://wa.me/${broker.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                    <Phone className="w-3.5 h-3.5" />WhatsApp
                  </a>
                )}
                {broker.email && (
                  <a href={`mailto:${broker.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#0D9387]" />{broker.email}
                  </a>
                )}
              </div>
            </div>
          </div>
          </div>
        </section>
      )}

      {/* ═══════════════ SECTION 2 — DESGLOSE ═══════════════ */}
      <section id="desglose" className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#070F1E] border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Resumen de tarifa */}
          <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D9387] block mb-1">Resumen de tarifa</span>
                <h3 className="text-xl font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0D9387]" />
                  {hotelName}
                  {roomType && <span className="text-base font-normal text-slate-500"> · {roomType}</span>}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {nights} {nights === 1 ? 'noche' : 'noches'} · {travelers} {travelers === 1 ? 'viajero' : 'viajeros'} · {q.currency || 'USD'}
                </p>
              </div>
              <div className="bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl text-center sm:text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">P/P/N</span>
                <span className="text-lg font-mono font-bold text-[#0D9387]">${perNightPerPerson.toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* Servicios — solo si el asesor los agregó */}
          {hasServices && (
            <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0D9387]" />Servicios incluidos
              </h3>
              <div className="space-y-3">
                {customServices.map((srv, idx) => {
                  const IconComponent = srv.name?.toLowerCase().includes('vuelo') ? Plane : srv.name?.toLowerCase().includes('hospedaj') || srv.name?.toLowerCase().includes('hotel') ? Building2 : srv.name?.toLowerCase().includes('traslado') ? Car : srv.name?.toLowerCase().includes('seguro') ? ShieldCheck : CheckCircle2;
                  return (
                    <div key={srv.id || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070F1E]/60 border border-slate-200/80 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[#0D9387]/15 text-[#0D9387] flex items-center justify-center shrink-0"><IconComponent className="w-4 h-4" /></span><span>{srv.name}</span></div>
                      <span className="font-bold text-[#0F2A4A] dark:text-white">${(Number(srv.price) || 0).toLocaleString()} USD</span>
                    </div>
                  );
                })}
                {serviceFeePrice > 0 && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"><Award className="w-4 h-4" /></span><span>Gastos de gestión</span></div>
                    <span className="font-bold text-[#0F2A4A] dark:text-white">${serviceFeePrice.toLocaleString()} USD</span>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between bg-[#0D9387]/10 p-4 rounded-xl border border-[#0D9387]/30">
                <span className="text-base font-extrabold text-[#0F2A4A] dark:text-white">Total</span>
                <span className="text-2xl font-black text-[#0D9387]">${totalWithTax.toLocaleString()} USD</span>
              </div>
            </div>
          )}

          {/* Hotel-only total when no services */}
          {!hasServices && (
            <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between bg-[#0D9387]/10 p-4 rounded-xl border border-[#0D9387]/30">
                <span className="text-base font-extrabold text-[#0F2A4A] dark:text-white">Total</span>
                <span className="text-2xl font-black text-[#0D9387]">${totalWithTax.toLocaleString()} USD</span>
              </div>
            </div>
          )}

          {/* Comparativa con logos */}
          <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6 text-center sm:text-left">
              <h3 className="text-xl font-bold text-[#0F2A4A] dark:text-white flex items-center justify-center sm:justify-start gap-2"><Award className="w-5 h-5 text-[#0D9387]" />Comparativa de Precios</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Comparación de tarifas estimadas para este itinerario</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-2xl border-2 border-[#0D9387] bg-white dark:bg-[#0F2A4A] overflow-hidden shadow-xl flex flex-col items-center p-5 text-center">
                <div className="w-full h-36 rounded-xl bg-white flex items-center justify-center p-3 mb-4 shadow-inner"><img src="/karabu-comparador.jpeg" alt="Karabu" className="h-full w-full object-contain rounded-lg" /></div>
                <div className="text-sm font-extrabold text-[#0F2A4A] dark:text-white uppercase tracking-wider mb-1">Karabu Viajes</div>
                <div className="text-2xl sm:text-3xl font-black text-[#0D9387]">${totalWithTax.toLocaleString()} <span className="text-xs font-bold text-slate-500">USD</span></div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-md flex flex-col items-center p-5 text-center">
                <div className="w-full h-36 rounded-xl bg-[#003580] flex items-center justify-center p-3 mb-4 shadow-inner"><img src="/booking-logo.svg" alt="Booking" className="h-full w-full object-contain rounded-lg" /></div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">Booking.com</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">${bookingPrice.toLocaleString()} <span className="text-xs font-bold text-slate-500">USD</span></div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-md flex flex-col items-center p-5 text-center">
                <div className="w-full h-36 rounded-xl bg-[#FFE000] flex items-center justify-center p-3 mb-4 shadow-inner"><img src="/expedia-logo.svg" alt="Expedia" className="h-full w-full object-contain rounded-lg" /></div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">Expedia</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">${expediaPrice.toLocaleString()} <span className="text-xs font-bold text-slate-500">USD</span></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium inline-flex items-center gap-2 bg-white dark:bg-slate-800/80 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#0D9387]" />Impuestos y tasas incluidos en el precio final
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070F1E] py-8 px-4 text-center transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2"><span className="font-extrabold text-[#0F2A4A] dark:text-white tracking-wider">KARABU <span className="text-[#0D9387]">VIAJES</span></span><span>— Agencia Oficial</span></div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300"><ShieldCheck className="w-4 h-4 text-[#0D9387]" /><span>Documento seguro · Garantía Karabu</span></div>
        </div>
      </footer>
    </div>
  );
}
