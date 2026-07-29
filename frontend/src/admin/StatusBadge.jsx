import React from "react";

const STYLES = {
  activo: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
  inactivo: "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-zinc-700",
  borrador: "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-zinc-700",
  enviada: "bg-[#0D9387]/10 dark:bg-[#0D9387]/20 text-[#0D9387] dark:text-teal-400 border-[#0D9387]/20 dark:border-[#0D9387]/30",
  aceptada: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
  rechazada: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
  cambios_solicitados: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
  expirada: "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-zinc-700",
  pendiente: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
  confirmada: "bg-[#0D9387]/10 dark:bg-[#0D9387]/20 text-[#0D9387] dark:text-teal-400 border-[#0D9387]/20 dark:border-[#0D9387]/30",
  pagada: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
  en_viaje: "bg-[#0F2A4A]/10 dark:bg-[#0F2A4A]/30 text-[#0F2A4A] dark:text-blue-300 border-[#0F2A4A]/20 dark:border-[#0F2A4A]/30",
  finalizada: "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-zinc-700",
  cancelada: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50",
  completado: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
  fallido: "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50",
  reembolsado: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
};

const LABELS = {
  activo: "Activo", inactivo: "Inactivo",
  borrador: "Borrador", enviada: "Enviada", aceptada: "Aceptada", rechazada: "Rechazada",
  cambios_solicitados: "Cambios Solicitados", expirada: "Expirada",
  pendiente: "Pendiente", confirmada: "Confirmada", pagada: "Pagada",
  en_viaje: "En viaje", finalizada: "Finalizada", cancelada: "Cancelada",
  completado: "Completado", fallido: "Fallido", reembolsado: "Reembolsado",
};

export default function StatusBadge({ value, testId }) {
  const cls = STYLES[value] || STYLES.borrador;
  const label = LABELS[value] || value;
  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
