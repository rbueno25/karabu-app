import React, { useEffect, useState, useMemo } from "react";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Plus, Search, Loader2, Pencil, Trash2, MapPin, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", country: "", image_url: "", description: "", status: "activo" };
const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

export default function Destinations() {
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
      const { data } = await api.get("/destinations", { params });
      setItems(data);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar destinos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 200);
    return () => clearTimeout(t);
  }, [q, statusFilter]); // eslint-disable-line

  const paginated = useMemo(() => items.slice((page - 1) * perPage, page * perPage), [items, page]);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const openCreate = () => { setEditingId(null); setForm(empty); setModalOpen(true); };
  const openEdit = (d) => {
    setEditingId(d.id);
    setForm({ name: d.name, country: d.country, image_url: d.image_url || "", description: d.description || "", status: d.status || "activo" });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) { await api.put(`/destinations/${editingId}`, form); toast.success("Destino actualizado"); }
      else { await api.post("/destinations", form); toast.success("Destino creado"); }
      setModalOpen(false); load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail) || "No fue posible guardar"); }
    finally { setSaving(false); }
  };

  const remove = async (d) => {
    if (!window.confirm(`¿Eliminar el destino ${d.name}?`)) return;
    try { await api.delete(`/destinations/${d.id}`); toast.success("Destino eliminado"); load(); }
    catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  return (
    <div data-testid="destinations-page">
      <PageHeader
        title="Destinos"
        description="Administra los destinos mostrados en la página principal."
        action={
          <button onClick={openCreate} data-testid="destinations-new-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Nuevo destino
          </button>
        }
      />
      <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-gray-200 dark:border-zinc-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input data-testid="destinations-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por destino o país…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 rounded-[10px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <select data-testid="destinations-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 dark:border-zinc-800 rounded-[10px] px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-300 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>
        ) : items.length === 0 ? (
          <EmptyState title="Sin destinos" description="Crea el primer destino." icon={MapPin} />
        ) : (
          <>
            <table className="w-full text-sm" data-testid="destinations-table">
              <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Imagen</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Destino</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">País</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-3">
                      {d.image_url ? (
                        <img src={d.image_url} alt={d.name} className="h-10 w-16 object-cover rounded-[8px] border border-gray-200 dark:border-zinc-800" />
                      ) : (
                        <div className="h-10 w-16 rounded-[8px] bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-400 dark:text-gray-400">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">{d.name}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{d.country}</td>
                    <td className="px-6 py-3"><StatusBadge value={d.status} /></td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openEdit(d)} data-testid={`destination-edit-${d.id}`} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(d)} data-testid={`destination-delete-${d.id}`} className="h-8 w-8 rounded-[8px] hover:bg-red-50 flex items-center justify-center text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} setPage={setPage} totalPages={totalPages} shown={paginated.length} total={items.length} />
          </>
        )}
      </div>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} title={editingId ? "Editar destino" : "Nuevo destino"} onSubmit={save} saving={saving} testId="destination-modal" saveTestId="destination-save-btn">
          <Field label="Nombre del destino" required>
            <input data-testid="destination-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="País" required>
            <input data-testid="destination-country" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls} />
          </Field>
          <Field label="URL de la imagen">
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls} placeholder="https://…" />
          </Field>
          <Field label="Descripción">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Estado">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </Field>
        </Modal>
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

function Pagination({ page, setPage, totalPages, shown, total }) {
  return (
    <div className="px-6 py-3 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
      <div>Mostrando {shown} de {total}</div>
      <div className="flex items-center gap-2">
        <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-200 dark:border-zinc-800 rounded-[8px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Anterior</button>
        <span className="text-gray-700 dark:text-gray-300">Página {page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-gray-200 dark:border-zinc-800 rounded-[8px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Siguiente</button>
      </div>
    </div>
  );
}

function Modal({ onClose, title, onSubmit, saving, children, testId, saveTestId }) {
  return (
    <div data-testid={testId} className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <form onSubmit={onSubmit} className="mt-16 bg-white dark:bg-zinc-900 rounded-[16px] shadow-xl border border-gray-200 dark:border-zinc-800 w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button type="button" onClick={onClose} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
            <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">Cancelar</button>
          <button type="submit" disabled={saving} data-testid={saveTestId} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
