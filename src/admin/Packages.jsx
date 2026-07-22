import React, { useEffect, useState, useMemo } from "react";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Plus, Search, Loader2, Pencil, Trash2, Package as PackageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "../lib/format";

const empty = { name: "", destination: "", price: 0, currency: "USD", duration_days: 1, description: "", status: "activo" };
const inputCls = "w-full rounded-[10px] border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

export default function Packages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (statusFilter) params.status_f = statusFilter;
      const { data } = await api.get("/packages", { params });
      setItems(data);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar paquetes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 200);
    return () => clearTimeout(t);
  }, [q, statusFilter]); // eslint-disable-line

  const paginated = useMemo(() => items.slice((page - 1) * perPage, page * perPage), [items, page]);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const openCreate = () => { setEditingId(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, destination: p.destination, price: p.price, currency: p.currency || "USD", duration_days: p.duration_days || 1, description: p.description || "", status: p.status || "activo" });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price), duration_days: Number(form.duration_days) };
      if (editingId) { await api.put(`/packages/${editingId}`, body); toast.success("Paquete actualizado"); }
      else { await api.post("/packages", body); toast.success("Paquete creado"); }
      setModalOpen(false); load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail) || "No fue posible guardar"); }
    finally { setSaving(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(`¿Eliminar el paquete ${p.name}?`)) return;
    try { await api.delete(`/packages/${p.id}`); toast.success("Paquete eliminado"); load(); }
    catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  return (
    <div data-testid="packages-page">
      <PageHeader
        title="Paquetes"
        description="Administra paquetes turísticos propios."
        action={
          <button onClick={openCreate} data-testid="packages-new-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Nuevo paquete
          </button>
        }
      />

      <div className="bg-white rounded-[16px] border border-gray-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input data-testid="packages-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o destino…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-[10px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <select data-testid="packages-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-[10px] px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>
        ) : items.length === 0 ? (
          <EmptyState title="Sin paquetes" description="Crea el primer paquete turístico." icon={PackageIcon} />
        ) : (
          <>
            <table className="w-full text-sm" data-testid="packages-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-gray-700">{p.destination}</td>
                    <td className="px-6 py-3 text-gray-900">{formatCurrency(p.price, p.currency)}</td>
                    <td className="px-6 py-3 text-gray-700">{p.duration_days} días</td>
                    <td className="px-6 py-3"><StatusBadge value={p.status} /></td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openEdit(p)} data-testid={`package-edit-${p.id}`} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 flex items-center justify-center text-gray-600"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(p)} data-testid={`package-delete-${p.id}`} className="h-8 w-8 rounded-[8px] hover:bg-red-50 flex items-center justify-center text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <div>Mostrando {paginated.length} de {items.length}</div>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-200 rounded-[8px] disabled:opacity-40 hover:bg-gray-50">Anterior</button>
                <span className="text-gray-700">Página {page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-gray-200 rounded-[8px] disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div data-testid="package-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={save} className="mt-16 bg-white rounded-[16px] shadow-xl border border-gray-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? "Editar paquete" : "Nuevo paquete"}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 flex items-center justify-center"><X className="h-4 w-4 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <Field label="Nombre del paquete" required>
                <input data-testid="package-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Destino" required>
                <input data-testid="package-destination" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Precio" required>
                  <input data-testid="package-price" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Moneda">
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}>
                    <option>USD</option><option>COP</option><option>EUR</option><option>MXN</option>
                  </select>
                </Field>
                <Field label="Duración (días)" required>
                  <input type="number" min={1} required value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Descripción">
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Estado">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </Field>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-[10px] hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} data-testid="package-save-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60">
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
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
