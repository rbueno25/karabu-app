import React from 'react';
import { ClipboardList, Hotel, Sparkles, PhoneCall, MessageSquare, Briefcase, CheckCircle2, UserCheck, Heart, Tag } from 'lucide-react';

export function FormDataDetails({ formData }) {
  if (!formData) return null;
  const hasServices = formData.additionalServices && formData.additionalServices.length > 0;

  return (
    <div className="w-full my-8 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00A896]/10 via-transparent to-transparent pointer-events-none rounded-bl-full" />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00A896]/15 text-[#00A896] flex items-center justify-center font-bold">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Especificaciones de tu Solicitud</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Detalles recopilados del formulario web inicial</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#0F2A4A]/10 dark:bg-white/10 text-[#0F2A4A] dark:text-white border border-[#0F2A4A]/20 dark:border-white/20">
          Formulario Web Integrado
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formData.travelType && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Estilo de Viaje</span>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formData.travelType}</span>
            </div>
          </div>
        )}
        {formData.hotelCategory && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Categoría de Hospedaje</span>
            <div className="flex items-center gap-2">
              <Hotel className="w-4 h-4 text-[#00A896]" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formData.hotelCategory}</span>
            </div>
          </div>
        )}
        {formData.preferredHotel && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Hotel Preferido</span>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{formData.preferredHotel}</span>
            </div>
          </div>
        )}
        {formData.budgetRange && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Rango de Presupuesto</span>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formData.budgetRange}</span>
            </div>
          </div>
        )}
        {formData.preferredContact && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Contacto Preferido</span>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#00A896]" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formData.preferredContact}</span>
            </div>
          </div>
        )}
        {formData.fullName && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Solicitante Principal</span>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formData.fullName}</span>
            </div>
          </div>
        )}
      </div>

      {hasServices && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00A896]" />Servicios Adicionales Solicitados
          </h3>
          <div className="flex flex-wrap gap-2">
            {formData.additionalServices?.map((service, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00A896]/10 text-[#00A896] dark:bg-[#00A896]/20 dark:text-[#02C39A] border border-[#00A896]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />{service}
              </span>
            ))}
          </div>
        </div>
      )}

      {formData.comments && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#FF6B35]" />Comentarios o Peticiones Especiales
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border-l-4 border-[#FF6B35] text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
            "{formData.comments}"
          </div>
        </div>
      )}
    </div>
  );
}
