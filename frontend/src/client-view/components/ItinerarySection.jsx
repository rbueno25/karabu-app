import React, { useState } from 'react';
import { Check, X, Calendar, MapPin, ChevronDown, ChevronUp, ListChecks, HelpCircle } from 'lucide-react';

export function ItinerarySection({ quotation }) {
  const [expandedDay, setExpandedDay] = useState(1);
  const toggleDay = (day) => setExpandedDay(expandedDay === day ? null : day);
  const hasItinerary = quotation.itinerary_days && quotation.itinerary_days.length > 0;
  const hasInclusions = quotation.inclusions && quotation.inclusions.length > 0;
  const hasExclusions = quotation.exclusions && quotation.exclusions.length > 0;
  return (
    <div className="w-full my-8 space-y-8">

      {/* Day-by-day itinerary */}
      {hasItinerary && (
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00A896]/15 text-[#00A896] flex items-center justify-center font-bold"><Calendar className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Itinerario Sugerido Día a Día</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{quotation.itinerary_days?.length} días planificados con detalle</p>
              </div>
            </div>
            <button onClick={() => setExpandedDay(expandedDay === null ? 1 : null)} className="text-xs font-semibold text-[#00A896] hover:underline">
              {expandedDay === null ? 'Expandir todos' : 'Colapsar todos'}
            </button>
          </div>
          <div className="relative pl-4 sm:pl-6 space-y-4 border-l-2 border-[#00A896]/30 dark:border-[#00A896]/20">
            {quotation.itinerary_days?.map((item) => {
              const isExpanded = expandedDay === item.day || expandedDay === null;
              return (
                <div key={item.day} className="relative group">
                  <div className="absolute -left-[25px] sm:-left-[33px] top-3 w-6 h-6 rounded-full bg-[#00A896] text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-[#00A896]/30">{item.day}</div>
                  <div onClick={() => toggleDay(item.day)} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-[#00A896]/40 cursor-pointer transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-[#00A896] uppercase tracking-wider">Día {item.day}</span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                        {item.tag && <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0F2A4A] text-white dark:bg-slate-700 dark:text-slate-200">{item.tag}</span>}
                      </div>
                      <div className="text-slate-400">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                    </div>
                    {item.location && <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1"><MapPin className="w-3.5 h-3.5 text-[#FF6B35]" /><span>{item.location}</span></div>}
                    {isExpanded && <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-slate-700/50">{item.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inclusions & Exclusions */}
      {(hasInclusions || hasExclusions) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hasInclusions && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1B2A] border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2"><ListChecks className="w-4 h-4" />Servicios Incluidos</h3>
              <ul className="space-y-2.5">
                {quotation.inclusions?.map((inc, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="mt-0.5 p-0.5 rounded-full bg-emerald-500/20 text-emerald-500 shrink-0"><Check className="w-3 h-3" /></span><span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasExclusions && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-[#FF6B35]" />No Incluido / Opcionales</h3>
              <ul className="space-y-2.5">
                {quotation.exclusions?.map((exc, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="mt-0.5 p-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 shrink-0"><X className="w-3 h-3" /></span><span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
