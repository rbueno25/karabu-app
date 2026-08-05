import React from 'react';
import { Mail, MessageSquare, ShieldCheck, Award } from 'lucide-react';

export function BrokerCard({ broker, quotationId }) {
  const whatsappNumber = broker.phone ? broker.phone.replace(/[^0-9]/g, '') : '';
  const defaultMessage = encodeURIComponent(`Hola ${broker.name}, tengo una consulta sobre mi propuesta de viaje #${quotationId}.`);
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${defaultMessage}` : '#';

  return (
    <div className="w-full my-8 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0F2A4A] via-[#00A896] to-[#FF6B35]" />
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative shrink-0">
          {broker.avatar_url ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#00A896] shadow-md shadow-[#00A896]/15">
              <img
                src={broker.avatar_url}
                alt={broker.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#0D9387] to-[#0F2A4A] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold border-2 border-[#00A896] shadow-md shadow-[#00A896]/15">
              {broker.name ? broker.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "KA"}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-sm" title="Asesor verificado">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#0F2A4A] text-white dark:bg-[#00A896]/20 dark:text-[#02C39A]">
              {broker.agency_name || 'Karabu Viajes'}
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />{broker.role || 'Especialista de Viajes'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{broker.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
            Tu asesor personalizado a cargo de esta cotización. Puedes resolver cualquier duda directamente antes o después de confirmar.
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            {broker.phone && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors">
                <MessageSquare className="w-4 h-4" />Contactar por WhatsApp
              </a>
            )}
            <a href={`mailto:${broker.email}?subject=Consulta%20Propuesta%20${quotationId}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
              <Mail className="w-4 h-4 text-[#00A896]" />{broker.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
