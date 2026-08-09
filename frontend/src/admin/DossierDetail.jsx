import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import { ArrowLeft, FolderOpen, FileText, CalendarCheck, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../lib/format";

const statusLabel = {
  abierto: "Abierto",
  reservado: "Reservado",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

const statusCls = {
  abierto: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  reservado: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  cerrado: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  cancelado: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default function DossierDetail() {
  const { id } = useParams();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dossiers/${id}`);
      setDossier(res.data);
    } catch (err) {
      toast.error(formatApiError(err, "Error al cargar expediente"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 p-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando expediente...
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="p-8 text-center text-gray-500">Expediente no encontrado.</div>
    );
  }

  const quotations = dossier.quotations || [];
  const reservations = dossier.reservations || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/expedientes" className="h-9 w-9 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Expediente</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCls[dossier.status] || statusCls.abierto}`}>
              {statusLabel[dossier.status] || "Abierto"}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{dossier.code}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <FolderOpen className="h-4 w-4 text-[#0D9387]" />
            Cliente
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dossier.client_name || `Cliente ${dossier.client_id?.slice(0, 8)}`}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <FileText className="h-4 w-4 text-[#0D9387]" />
            Cotizaciones
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{quotations.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <CalendarCheck className="h-4 w-4 text-[#0D9387]" />
            Reservas
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{reservations.length}</p>
        </div>
      </div>

      {/* Quotations table */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#0D9387]" /> Cotizaciones
        </h2>
        {quotations.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 p-4 bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800">
            Sin cotizaciones en este expediente.
          </p>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Destino</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => (
                  <tr key={q.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2.5 font-mono text-xs text-[#0D9387]">{q.code || `#${q.id?.slice(0, 8)}`}</td>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{q.destination}</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{formatDate(q.travel_date)}</td>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{formatCurrency(q.amount, q.currency)}</td>
                    <td className="px-4 py-2.5"><StatusBadge value={q.status} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link to={`/admin/cotizaciones/${q.id}`} className="text-xs text-[#0D9387] hover:text-[#0b7d72] font-medium">Editar</Link>
                        <a href={`/#/cotizacion/${q.id}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reservations table */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-[#0D9387]" /> Reservas
        </h2>
        {reservations.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 p-4 bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800">
            Sin reservas en este expediente.
          </p>
        ) : (
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Destino</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Salida</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2.5 font-mono text-xs text-[#0D9387]">{r.code || `#${r.id?.slice(0, 8)}`}</td>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{r.destination}</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 text-xs">{formatDate(r.departure_date)}</td>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{formatCurrency(r.total_amount, r.currency)}</td>
                    <td className="px-4 py-2.5"><StatusBadge value={r.status} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <Link to={`/admin/reservas/${r.id}`} className="text-xs text-[#0D9387] hover:text-[#0b7d72] font-medium">Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
