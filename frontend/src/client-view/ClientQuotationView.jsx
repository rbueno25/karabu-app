import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { getQuotation, updateQuotationStatus } from './api-adapter';
import {
  Compass, Loader2, AlertCircle, RefreshCw, ShieldCheck,
  CheckCircle2, Calendar, Building2, Bed, Users, CreditCard,
  DollarSign, Sun, Moon, ArrowDown, RotateCcw, Check, Plane,
  Car, Share2, MapPin, Sparkles, MessageSquare, Send, Award
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
  const rawRoomType = q.room_type || q.form_data?.room_type || q.form_data?.hotelCategory || '';
  const roomType = rawRoomType ? `Habitación ${rawRoomType}` : '';
  const travelers = q.travelers || 1;
  const adults = q.form_data?.adultsCount ?? travelers;
  const children = q.form_data?.childrenCount ?? 0;
  const totalAmount = q.amount || 0;
  const perPersonAmount = travelers > 0 ? Math.round(totalAmount / travelers) : totalAmount;
  const status = q.status || 'enviada';

  const defaultServices = [
    { name: 'Vuelos ida y vuelta', price: Math.round(totalAmount * 0.3), icon: Plane },
    { name: `Hospedaje (${hotelName})`, price: Math.round(totalAmount * 0.55), icon: Building2 },
    { name: 'Traslados aeropuerto - hotel', price: Math.round(totalAmount * 0.08), icon: Car },
    { name: 'Seguro de viaje médico', price: Math.round(totalAmount * 0.07), icon: ShieldCheck }
  ];

  const customServices = Array.isArray(q.services) && q.services.length > 0 ? q.services : null;
  const activeServices = customServices || defaultServices;
  const sumActiveServices = activeServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
  const serviceFeePrice = totalAmount > sumActiveServices ? totalAmount - sumActiveServices : 0;

  const bookingPrice = q.booking_price || Math.round(totalAmount * 1.15);
  const expediaPrice = q.expedia_price || Math.round(totalAmount * 1.12);
  const heroBgImage = q.hero_image || q.gallery_images?.[0] || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920`;
  const depositPercent = q.deposit_percent || 0;
  const depositAmount = Math.round(totalAmount * depositPercent / 100);
  const taxPercent = q.tax_percent ?? 18;
  const taxAmount = Math.round(totalAmount * taxPercent / 100);

  return (
    <div className="min-h-screen bg-white dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-[#0D9387] selection:text-white">

      {/* ═══════════════ NAVBAR STICKY GLOBAL ═══════════════ */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#0F2A4A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo light={!scrolled || darkMode} showText={true} className="scale-[1.0] origin-left" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`hidden sm:inline-flex text-xs font-mono font-medium px-3 py-1 rounded-full transition-all duration-300 ${
              scrolled
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                : 'bg-white/10 backdrop-blur-md border border-white/20 text-slate-200 shadow-sm'
            }`}>#{currentId}</span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 transition-all duration-300 ${
              scrolled
                ? status === 'aceptada' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                  status === 'cambios_solicitados' || status === 'rechazada' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                  'bg-teal-100 text-teal-700 border-teal-300'
                : status === 'aceptada' ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40' :
                  status === 'cambios_solicitados' || status === 'rechazada' ? 'bg-[#FF6B35]/25 text-orange-300 border-[#FF6B35]/40' :
                  'bg-[#0D9387]/25 text-teal-300 border-[#0D9387]/40'
            }`}>
              {status === 'aceptada' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Aceptada</> :
               status === 'cambios_solicitados' || status === 'rechazada' ? <><RotateCcw className="w-3.5 h-3.5" /> Cambios</> :
               <><Sparkles className="w-3.5 h-3.5 text-teal-300" /> Lista</>}
            </span>
            <button onClick={handleShare} className={`p-2.5 rounded-xl transition-all duration-300 shadow-md flex items-center gap-1 text-xs font-medium ${
              scrolled
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                : 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white'
            }`} title="Compartir">
              {copiedLink ? <Check className={`w-4 h-4 ${scrolled ? 'text-emerald-600' : 'text-emerald-300'}`} /> : <Share2 className={`w-4 h-4 ${scrolled ? 'text-slate-500' : 'text-teal-200'}`} />}
              <span className="hidden md:inline">{copiedLink ? 'Copiado' : 'Compartir'}</span>
            </button>
            <a href={`/#/factura/${currentId}`} className={`p-2.5 rounded-xl transition-all duration-300 shadow-md flex items-center gap-1.5 text-xs font-bold ${
              scrolled
                ? 'bg-[#0D9387]/10 hover:bg-[#0D9387]/20 text-[#0D9387] border border-[#0D9387]/30'
                : 'bg-[#0D9387]/30 hover:bg-[#0D9387]/50 backdrop-blur-md border border-[#0D9387]/50 text-white'
            }`} title="Ver Factura">
              <CreditCard className={`w-4 h-4 ${scrolled ? 'text-[#0D9387]' : 'text-teal-200'}`} />
              <span className="hidden sm:inline">Factura</span>
            </a>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-xl transition-all duration-300 shadow-md ${
              scrolled
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                : 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20'
            }`} title="Tema">
              {darkMode ? <Sun className={`w-4 h-4 ${scrolled ? 'text-amber-500' : 'text-amber-300'}`} /> : <Moon className={`w-4 h-4 ${scrolled ? 'text-slate-600' : 'text-teal-200'}`} />}
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
          <p className="text-xl sm:text-2xl text-slate-100 font-bold mt-2 drop-shadow-md">Tu viaje a <span className="text-teal-300">{destination}</span> está listo</p>
        </div>

        {/* BARRA GLASS CON DATOS */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-4">
          <div className="backdrop-blur-xl bg-black/60 border border-white/20 shadow-2xl rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D9387] via-teal-300 to-[#FF6B35]" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-[#0D9387]/20 border border-[#0D9387]/30"><Calendar className="w-5 h-5 text-teal-300" /></div>
                <div><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Fechas</span><div className="font-bold text-xs text-white">{travelDate} — {returnDate}</div></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-[#0D9387]/20 border border-[#0D9387]/30"><Building2 className="w-5 h-5 text-teal-300" /></div>
                <div><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Hospedaje</span><div className="font-bold text-xs text-white line-clamp-1">{hotelName}</div>{roomType && <div className="text-[11px] text-slate-300 line-clamp-1">{roomType}</div>}</div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-[#0D9387]/20 border border-[#0D9387]/30"><Users className="w-5 h-5 text-teal-300" /></div>
                <div><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Viajeros</span><div className="font-bold text-xs text-white">{travelers} pasajeros</div>{children > 0 && <div className="text-[11px] text-slate-300">{adults} adultos, {children} niño{children!==1?'s':''}</div>}</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D9387]/20 border border-[#0D9387]/40">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-300 shrink-0" />
                  <div><span className="text-[10px] uppercase tracking-wider text-teal-200 font-bold block">Total</span><span className="text-xl sm:text-2xl font-black text-white">${totalAmount.toLocaleString()} <span className="text-xs text-teal-200">USD</span></span></div>
                </div>
                <div className="text-right border-l border-white/15 pl-3"><span className="text-[10px] text-slate-300 block">por persona</span><span className="text-sm font-bold text-teal-300">${perPersonAmount.toLocaleString()} USD</span></div>
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
              <button type="button" onClick={handleDirectAccept} disabled={isSubmitting || status === 'aceptada'}
                className={`w-full sm:w-1/2 font-bold py-3 px-6 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                  status === 'aceptada' ? 'bg-emerald-600 text-white cursor-default opacity-90' : 'bg-[#0D9387] hover:bg-[#0b7d72] active:scale-[0.98] text-white border border-teal-400/30'
                }`}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> :
                 status === 'aceptada' ? <><CheckCircle2 className="w-5 h-5" />PROPUESTA ACEPTADA</> :
                 <><Check className="w-5 h-5 stroke-[3]" />ACEPTAR PROPUESTA</>}
              </button>
              <button type="button" onClick={() => { setShowChangeForm(!showChangeForm); setInlineFeedback(null); }} disabled={isSubmitting}
                className="w-full sm:w-1/2 border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/20 active:scale-[0.98] font-bold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base backdrop-blur-md">
                <RotateCcw className="w-5 h-5" />SOLICITAR CAMBIOS
              </button>
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

      {/* ═══════════════ SECTION 2 — DESGLOSE ═══════════════ */}
      <section id="desglose" className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#070F1E] border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0D9387] bg-[#0D9387]/10 px-3 py-1 rounded-full border border-[#0D9387]/20">Desglose transparente</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F2A4A] dark:text-white tracking-tight mt-3">Desglose de tu inversión</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">Detalle puntual de cada servicio incluido en la tarifa final</p>
            <div className="w-16 h-1 bg-[#0D9387] mx-auto mt-3 rounded-full" />
          </div>

          {/* Precio por persona */}
          <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D9387] block mb-1">Cálculo de tarifa</span>
                <h3 className="text-xl font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2"><Users className="w-5 h-5 text-[#0D9387]" />Precio por persona: ${perPersonAmount.toLocaleString()} USD</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Basado en {travelers} {travelers === 1 ? 'viajero' : 'viajeros'}</p>
              </div>
              <div className="bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-xl text-center sm:text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono">Fórmula:</span>
                <span className="text-base sm:text-lg font-mono font-bold text-[#0D9387]">{travelers} × ${perPersonAmount.toLocaleString()} = ${totalAmount.toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* Servicios con precios */}
          <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#0D9387]" />Servicios incluidos y desglose individual</h3>
            <div className="space-y-3">
              {activeServices.map((srv, idx) => {
                const IconComponent = srv.icon || (srv.name?.toLowerCase().includes('vuelo') ? Plane : srv.name?.toLowerCase().includes('hospedaj') || srv.name?.toLowerCase().includes('hotel') ? Building2 : srv.name?.toLowerCase().includes('traslado') ? Car : srv.name?.toLowerCase().includes('seguro') ? ShieldCheck : CheckCircle2);
                return (
                  <div key={srv.id || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070F1E]/60 border border-slate-200/80 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-[#0D9387]/15 text-[#0D9387] flex items-center justify-center shrink-0"><IconComponent className="w-4 h-4" /></span><span>{srv.name}</span></div>
                    <span className="font-bold text-[#0F2A4A] dark:text-white">${(Number(srv.price) || 0).toLocaleString()} USD</span>
                  </div>
                );
              })}
              {serviceFeePrice > 0 && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"><Award className="w-4 h-4" /></span><span>Gastos de gestión y soporte Karabu 24/7</span></div>
                  <span className="font-bold text-[#0F2A4A] dark:text-white">${serviceFeePrice.toLocaleString()} USD</span>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t-2 border-slate-200 dark:border-slate-700 flex items-center justify-between bg-[#0D9387]/10 p-4 rounded-xl border border-[#0D9387]/30">
              <span className="text-base font-extrabold text-[#0F2A4A] dark:text-white">Total Final Karabu:</span>
              <span className="text-2xl font-black text-[#0D9387]">${totalAmount.toLocaleString()} USD</span>
            </div>
          </div>

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
                <div className="text-2xl sm:text-3xl font-black text-[#0D9387]">${totalAmount.toLocaleString()} <span className="text-xs font-bold text-slate-500">USD</span></div>
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
