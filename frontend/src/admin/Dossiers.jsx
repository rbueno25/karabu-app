import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import { Search, FolderOpen, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../lib/format";

const statusLabel = {
  abierto: "Abierto",
  reservado: "Reservado",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

const statusCls = {
  abierto: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  reservado: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  cerrado: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  cancelado: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function Dossiers() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dossiers");
      setItems(res.data || []);
    } catch (err) {
      toast.error(formatApiError(err, "Error al cargar expedientes"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Focus search if ?search= param
    const sq = searchParams.get("search");
    if (sq) setSearch(sq);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (d) =>
        (d.code || "").toLowerCase().includes(q) ||
        (d.client_name || "").toLowerCase().includes(q) ||
        (d.status || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 p-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando expedientes...
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Expedientes" subtitle={`${filtered.length} expediente(s)`}>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar expediente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none"
          />
        </div>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-8 w-8 text-gray-400" />}
          title="No hay expedientes"
          description={search ? "Sin resultados para esta búsqueda." : "Los expedientes se crean automáticamente al registrar cotizaciones."}
        />
      ) : (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden mt-6 shadow-sm">
          <table className="w-full text-sm" data-testid="dossiers-table">
            <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cotizaciones</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reservas</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-3 font-mono text-xs text-[#0D9387] font-medium">{d.code}</td>
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">{d.client_name}</td>
                  <td className="px-6 py-3 text-center text-gray-500 dark:text-gray-400">{d.quotation_count}</td>
                  <td className="px-6 py-3 text-center text-gray-500 dark:text-gray-400">{d.reservation_count}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCls[d.status] || statusCls.abierto}`}>
                      {statusLabel[d.status] || "Abierto"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      to={`/admin/expedientes/${d.id}`}
                      data-testid={`dossier-link-${d.id}`}
                      className="inline-flex items-center gap-1 text-xs text-[#0D9387] hover:text-[#0b7d72] font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
