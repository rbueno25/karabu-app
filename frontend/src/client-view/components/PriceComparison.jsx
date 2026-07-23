import React from 'react';
import { Hotel, TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

export function PriceComparison({ quotation }) {
  const hasBooking = quotation.booking_price && Number(quotation.booking_price) > 0;
  const hasExpedia = quotation.expedia_price && Number(quotation.expedia_price) > 0;
  const hasAssignedHotel = quotation.assigned_hotel && quotation.assigned_hotel.trim() !== '';

  if (!hasAssignedHotel && !hasBooking && !hasExpedia) return null;

  const karabuPrice = quotation.amount;
  const formatPrice = (val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${quotation.currency}`;
  const savings = hasBooking ? Number(quotation.booking_price) - karabuPrice : null;

  return (
    <div className="w-full my-8 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1B2A] border border-[#00A896]/20 dark:border-[#00A896]/30 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#00A896]/5 via-transparent to-transparent pointer-events-none rounded-bl-full" />

      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-[#00A896]/15 text-[#00A896] flex items-center justify-center font-bold">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tu Mejor Opción Garantizada</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Comparamos para que pagues menos</p>
        </div>
      </div>

      {/* Hotel Asignado */}
      {hasAssignedHotel && (
        <div className="mb-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Hotel className="w-5 h-5 text-[#00A896] shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Hotel Asignado por tu Asesor</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{quotation.assigned_hotel}</span>
          </div>
        </div>
      )}

      {/* Price comparison grid */}
      {(hasBooking || hasExpedia) && (
        <div className="grid grid-cols-3 gap-4">
          {/* Karabu */}
          <div className="p-4 rounded-xl bg-[#00A896]/10 border-2 border-[#00A896]/40 text-center relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#00A896] text-white">Karabu</span>
            <span className="text-lg font-black text-[#00A896] block mt-2">{formatPrice(karabuPrice)}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Total final</span>
          </div>

          {/* Booking */}
          {hasBooking && (
            <div className="p-4 rounded-xl bg-[#003B95]/5 dark:bg-[#003B95]/10 border border-[#003B95]/20 text-center">
              <span className="text-xs font-bold text-[#003B95] dark:text-blue-300 block mb-1">Booking.com</span>
              <span className="text-lg font-bold text-[#003B95] dark:text-blue-300 block">{formatPrice(quotation.booking_price)}</span>
            </div>
          )}

          {/* Expedia */}
          {hasExpedia && (
            <div className="p-4 rounded-xl bg-[#FFC107]/5 dark:bg-[#FFC107]/10 border border-[#FFC107]/20 text-center">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-300 block mb-1">Expedia</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-300 block">{formatPrice(quotation.expedia_price)}</span>
            </div>
          )}
        </div>
      )}

      {/* Savings message */}
      {savings !== null && (
        <div className="mt-4 p-3 rounded-xl text-center text-xs font-semibold">
          {savings > 0 ? (
            <span className="text-[#00A896] flex items-center justify-center gap-1.5">
              <TrendingDown className="w-4 h-4" /> Ahorras {formatPrice(savings)} reservando con Karabu vs Booking
            </span>
          ) : savings === 0 ? (
            <span className="text-slate-500 dark:text-slate-400">Precio igual al de Booking.com</span>
          ) : (
            <span className="text-[#FF6B35] flex items-center justify-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Karabu es {formatPrice(Math.abs(savings))} más que Booking — consulta con tu asesor
            </span>
          )}
        </div>
      )}
    </div>
  );
}
