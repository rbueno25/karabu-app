import React from 'react';
import { Users, CheckCircle2, Plane, Hotel, Car, Shield, Wifi, Utensils, Sparkles, DollarSign } from 'lucide-react';

const SERVICE_ICONS = {
  'vuelos': Plane,
  'vuelo': Plane,
  'hotel': Hotel,
  'hospedaje': Hotel,
  'traslados': Car,
  'traslado': Car,
  'seguro': Shield,
  'seguro de viaje': Shield,
  'wifi': Wifi,
  'internet': Wifi,
  'comidas': Utensils,
  'desayuno': Utensils,
};

function getServiceIcon(name) {
  const key = (name || '').toLowerCase();
  for (const [k, icon] of Object.entries(SERVICE_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return Sparkles;
}

export function PriceBreakdown({ data }) {
  const { quotation } = data;
  const formData = quotation.form_data || {};

  const pricePerPerson = quotation.travelers > 0
    ? quotation.amount / quotation.travelers
    : quotation.amount;

  // Servicios: de inclusions si existen, o de form_data.additionalServices
  const inclusions = quotation.inclusions || [];
  const additionalServices = formData.additionalServices || [];
  const services = inclusions.length > 0 ? inclusions : additionalServices;

  // Si hay precios por servicio en form_data
  const servicePrices = formData.servicePrices || {};

  // Calcular total de servicios con precio (para mostrar el subtotal real)
  const pricedServices = services.filter(s => servicePrices[s]);
  const pricedTotal = pricedServices.reduce((sum, s) => sum + (servicePrices[s] || 0), 0);
  const remaining = quotation.amount - pricedTotal;

  const hasServices = services.length > 0;
  const hasPricedServices = pricedServices.length > 0;

  return (
    <div id="desglose" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Título */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00A896]/10 text-[#00A896] dark:bg-[#00A896]/20 dark:text-[#02C39A] mb-3">
          <DollarSign className="w-3.5 h-3.5" />Desglose
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          ¿Por qué este precio?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2">
          Transparencia total. Esto es lo que incluye tu inversión.
        </p>
      </div>

      {/* 2 columnas: Por persona + Servicios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA 1: Precio por persona */}
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1B2A] border border-[#00A896]/20 dark:border-[#00A896]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-[#00A896]/15 text-[#00A896] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Precio por persona</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Basado en {quotation.travelers} {quotation.travelers === 1 ? 'viajero' : 'viajeros'}</p>
            </div>
          </div>

          <div className="text-center py-6">
            <span className="text-4xl sm:text-5xl font-black text-[#0F2A4A] dark:text-white">
              ${pricePerPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-lg font-bold text-[#00A896] ml-1">{quotation.currency}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">por pasajero</p>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">{quotation.travelers} viajero{quotation.travelers !== 1 ? 's' : ''} × ${pricePerPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="font-bold text-slate-900 dark:text-white">${quotation.amount.toLocaleString()} {quotation.currency}</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />Impuestos incluidos
            </p>
          </div>
        </div>

        {/* COLUMNA 2: Servicios incluidos */}
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Servicios incluidos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Todo lo que cubre tu cotización</p>
            </div>
          </div>

          {hasServices ? (
            <ul className="space-y-3">
              {services.map((service, idx) => {
                const Icon = getServiceIcon(service);
                const price = servicePrices[service] || null;
                return (
                  <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-[#00A896]/10 text-[#00A896]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{service}</span>
                    </div>
                    {price ? (
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        ${price.toLocaleString()} {quotation.currency}
                      </span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Los servicios detallados se incluirán próximamente.</p>
              <p className="text-xs mt-1">Consulta con tu asesor para más información.</p>
            </div>
          )}

          {/* Total si hay precios por servicio */}
          {hasPricedServices && remaining > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal servicios</span>
                <span>${pricedTotal.toLocaleString()} {quotation.currency}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Gastos de gestión y otros</span>
                <span>${remaining.toLocaleString()} {quotation.currency}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Total</span>
                <span className="text-[#00A896]">${quotation.amount.toLocaleString()} {quotation.currency}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nota final */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8 flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-[#00A896]" />
        Todos los precios incluyen impuestos y tasas aplicables. Precios sujetos a disponibilidad y cambios.
      </p>
    </div>
  );
}
