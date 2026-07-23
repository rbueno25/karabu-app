import React from 'react';
import { MapPin, Calendar, Users, ShieldCheck, Sparkles } from 'lucide-react';

const FALLBACK_IMAGE = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80`;

// Local destination images map (normalized name → public path)
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
  // 1. Use first gallery image if available
  if (quotation.gallery_images && quotation.gallery_images.length > 0) {
    return quotation.gallery_images[0];
  }
  // 2. Match local destination image
  if (quotation.destination) {
    const normalized = quotation.destination.toLowerCase().trim();
    const match = DESTINOS_LOCALES[normalized];
    if (match) return match;
    // Partial match (e.g. "Punta Cana, República Dominicana")
    for (const [key, path] of Object.entries(DESTINOS_LOCALES)) {
      if (normalized.includes(key)) return path;
    }
  }
  // 3. Fallback: Unsplash
  if (quotation.destination) {
    return `https://source.unsplash.com/1600x900/?travel,${encodeURIComponent(quotation.destination)}`;
  }
  return FALLBACK_IMAGE;
}

export function HeroBanner({ data }) {
  const { quotation, client } = data;

  const heroImage = getHeroImage(quotation);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  };

  const calculateNights = (start, end) => {
    if (!start || !end) return null;
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights(quotation.travel_date, quotation.return_date);

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-xl dark:shadow-2xl bg-slate-900 text-white my-6">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={quotation.destination}
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 hover:scale-100"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        {/* Dark overlay — subtle, mostly at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[280px] sm:min-h-[340px]">
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

        <div className="my-6 max-w-3xl">
          <p className="text-sm sm:text-base font-semibold tracking-wide text-[#00A896] uppercase mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Destino Seleccionado
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-lg">
            ¡Hola {client.first_name}!
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-200 mt-2 leading-relaxed drop-shadow-md">
            Hemos preparado tu itinerario personalizado a <span className="text-white font-bold underline decoration-[#00A896] decoration-2 underline-offset-4">{quotation.destination}</span>
          </p>
        </div>

        <div className="pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/10 text-[#00A896] border border-white/10">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Fechas</p>
              <p className="text-sm font-semibold text-white">{formatDate(quotation.travel_date)}</p>
              {nights && <p className="text-xs text-slate-300">{nights} {nights === 1 ? 'noche' : 'noches'}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/10 text-amber-400 border border-white/10">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Viajeros</p>
              <p className="text-sm font-semibold text-white">{quotation.travelers} {quotation.travelers === 1 ? 'Pasajero' : 'Pasajeros'}</p>
              {quotation.form_data?.travelType && (
                <p className="text-xs text-slate-300 truncate max-w-[180px]">{quotation.form_data.travelType}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3 sm:border-l sm:border-white/15 sm:pl-4">
            <div>
              <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Inversión Total</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">${quotation.amount.toLocaleString()}</span>
                <span className="text-xs font-semibold text-[#00A896]">{quotation.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
