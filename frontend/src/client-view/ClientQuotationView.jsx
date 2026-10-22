import React, { useEffect, useState, useRef } from 'react';
import Logo from '../components/Logo';
import { getQuotation, updateQuotationStatus } from './api-adapter';
import {
  Compass, Loader2, AlertCircle, RefreshCw, ShieldCheck,
  CheckCircle2, Calendar, Building2, Users, CreditCard,
  DollarSign, Sun, Moon, ArrowDown, RotateCcw, Check, Plane,
  Car, Share2, MapPin, Sparkles, MessageSquare, Send, Award,
  Phone, Mail, Bed, Clock, ChevronLeft, ChevronRight, Star,
  Globe, Headphones, BadgeCheck, Copy, Maximize2, X, CheckCheck
} from 'lucide-react';

const BANK_ACCOUNTS = [
  {
    id: 'bhd',
    bank: 'Banco BHD',
    logo: '/bhd-logo.jpg',
    fit: 'cover',
    type: 'Cuenta de ahorros · Pesos Dominicanos (RD$)',
    details: [
      { label: 'Titular', value: 'RINALDI BUENO' },
      { label: 'Cédula', value: '402-0293128-9', copyable: true },
      { label: 'Número de cuenta', value: '40030140010', mono: true, copyable: true },
      { label: 'Cuenta estándar (IBAN)', value: 'DO75BCBH00000000040030140010', mono: true, copyable: true },
      { label: 'Correo', value: 'rsbueno25@gmail.com', copyable: true },
    ],
  },
  {
    id: 'banreservas',
    bank: 'Banreservas',
    logo: '/banreservas-logo.png',
    fit: 'contain',
    type: 'Cuenta de ahorros · Pesos Dominicanos (RD$)',
    details: [
      { label: 'Titular', value: 'CARLOS RANDOLF' },
      { label: 'Cédula', value: '001-0330213-9', copyable: true },
      { label: 'Número de cuenta', value: '9607638784', mono: true, copyable: true },
      { label: 'Correo', value: 'pagos@karabuviajes.com', copyable: true },
    ],
  },
];

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
  const [copiedField, setCopiedField] = useState(null);

  // Gallery Hero Carousel state
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Scroll interno: con hash-routing, href="#id" cambia la ruta y desmonta la vista
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Barra fija inferior en móvil: solo aparece al pasar el hero (evita duplicar los botones)
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const loadQuotationData = async (idToFetch) => {
    setLoading(true); setError(null);
    try {
      const result = await getQuotation(idToFetch);
      setData(result);
    } catch (err) {
      setError(err.message || 'Error al cargar la propuesta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentId) loadQuotationData(currentId);
  }, [currentId]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Propuesta de Viaje - Karabu Viajes',
        text: 'Te comparto la propuesta de viaje de Karabu Viajes:',
        url: url
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const copyToClipboard = (text, fieldKey) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleDirectAccept = async () => {
    setIsSubmitting(true);
    setInlineFeedback(null);
    try {
      await updateQuotationStatus(currentId, {
        status: 'aceptada',
        notes: 'Propuesta aceptada directamente por el cliente.',
      });
      if (data) {
        setData((prev) => ({
          ...prev,
          quotation: { ...prev.quotation, status: 'aceptada' }
        }));
      }
      setShowChangeForm(false);
      setInlineFeedback({
        type: 'success',
        message: '¡Propuesta Aceptada con éxito! Ya puedes realizar tu pago para asegurar tu reserva.'
      });
      setTimeout(() => {
        document.getElementById('pago')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    } catch (err) {
      setInlineFeedback({ type: 'error', message: 'No se pudo procesar: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitChanges = async (e) => {
    e.preventDefault();
    if (!changeNotes.trim()) return;
    setIsSubmitting(true);
    setInlineFeedback(null);
    try {
      await updateQuotationStatus(currentId, {
        status: 'cambios_solicitados',
        notes: changeNotes
      });
      if (data) {
        setData((prev) => ({
          ...prev,
          quotation: { ...prev.quotation, status: 'cambios_solicitados', notes: changeNotes }
        }));
      }
      setShowChangeForm(false);
      setInlineFeedback({
        type: 'info',
        message: 'Solicitud de cambios enviada. Tu asesor ajustará la propuesta a la brevedad.'
      });
    } catch (err) {
      setInlineFeedback({ type: 'error', message: 'Error: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F2A4A] flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-[#0D9387]/20 text-[#0D9387] flex items-center justify-center animate-pulse mb-4 border border-[#0D9387]/30 shadow-2xl">
          <Compass className="w-8 h-8 animate-spin text-[#0D9387]" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">Cargando tu propuesta personalizada...</h3>
        <p className="text-sm text-slate-300 mt-1">Karabu Viajes — Cotización #{currentId || ''}</p>
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
          <button
            onClick={() => loadQuotationData(currentId)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-[#0D9387] hover:bg-[#0b7d72] transition shadow-lg"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
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
  const roomType = rawRoomType ? `Habitación ${rawRoomType}` : 'Habitación Estándar';
  const travelers = q.travelers || 1;
  const adults = q.form_data?.adultsCount ?? travelers;
  const children = q.form_data?.childrenCount ?? 0;
  const babies = q.form_data?.babiesCount ?? 0;
  const quoteCode = q.code || `#${currentId.slice(0, 8)}`;

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
    ? `${totalRooms} hab.${sencilla > 0 ? ` (${sencilla} sencilla)` : ''}${doble > 0 ? ` (${doble} doble)` : ''}${triple > 0 ? ` (${triple} triple)` : ''}`
    : (q.room_type ? `Hab. ${q.room_type}` : '1 Habitación');

  const customServices = Array.isArray(q.services) && q.services.length > 0 ? q.services : null;
  const bookingPrice = q.booking_price || Math.round(totalWithTax * 1.15);
  const expediaPrice = q.expedia_price || Math.round(totalWithTax * 1.12);
  const calculatedSavings = Math.max(0, bookingPrice - totalWithTax);

  // Imágenes del Hero y Galería: unificar sin duplicados
  const heroImageFallback = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920`;
  const allImages = [
    ...(q.hero_image ? [q.hero_image] : []),
    ...(Array.isArray(q.gallery_images) ? q.gallery_images : [])
  ].filter(Boolean);

  const imagesList = allImages.length > 0 ? [...new Set(allImages)] : [heroImageFallback];
  const activeImage = imagesList[carouselIdx] || imagesList[0];

  const nextImage = () => {
    setCarouselIdx((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = () => {
    setCarouselIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  // Touch Swipe para móvil (ignora controles del formulario/botones)
  const handleTouchStart = (e) => {
    if (e.target.closest('button, a, form, input, textarea, select')) {
      touchStartX.current = null;
      return;
    }
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextImage();
    if (diff < -50) prevImage();
  };

  // WhatsApp link para notificar pago
  const cleanBrokerPhone = (broker.phone || '').replace(/[^0-9]/g, '');
  const whatsappPaymentMsg = encodeURIComponent(
    `Hola ${broker.name || 'Asesor Karabu'}, he aceptado la cotización ${quoteCode} para viajar a ${destination}. Adjunto mi comprobante de pago por $${totalWithTax.toLocaleString()} USD.`
  );
  const whatsappPaymentUrl = cleanBrokerPhone
    ? `https://wa.me/${cleanBrokerPhone}?text=${whatsappPaymentMsg}`
    : '#';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070F1E] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans pb-24 sm:pb-12">
      {/* ═══════ NAVBAR ═══════ */}
      <header className="sticky top-0 z-50 bg-[#0F2A4A]/95 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Logo light={true} showText={true} className="scale-[0.85] origin-left" />
              <span className="hidden sm:inline text-[11px] font-mono text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                {quoteCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`whitespace-nowrap shrink-0 text-[10px] sm:text-[11px] font-semibold px-2.5 sm:px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                status === 'aceptada' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                status === 'cambios_solicitados' || status === 'rechazada' ? 'bg-[#FF6B35]/20 text-orange-300 border-[#FF6B35]/40' :
                'bg-[#0D9387]/20 text-teal-300 border-[#0D9387]/40'
              }`}>
                {status === 'aceptada' ? <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Aceptada</> :
                 status === 'cambios_solicitados' || status === 'rechazada' ? <><RotateCcw className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">Cambios&nbsp;Solicitados</span><span className="sm:hidden">Cambios</span></> :
                 <><Sparkles className="w-3.5 h-3.5 text-teal-300 shrink-0" /> <span className="hidden sm:inline">Propuesta&nbsp;Lista</span><span className="sm:hidden">Lista</span></>}
              </span>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                title="Compartir enlace"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                title="Modo Oscuro / Claro"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════ HERO FULL-BLEED: FOTO A SANGRE + RESUMEN DEL VIAJE ENCIMA ═══════ */}
      <section
        className="relative w-full overflow-hidden bg-[#0B1E36] border-b border-white/10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Fondo: carrusel de fotos cubriendo todo el hero (crossfade) ── */}
        <div className="absolute inset-0" aria-hidden="true">
          {imagesList.map((img, i) => (
            <img
              key={`hero-bg-${i}`}
              src={img}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === carouselIdx ? 'opacity-100' : 'opacity-0'
              }`}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = heroImageFallback; }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[#061726]/80 via-[#061726]/45 to-[#061726]/90" />
        </div>

        {/* ── Controles del carrusel ── */}
        <button
          type="button"
          onClick={() => setFullscreenImage(imagesList[carouselIdx])}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 transition"
          title="Ampliar fotografía"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {imagesList.length > 1 && (
          <>
            <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-teal-300" />
              {carouselIdx + 1} / {imagesList.length}
            </div>
            <button
              type="button"
              onClick={prevImage}
              title="Foto anterior"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-black/75 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              title="Siguiente foto"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-black/75 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {imagesList.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  onClick={() => setCarouselIdx(i)}
                  aria-label={`Foto ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === carouselIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Contenido sobre la foto ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-10 sm:pt-14 sm:pb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/25 text-white/90 text-xs font-semibold mb-3 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
              {destination}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
              ¡Hola {clientName}!
            </h1>
            <p className="text-sm sm:text-lg text-slate-100/90 mt-2 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              Tu cotización a <span className="text-[#2DD4BF] font-semibold">{destination}</span> está lista
            </p>
          </div>

          {/* ── Barra de resumen del viaje ── */}
          <div className="mt-6 sm:mt-8 rounded-2xl overflow-hidden bg-[#0A1A2B]/60 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/40">
            <div className="h-[3px] w-full bg-gradient-to-r from-[#0D9387] via-[#0D9387] to-[#FF6B35]" />
            <div className="grid grid-cols-2 lg:grid-cols-4">

              {/* Fechas */}
              <div className="p-4 sm:p-5 border-b lg:border-b-0 border-white/10 lg:border-r">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-[#2DD4BF]/80" /> Fechas
                </p>
                <p className="mt-2 text-[13px] sm:text-[15px] font-bold text-white leading-snug">
                  <span className="block sm:inline whitespace-nowrap">{String(travelDate).slice(0, 10)}</span>
                  <span className="hidden sm:inline text-slate-400 font-normal"> — </span>
                  <span className="block sm:inline whitespace-nowrap">{String(returnDate).slice(0, 10)}</span>
                </p>
                <p className="mt-1 text-[11px] font-semibold text-[#2DD4BF]">
                  {nights} {nights === 1 ? 'noche' : 'noches'}
                </p>
              </div>

              {/* Hospedaje + habitaciones */}
              <div className="p-4 sm:p-5 border-b lg:border-b-0 border-white/10 lg:border-r">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  <Bed className="w-3.5 h-3.5 text-amber-300/80" /> Hospedaje
                </p>
                <p className="mt-2 text-[13px] sm:text-[15px] font-bold text-white leading-snug line-clamp-2" title={hotelName}>
                  {hotelName}
                </p>
                <p className="mt-1 text-[11px] text-slate-200 leading-snug" title={roomType}>{roomType}</p>
                {totalRooms > 1 && (
                  <p className="text-[11px] text-slate-400 leading-snug" title={roomsSummary}>{roomsSummary}</p>
                )}
              </div>

              {/* Viajeros */}
              <div className="p-4 sm:p-5 border-white/10 lg:border-r">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  <Users className="w-3.5 h-3.5 text-sky-300/80" /> Viajeros
                </p>
                <p className="mt-2 text-[13px] sm:text-[15px] font-bold text-white leading-snug">
                  {travelers} {travelers === 1 ? 'pasajero' : 'pasajeros'}
                </p>
                <p className="mt-1 text-[11px] text-slate-200 leading-snug">
                  {[
                    adults > 0 ? `${adults} ${adults === 1 ? 'adulto' : 'adultos'}` : '',
                    children > 0 ? `${children} ${children === 1 ? 'niño' : 'niños'}` : '',
                    babies > 0 ? `${babies} ${babies === 1 ? 'bebé' : 'bebés'}` : '',
                  ].filter(Boolean).join(', ')}
                </p>
              </div>

              {/* Total + P/P/N */}
              <div className="p-4 sm:p-5 bg-[#0D9387]/20 border-t lg:border-t-0 border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-200">Total</p>
                    <p className="mt-1 text-[17px] sm:text-xl font-extrabold text-white leading-none">
                      ${totalWithTax.toLocaleString()}{' '}
                      <span className="text-[11px] font-bold text-teal-200">{q.currency || 'USD'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-200/80">P/P/N</p>
                    <p className="mt-1 text-[13px] sm:text-base font-bold text-white leading-none">
                      ${perNightPerPerson.toLocaleString()}{' '}
                      <span className="text-[10px] font-bold text-teal-200/80">{q.currency || 'USD'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Acciones ── */}
          <div className="mt-5 sm:mt-6">
            {status === 'aceptada' ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => scrollToId('pago')}
                  className="w-full sm:w-72 py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0D9387] to-emerald-500 shadow-lg shadow-[#0D9387]/30 hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" /> REALIZAR PAGO
                </button>
              </div>
            ) : status === 'cambios_solicitados' ? (
              <div className="flex justify-center">
                <div className="px-5 py-2.5 rounded-xl bg-[#FF6B35]/25 border border-[#FF6B35]/50 text-orange-200 text-xs font-semibold flex items-center gap-2 backdrop-blur-sm">
                  <RotateCcw className="w-3.5 h-3.5" /> Cambios solicitados — tu asesor te contactará
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDirectAccept}
                  disabled={isSubmitting}
                  className="w-full sm:w-64 py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0D9387] to-[#0aa596] shadow-lg shadow-[#0D9387]/30 hover:brightness-110 transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 stroke-[3]" /> ACEPTAR PROPUESTA</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangeForm(!showChangeForm)}
                  disabled={isSubmitting}
                  className="w-full sm:w-64 py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-[#FF6B35] hover:bg-[#e8590f] shadow-lg shadow-[#FF6B35]/25 transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" /> SOLICITAR CAMBIOS
                </button>
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => scrollToId('detalle')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0A1A2B]/70 hover:bg-[#0A1A2B]/90 border border-white/20 text-[11px] font-semibold text-slate-200 backdrop-blur-sm transition"
              >
                Ver detalles <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Formulario de cambios desplegable si se activa */}
          {showChangeForm && (
            <form onSubmit={handleSubmitChanges} className="mt-5 bg-[#0A1A2B]/85 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#FF6B35]/40 text-left space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-300">
                  <MessageSquare className="w-4 h-4 text-[#FF6B35]" />
                  ¿Qué cambios te gustaría realizar en esta propuesta?
                </div>
                <button type="button" onClick={() => setShowChangeForm(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={3}
                required
                placeholder="Ejemplo: Deseo ajustar las fechas para salir un día después, cotizar habitación con vista al mar o añadir traslados privados..."
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-white/20 bg-black/40 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#FF6B35] outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowChangeForm(false)} className="px-3.5 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting || !changeNotes.trim()} className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#FF6B35] hover:bg-[#e05a28] transition flex items-center gap-1.5 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Enviar Solicitud</>}
                </button>
              </div>
            </form>
          )}

          {inlineFeedback && (
            <div className={`mt-4 p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
              inlineFeedback.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' :
              inlineFeedback.type === 'info' ? 'bg-[#FF6B35]/20 border-[#FF6B35]/40 text-orange-200' :
              'bg-red-500/20 border-red-500/40 text-red-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{inlineFeedback.message}</span>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ SECCIÓN DE PAGO (SOLO SI ACEPTADA) ═══════ */}
      {status === 'aceptada' && (
        <section id="pago" className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-emerald-50/50 dark:bg-[#061A24] border-b-4 border-[#0D9387]">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D9387] bg-[#0D9387]/10 px-4 py-1.5 rounded-full border border-[#0D9387]/20">
                Paso Final — Confirmación de Reserva
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2A4A] dark:text-white mt-3">
                Cuentas Bancarias Oficiales Karabu
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
                Transfiere el monto cotizado. Puedes copiar cada número con 1 clic y enviarnos el volante por WhatsApp.
              </p>
            </div>

            {/* Banner de Total a Transferir */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0F2A4A] border-2 border-[#0D9387]/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                  Monto total a transferir
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#0D9387]">
                  ${totalWithTax.toLocaleString()} <span className="text-base font-bold text-slate-500">USD</span>
                </div>
                <span className="text-xs text-slate-400">Impuestos y gastos de gestión incluidos</span>
              </div>

              {cleanBrokerPhone && (
                <a
                  href={whatsappPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                  Enviar comprobante por WhatsApp
                </a>
              )}
            </div>

            {/* Tarjetas Bancarias */}
            <div className="grid gap-6 md:grid-cols-2">
              {BANK_ACCOUNTS.map((bank) => (
                <div
                  key={bank.id}
                  className="bg-white dark:bg-[#0F2A4A]/60 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Header del Banco */}
                    <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden p-1 shadow-sm">
                        <img
                          src={bank.logo}
                          alt={bank.bank}
                          className={`w-full h-full ${bank.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white">{bank.bank}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{bank.type}</p>
                      </div>
                    </div>

                    {/* Detalles con botón de copiado rápido */}
                    <div className="space-y-2.5">
                      {bank.details.map((item, i) => {
                        const copyKey = `${bank.id}-${i}`;
                        const isCopied = copiedField === copyKey;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070F1E]/50 border border-slate-200/80 dark:border-slate-800"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                {item.label}
                              </span>
                              <span className={`text-xs sm:text-sm font-bold text-[#0F2A4A] dark:text-white truncate block ${
                                item.mono ? 'font-mono tracking-wider' : ''
                              }`}>
                                {item.value}
                              </span>
                            </div>

                            {item.copyable && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(item.value, copyKey)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                                  isCopied
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#0D9387] hover:text-white'
                                }`}
                                title="Copiar dato"
                              >
                                {isCopied ? <><CheckCheck className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0D9387]" />
                    <span>Cuenta corporativa verificada Karabu</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ SECCIÓN DE COTIZACIÓN ORGANIZADA ═══════ */}
      <main id="detalle" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 scroll-mt-20">

        {/* ── 1. FICHA EJECUTIVA DEL VIAJE (3 Tarjetas Claras y Ordenadas) ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#0D9387]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resumen de la Experiencia
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: Hospedaje */}
            <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-[#0D9387] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Alojamiento Confirmado
                </span>
                <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white mt-0.5 line-clamp-2">
                  {hotelName}
                </h3>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-[#0D9387]" />
                  <span>{roomType}</span>
                </div>
                {roomsSummary && (
                  <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    {roomsSummary}
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Fechas & Duración */}
            <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-[#0D9387] flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Itinerario & Estadía
                </span>
                <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white mt-0.5">
                  {nights} {nights === 1 ? 'Noche' : 'Noches'} / {nights + 1} Días
                </h3>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Salida:</span>
                  <span className="font-semibold text-[#0F2A4A] dark:text-white">{travelDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Regreso:</span>
                  <span className="font-semibold text-[#0F2A4A] dark:text-white">{returnDate}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Pasajeros & Garantía */}
            <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-[#0D9387] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Viajeros Registrados
                </span>
                <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white mt-0.5">
                  {travelers} {travelers === 1 ? 'Pasajero' : 'Pasajeros'}
                </h3>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Distribución:</span>
                  <span className="font-semibold">{adults} Adultos{children > 0 ? `, ${children} Niños` : ''}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Asistencia personalizada incluida</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. SERVICIOS INCLUIDOS EN LA PROPUESTA ── */}
        <div className="bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-[#0F2A4A] dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0D9387]" />
                Servicios Incluidos en tu Paquete
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Todo lo acordado para tu viaje, sin cargos ocultos ni sorpresas.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
              ✓ Todo confirmado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {customServices && customServices.length > 0 ? (
              customServices.map((srv, idx) => {
                const lower = (srv.name || '').toLowerCase();
                const IconComponent = lower.includes('vuelo') ? Plane :
                  lower.includes('hospedaj') || lower.includes('hotel') ? Building2 :
                  lower.includes('traslado') ? Car :
                  lower.includes('seguro') ? ShieldCheck : CheckCircle2;
                return (
                  <div
                    key={srv.id || idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070F1E]/60 border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-[#0D9387]/15 text-[#0D9387] flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                        {srv.name}
                      </span>
                    </div>
                    {srv.price > 0 && (
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-2 shrink-0">
                        ${Number(srv.price).toLocaleString()} USD
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#070F1E]/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="w-8 h-8 rounded-lg bg-[#0D9387]/15 text-[#0D9387] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                      Alojamiento {hotelName}
                    </span>
                    <span className="text-[11px] text-slate-400">{nights} noches en {roomType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#070F1E]/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="w-8 h-8 rounded-lg bg-[#0D9387]/15 text-[#0D9387] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                      Asistencia Karabu 24/7
                    </span>
                    <span className="text-[11px] text-slate-400">Atención directa antes y durante el viaje</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Impuestos hoteleros y cargos locales incluidos
            </span>
            <span className="font-mono text-[11px]">COT-ID: {quoteCode}</span>
          </div>
        </div>

        {/* ── 3. INVERSIÓN Y COMPARATIVA DE MERCADO (Elegante y Transparente) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* Tarjeta de Inversión Karabu */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#0F2A4A] to-[#0A1D33] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between border border-white/10">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-teal-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  Tarifa Final Garantizada
                </span>
                <span className="text-xs text-slate-300 font-mono">Moneda: {q.currency || 'USD'}</span>
              </div>

              <div className="mt-6">
                <span className="text-xs text-slate-300 uppercase tracking-wider block">Inversión Total del Viaje</span>
                <div className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-1">
                  ${totalWithTax.toLocaleString()}
                  <span className="text-base sm:text-lg font-semibold text-teal-300 ml-2">USD</span>
                </div>
              </div>

              {/* Detalle P/P/N limpio y comprensible */}
              <div className="mt-6 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Equivalente por persona / noche:</span>
                  <span className="text-lg font-bold text-teal-300">${perNightPerPerson.toLocaleString()} USD</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-teal-300" />
                  <span>Calculado sobre {nights} {nights === 1 ? 'noche' : 'noches'} y {travelers} {travelers === 1 ? 'viajero' : 'viajeros'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                Tarifa congelada al reservar
              </span>
              <span className="text-teal-300 font-semibold">Sin comisiones sorpresa</span>
            </div>
          </div>

          {/* Comparativa con Booking y Expedia */}
          <div className="lg:col-span-6 bg-white dark:bg-[#0F2A4A]/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0D9387]" />
                  <h3 className="text-base font-bold text-[#0F2A4A] dark:text-white">
                    Comparativa de Mercado
                  </h3>
                </div>
                {calculatedSavings > 0 && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                    Ahorras ~${calculatedSavings.toLocaleString()} USD
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Comparación estimada con las principales plataformas online para el mismo destino e itinerario:
              </p>

              <div className="space-y-3">
                {/* Karabu Viajes (Destacado) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-[#0D9387] bg-[#0D9387]/5 dark:bg-[#0D9387]/15">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0D9387] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      KV
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0F2A4A] dark:text-white block">Karabu Viajes</span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Asesor asignado + Soporte 24/7</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-extrabold text-[#0D9387]">
                      ${totalWithTax.toLocaleString()} USD
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">✓ Mejor valor</span>
                  </div>
                </div>

                {/* Booking.com */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#003580] text-white flex items-center justify-center font-bold text-xs p-1">
                      <span className="text-[10px]">Booking</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Booking.com</span>
                      <span className="text-[10px] text-slate-400">Tarifa pública estándar</span>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300">
                    ${bookingPrice.toLocaleString()} USD
                  </span>
                </div>

                {/* Expedia */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FFE000] text-slate-900 flex items-center justify-center font-bold text-xs p-1">
                      <span className="text-[10px]">Expedia</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Expedia</span>
                      <span className="text-[10px] text-slate-400">Tarifa estimada</span>
                    </div>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300">
                    ${expediaPrice.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              * Tarifas de plataformas tomadas como referencia comparativa en fechas similares.
            </div>
          </div>
        </div>

        {/* ── 4. BOTONES DE ACCIÓN PRINCIPALES ── */}
        <div className="max-w-2xl mx-auto space-y-4 pt-4">
          {status === 'aceptada' ? (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-lg font-bold">¡Propuesta Aceptada!</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Tu viaje está en proceso de confirmación. Realiza la transferencia bancaria en la sección superior para emitir tus comprobantes.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => scrollToId('pago')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D9387] text-white text-xs font-bold shadow-md hover:bg-[#0b7d72] transition"
                >
                  Ver Cuentas Bancarias
                </button>
              </div>
            </div>
          ) : status === 'cambios_solicitados' || status === 'rechazada' ? (
            <div className="p-6 rounded-3xl bg-orange-500/10 border-2 border-orange-500/30 text-orange-800 dark:text-orange-200 text-center space-y-2">
              <RotateCcw className="w-10 h-10 text-[#FF6B35] mx-auto" />
              <h4 className="text-lg font-bold">Solicitud de Ajustes en Curso</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Hemos recibido tus observaciones. Tu asesor asignado ajustará las fechas, tarifas o servicios y te enviará la propuesta actualizada.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDirectAccept}
                disabled={isSubmitting}
                className="flex-1 font-bold py-4 px-6 rounded-2xl shadow-xl shadow-[#0D9387]/25 transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base bg-[#0D9387] hover:bg-[#0b7d72] active:scale-[0.98] text-white"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 stroke-[3]" /> ACEPTAR ESTA PROPUESTA</>}
              </button>
              <button
                type="button"
                onClick={() => setShowChangeForm(!showChangeForm)}
                disabled={isSubmitting}
                className="flex-1 font-semibold py-4 px-6 rounded-2xl shadow-md transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base bg-white dark:bg-slate-800 text-[#FF6B35] border-2 border-[#FF6B35]/40 hover:bg-[#FF6B35]/10 active:scale-[0.98]"
              >
                <RotateCcw className="w-5 h-5" /> SOLICITAR CAMBIOS
              </button>
            </div>
          )}
        </div>

        {/* ── 5. ASESOR ASIGNADO (CONEXIÓN HUMANA & SEGURIDAD) ── */}
        {broker.name && (
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl" style={{ background: 'linear-gradient(135deg, #0F2A4A 0%, #0D9387 100%)' }}>
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center text-white space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Tu Especialista de Viajes Karabu
              </span>

              {/* Avatar del asesor */}
              <div className="relative">
                {broker.avatar_url ? (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                    <img src={broker.avatar_url} alt={broker.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-bold border-4 border-white/30 shadow-2xl">
                    {broker.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{broker.name}</h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                  {broker.role === 'super_admin' ? 'Administrador General' : broker.role === 'admin' ? 'Asesor Senior' : 'Especialista en Destinos'}{broker.department ? ` · ${broker.department}` : ''}
                </p>
              </div>

              <p className="text-xs text-slate-200 max-w-md">
                ¿Tienes dudas sobre vuelos, traslados o actividades opcionales? Estoy disponible para ayudarte en cada detalle.
              </p>

              {/* Botones de contacto */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2">
                {cleanBrokerPhone && (
                  <a
                    href={`https://wa.me/${cleanBrokerPhone}?text=${encodeURIComponent(`Hola ${broker.name}, tengo una consulta sobre la propuesta ${quoteCode} a ${destination}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chatear por WhatsApp
                  </a>
                )}
                {broker.email && (
                  <a
                    href={`mailto:${broker.email}?subject=${encodeURIComponent(`Consulta propuesta ${quoteCode}`)}`}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition"
                  >
                    <Mail className="w-4 h-4" />
                    Enviar Correo
                  </a>
                )}
              </div>

              {/* Badges de Confianza */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-4 border-t border-white/15 text-[11px] text-teal-100">
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-black/15">
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-300" />
                  <span>Asesor Verificado</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-black/15">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-current" />
                  <span>Calidad Karabu</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-black/15">
                  <Globe className="w-3.5 h-3.5 text-sky-300" />
                  <span>Agencia Oficial</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-black/15">
                  <Headphones className="w-3.5 h-3.5 text-purple-300" />
                  <span>Soporte de Viaje</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══════ MODAL PANTALLA COMPLETA PARA FOTOS ═══════ */}
      {fullscreenImage && (
        <div
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={fullscreenImage}
              alt="Pantalla completa"
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ═══════ FOOTER ═══════ */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070F1E] py-8 px-4 text-center transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0F2A4A] dark:text-white tracking-wider">
              KARABU <span className="text-[#0D9387]">VIAJES</span>
            </span>
            <span>— Propuesta Exclusiva</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0D9387]" />
            <span>Documento seguro emitido por Karabu Viajes</span>
          </div>
        </div>
      </footer>

      {/* ═══════ FLOATING BOTTOM BAR EN MÓVIL (solo tras pasar el hero) ═══════ */}
      {showStickyBar && (
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F2A4A]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-slate-300 block uppercase tracking-wider">Total Cotizado</span>
          <span className="text-lg font-black text-teal-300">${totalWithTax.toLocaleString()} <span className="text-xs font-normal">USD</span></span>
        </div>

        {status === 'aceptada' ? (
          <button
            type="button"
            onClick={() => scrollToId('pago')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#0D9387] to-emerald-500 text-white shadow-md"
          >
            PAGAR AHORA
          </button>
        ) : status === 'cambios_solicitados' ? (
          <span className="text-xs font-medium text-orange-300 px-3 py-1 rounded-lg bg-[#FF6B35]/20 border border-[#FF6B35]/40">
            Ajustes en curso
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDirectAccept}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#0D9387] text-white shadow-md active:scale-95"
            >
              ACEPTAR
            </button>
            <button
              type="button"
              onClick={() => setShowChangeForm(!showChangeForm)}
              disabled={isSubmitting}
              className="px-3 py-2.5 rounded-xl font-semibold text-xs bg-white/10 text-white border border-white/20 active:scale-95"
            >
              AJUSTAR
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
