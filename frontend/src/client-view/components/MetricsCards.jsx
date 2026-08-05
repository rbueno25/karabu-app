import React from 'react';
import { Calendar, Users, CreditCard, Clock, SlidersHorizontal, CheckCircle2, Moon, BedDouble } from 'lucide-react';

export function MetricsCards({ quotation, formData }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Por definir';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return null;
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { nights, days: nights + 1 };
  };

  const duration = calculateDays(quotation.travel_date, quotation.return_date);
  const travelers = quotation.travelers || 1;
  const ppn = duration?.nights && travelers > 0
    ? Math.round(quotation.amount / duration.nights / travelers)
    : null;

  // Rooms from form_data
  const sencilla = formData?.habitacionesSencilla ?? 0;
  const doble = formData?.habitacionesDoble ?? 0;
  const triple = formData?.habitacionesTriple ?? 0;
  const totalRooms = sencilla + doble + triple;
  const hasRooms = totalRooms > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
      
      {/* Card 1: Fechas */}
      <div className="relative group p-6 rounded-2xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md dark:shadow-slate-900/50 transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00A896]/10 dark:bg-[#00A896]/20 text-[#00A896] flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Itinerario</span>
        </div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fechas del Viaje</h3>
        <div className="mt-2 space-y-2">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500">Salida: </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">{formatDate(quotation.travel_date)}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500">Regreso: </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">{formatDate(quotation.return_date)}</p>
          </div>
        </div>
        {duration && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#00A896]" />Duración:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{duration.nights} Noches / {duration.days} Días</span>
          </div>
        )}
        {formData?.flexibleDates && (
          <div className="mt-2 text-[11px] font-medium text-[#00A896] dark:text-[#02C39A] bg-[#00A896]/10 dark:bg-[#00A896]/15 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />Flexibilidad: {String(formData.flexibleDates)}
          </div>
        )}
      </div>

      {/* Card 2: Viajeros + Habitaciones */}
      <div className="relative group p-6 rounded-2xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md dark:shadow-slate-900/50 transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0F2A4A]/10 dark:bg-white/10 text-[#0F2A4A] dark:text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Grupo</span>
        </div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Grupo de Viajeros</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{travelers}</span>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{travelers === 1 ? 'Pasajero total' : 'Pasajeros totales'}</span>
        </div>
        {(formData?.adultsCount || formData?.childrenCount || formData?.babiesCount) ? (
          <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Adultos</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formData.adultsCount ?? 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Niños</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formData.childrenCount ?? 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Bebés</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formData.babiesCount ?? 0}</span>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Acomodación configurada para el grupo especificado.</p>
        )}
        {/* Habitaciones */}
        {hasRooms && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 mb-2">
              <BedDouble className="w-3.5 h-3.5 text-[#00A896]" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Habitaciones</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-auto">{totalRooms} total</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {sencilla > 0 && (
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Sencilla</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{sencilla}</span>
                </div>
              )}
              {doble > 0 && (
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Doble</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{doble}</span>
                </div>
              )}
              {triple > 0 && (
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Triple</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{triple}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card 3: Precio + P/P/N */}
      <div className="relative group p-6 rounded-2xl bg-gradient-to-br from-white via-white to-teal-50/30 dark:from-[#0D1B2A] dark:via-[#0D1B2A] dark:to-[#0F2A4A]/40 border border-[#00A896]/30 dark:border-[#00A896]/40 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00A896] text-white flex items-center justify-center font-bold shadow-md shadow-[#00A896]/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#00A896]/15 text-[#00A896] border border-[#00A896]/20">Total</span>
        </div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio de la Propuesta</h3>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-black text-[#0F2A4A] dark:text-white tracking-tight">${quotation.amount.toLocaleString()}</span>
          <span className="text-sm font-bold text-[#00A896]">{quotation.currency}</span>
        </div>
        {/* P/P/N */}
        {ppn && duration?.nights && (
          <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase">P/P/N</span>
              </div>
              <span className="text-sm font-black text-[#FF6B35]">${ppn.toLocaleString()} {quotation.currency}</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5 text-right">por persona por noche</p>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Impuestos incluidos</span>
          {formData?.budgetRange && (
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Solicitado: {formData.budgetRange}</span>
          )}
        </div>
      </div>
    </div>
  );
}
