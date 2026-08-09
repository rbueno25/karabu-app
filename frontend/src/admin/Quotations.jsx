import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Plus, Search, Loader2, Pencil, Trash2, FileText, ArrowRight, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../lib/format";

const emptyQuote = {
  client_id: "",
  destination: "",
  travel_date: "",
  return_date: "",
  travelers: 1,
  amount: 0,
  currency: "USD",
  notes: "",
  status: "borrador",
};

const inputCls = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none";
const selectCls = "text-sm border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100";

export default function Quotations() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyQuote);
  const [page, setPage] = useState(1);
  const [convertedIds, setConvertedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("karabu_converted_ids") || "[]"));
    } catch { return new Set(); }
  });
  const perPage = 10;

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status_f = statusFilter;
      const [qs, cs] = await Promise.all([
        api.get("/quotations", { params }),
        api.get("/clients"),
      ]);
      setItems(qs.data);
      setClients(cs.data);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar cotizaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [statusFilter]);

  // Polling cada 60s (solo pestaña activa)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 60000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  // Client-side search + pagination + date filter
  const filtered = useMemo(() => {
    let result = items;
    if (q) {
      const lower = q.toLowerCase();
      result = result.filter((it) =>
        (it.client_name || "").toLowerCase().includes(lower) ||
        (it.destination || "").toLowerCase().includes(lower)
      );
    }
    if (dateFrom) {
      result = result.filter((it) => (it.travel_date || "").slice(0, 10) >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((it) => (it.travel_date || "").slice(0, 10) <= dateTo);
    }
    return result;
  }, [items, q, dateFrom, dateTo]);

  const paginated = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyQuote, client_id: clients[0]?.id || "" });
    setModalOpen(true);
  };

  const openEdit = (q) => {
    setEditingId(q.id);
    setForm({
      client_id: q.client_id,
      destination: q.destination,
      travel_date: (q.travel_date || "").slice(0, 10),
      return_date: (q.return_date || "").slice(0, 10),
      travelers: q.travelers || 1,
      amount: q.amount || 0,
      currency: q.currency || "USD",
      notes: q.notes || "",
      status: q.status || "borrador",
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, travelers: Number(form.travelers), amount: Number(form.amount) };
      if (editingId) {
        await api.put(`/quotations/${editingId}`, body);
        toast.success("Cotización actualizada");
      } else {
        await api.post("/quotations", body);
        toast.success("Cotización creada");
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "No fue posible guardar la cotización");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (q) => {
    if (!window.confirm("¿Eliminar esta cotización?")) return;
    try {
      await api.delete(`/quotations/${q.id}`);
      toast.success("Cotización eliminada");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  const convert = async (q) => {
    try {
      await api.post(`/quotations/${q.id}/convert`);
      toast.success("Convertida en reserva");
      const next = new Set([...convertedIds, q.id]);
      setConvertedIds(next);
      localStorage.setItem("karabu_converted_ids", JSON.stringify([...next]));
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "No fue posible convertir");
    }
  };

  return (
    <div data-testid="quotations-page">
      <PageHeader
        title="Cotizaciones"
        description="Crea y administra cotizaciones para tus clientes."
        action={
          <button
            onClick={openCreate}
            data-testid="quotations-new-btn"
            className="inline-flex items-center gap-2 bg-[#0D9387] hover:bg-[#0b7d72] text-white rounded-[10px] px-4 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nueva cotización
          </button>
        }
      />

      <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-gray-200 dark:border-zinc-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Buscar por cliente o destino…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 rounded-[10px] focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none"
            />
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className={selectCls}
            title="Fecha desde"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className={selectCls}
            title="Fecha hasta"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={selectCls}
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviada">Enviada</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
            <option value="expirada">Expirada</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-300 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sin cotizaciones"
            description="Crea la primera cotización para un cliente."
            icon={FileText}
          />
        ) : (
          <>
            <table className="w-full text-sm" data-testid="quotations-table">
              <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Código</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Destino</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha viaje</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((q) => (
                  <tr key={q.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">{q.client_name}</td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{q.code || `#${q.id?.slice(0, 8)}`}</td>
                    <td className="px-6 py-3">
                      <Link
                        to={`/admin/cotizaciones/${q.id}`}
                        data-testid={`quotation-link-${q.id}`}
                        className="text-[#0D9387] hover:text-[#0b7d72] font-medium hover:underline transition-colors"
                      >
                        {q.destination}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{formatDate(q.travel_date)}</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{formatCurrency(q.amount, q.currency)}</td>
                    <td className="px-6 py-3"><StatusBadge value={q.status} /></td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/admin/cotizaciones/${q.id}`}
                          data-testid={`quotation-edit-${q.id}`}
                          className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <a
                          href={`/#/cotizacion/${q.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`quotation-view-${q.id}`}
                          className="h-8 w-8 rounded-[8px] hover:bg-brand-turquoise/10 dark:hover:bg-brand-turquoise/20 flex items-center justify-center text-brand-turquoise transition-colors"
                          title="Ver entregable del cliente"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => remove(q)}
                          className="h-8 w-8 rounded-[8px] hover:bg-red-50 flex items-center justify-center text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
              <div>Mostrando {paginated.length} de {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-200 dark:border-zinc-800 rounded-[8px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Anterior</button>
                <span className="text-gray-700 dark:text-gray-300">Página {page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-gray-200 dark:border-zinc-800 rounded-[8px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div data-testid="quotation-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={save} className="mt-16 bg-white dark:bg-zinc-900 rounded-[16px] shadow-xl border border-gray-200 dark:border-zinc-800 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? "Editar cotización" : "Nueva cotización"}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Cliente" required>
                <select data-testid="quotation-client" required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={inputCls}>
                  <option value="">Selecciona un cliente…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Destino" required>
                <input data-testid="quotation-destination" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fecha viaje">
                  <input type="date" value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Fecha regreso">
                  <input type="date" value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Viajeros">
                  <input type="number" min={1} value={form.travelers} onChange={(e) => setForm({ ...form, travelers: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Monto">
                  <input data-testid="quotation-amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Moneda">
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}>
                    <option>USD</option>
                    <option>COP</option>
                    <option>EUR</option>
                    <option>MXN</option>
                  </select>
                </Field>
              </div>
              <Field label="Estado">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  <option value="borrador">Borrador</option>
                  <option value="enviada">Enviada</option>
                  <option value="aceptada">Aceptada</option>
                  <option value="rechazada">Rechazada</option>
                  <option value="expirada">Expirada</option>
                </select>
              </Field>
              <Field label="Observaciones">
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancelar
              </button>
              <button type="submit" disabled={saving} data-testid="quotation-save-btn" className="inline-flex items-center gap-2 bg-[#0D9387] hover:bg-[#0b7d72] text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
