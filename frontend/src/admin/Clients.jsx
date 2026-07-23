import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Plus, Search, Loader2, Pencil, Trash2, Users as UsersIcon, X } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../lib/format";

const empty = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  document_id: "",
  address: "",
  notes: "",
  status: "activo",
};

export default function Clients() {
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
      const { data } = await api.get("/clients", { params });
      setItems(data);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page]);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const openCreate = () => {
    setEditingId(null);
    setForm(empty);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email,
      phone: c.phone,
      document_id: c.document_id || "",
      address: c.address || "",
      notes: c.notes || "",
      status: c.status || "activo",
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, form);
        toast.success("Cliente actualizado");
      } else {
        await api.post("/clients", form);
        toast.success("Cliente creado");
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "No fue posible guardar el cliente");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`¿Eliminar a ${c.first_name} ${c.last_name}?`)) return;
    try {
      await api.delete(`/clients/${c.id}`);
      toast.success("Cliente eliminado");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "No fue posible eliminar el cliente");
    }
  };

  return (
    <div data-testid="clients-page">
      <PageHeader
        title="Clientes"
        description="Administra todos los clientes de tu agencia."
        action={
          <button
            onClick={openCreate}
            data-testid="clients-new-btn"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nuevo cliente
          </button>
        }
      />

      <div className="bg-white dark:bg-gray-900 rounded-[16px] border border-gray-200 dark:border-gray-700 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              data-testid="clients-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, correo o teléfono…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-[10px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <select
            data-testid="clients-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-[10px] px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Sin clientes"
            description="Aún no se han registrado clientes. Crea el primero."
            icon={UsersIcon}
            action={
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Nuevo cliente
              </button>
            }
          />
        ) : (
          <>
            <table className="w-full text-sm" data-testid="clients-table">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Correo</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teléfono</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registro</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-3">
                      <Link
                        to={`/admin/clientes/${c.id}`}
                        data-testid={`client-link-${c.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                      >
                        {c.first_name} {c.last_name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{c.email}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{c.phone}</td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{formatDate(c.created_at)}</td>
                    <td className="px-6 py-3"><StatusBadge value={c.status} /></td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          data-testid={`client-edit-${c.id}`}
                          className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(c)}
                          data-testid={`client-delete-${c.id}`}
                          className="h-8 w-8 rounded-[8px] hover:bg-red-50 flex items-center justify-center text-red-600"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div>Mostrando {paginated.length} de {items.length}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-[8px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Anterior
                </button>
                <span className="text-gray-700 dark:text-gray-300">Página {page} / {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-[8px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div data-testid="client-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={save}
            className="mt-16 bg-white dark:bg-gray-900 rounded-[16px] shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? "Editar cliente" : "Nuevo cliente"}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre" required>
                  <input data-testid="client-first-name" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Apellidos" required>
                  <input data-testid="client-last-name" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Correo" required>
                <input data-testid="client-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Teléfono" required>
                  <input data-testid="client-phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Documento">
                  <input value={form.document_id} onChange={(e) => setForm({ ...form, document_id: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Dirección">
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Observaciones">
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Estado">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                data-testid="client-save-btn"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow";

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
