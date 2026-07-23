import React, { useEffect, useState, useMemo } from "react";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Plus, Search, Loader2, Pencil, Trash2, UserCog, X, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../lib/format";
import { useAuth } from "./AuthContext";

const empty = { username: "", name: "", email: "", role: "advisor", status: "activo", phone: "", avatar_url: "", department: "", notes: "", password: "" };
const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#132D52] text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";
const ROLE_LABELS = { super_admin: "Super Administrador", admin: "Administrador", advisor: "Asesor" };

export default function Users() {
  const { user: current } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const canManage = current && (current.role === "super_admin" || current.role === "admin");

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (roleFilter) params.role_f = roleFilter;
      if (statusFilter) params.status_f = statusFilter;
      const { data } = await api.get("/users", { params });
      setItems(data);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar usuarios");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!canManage) { setLoading(false); return; }
    const t = setTimeout(() => { setPage(1); load(); }, 200);
    return () => clearTimeout(t);
  }, [q, roleFilter, statusFilter, canManage]); // eslint-disable-line

  const paginated = useMemo(() => items.slice((page - 1) * perPage, page * perPage), [items, page]);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const openCreate = () => { setEditingId(null); setForm(empty); setShowPassword(false); setModalOpen(true); };
  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({
      username: u.username || "",
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status || "activo",
      phone: u.phone || "",
      avatar_url: u.avatar_url || "",
      department: u.department || "",
      notes: u.notes || "",
      password: "",
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form };
      if (editingId && !body.password) delete body.password;
      if (editingId) { await api.put(`/users/${editingId}`, body); toast.success("Usuario actualizado"); }
      else { await api.post("/users", body); toast.success("Usuario creado"); }
      setModalOpen(false); load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail) || "No fue posible guardar"); }
    finally { setSaving(false); }
  };

  const remove = async (u) => {
    if (u.id === current?.id) { toast.error("No puedes eliminar tu propio usuario"); return; }
    if (!window.confirm(`¿Eliminar a ${u.name}?`)) return;
    try { await api.delete(`/users/${u.id}`); toast.success("Usuario eliminado"); load(); }
    catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  if (!canManage) {
    return (
      <div data-testid="users-page">
        <PageHeader title="Usuarios" description="Administra los usuarios del sistema." />
        <div className="bg-white dark:bg-[#0F2444] rounded-[16px] border border-gray-200 dark:border-[#1A3356] p-16 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 flex items-center justify-center mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Acceso restringido</h3>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 max-w-md">Solo los administradores pueden gestionar los usuarios del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="users-page">
      <PageHeader
        title="Usuarios"
        description="Administra los usuarios del sistema."
        action={
          <button onClick={openCreate} data-testid="users-new-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Nuevo usuario
          </button>
        }
      />

      <div className="bg-white dark:bg-[#0F2444] rounded-[16px] border border-gray-200 dark:border-[#1A3356] shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1A3356] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input data-testid="users-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, correo o usuario…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-[#1A3356] bg-white dark:bg-[#0F2444] text-gray-900 dark:text-gray-100 rounded-[10px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <select data-testid="users-role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="text-sm border border-gray-200 dark:border-[#1A3356] rounded-[10px] px-3 py-2 outline-none bg-white dark:bg-[#0F2444] text-gray-900 dark:text-gray-100">
            <option value="">Todos los roles</option>
            <option value="super_admin">Super Administrador</option>
            <option value="admin">Administrador</option>
            <option value="advisor">Asesor</option>
          </select>
          <select data-testid="users-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 dark:border-[#1A3356] rounded-[10px] px-3 py-2 outline-none bg-white dark:bg-[#0F2444] text-gray-900 dark:text-gray-100">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-300 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>
        ) : items.length === 0 ? (
          <EmptyState title="Sin usuarios" description="Crea el primer usuario del sistema." icon={UserCog} />
        ) : (
          <>
            <table className="w-full text-sm" data-testid="users-table">
              <thead className="bg-gray-50 dark:bg-[#132D52] border-b border-gray-200 dark:border-[#1A3356]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Correo</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Último acceso</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-[#1A3356] last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                          {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div>
                          <div className="text-gray-900 dark:text-gray-100 font-medium">{u.name}</div>
                          {u.username && <div className="text-xs text-gray-400 dark:text-gray-400">@{u.username}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-[#1A3356] bg-gray-50 dark:bg-[#132D52] px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3"><StatusBadge value={u.status || "activo"} /></td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{u.last_login ? formatDate(u.last_login) : "—"}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openEdit(u)} data-testid={`user-edit-${u.id}`} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(u)} data-testid={`user-delete-${u.id}`} disabled={u.id === current?.id} className="h-8 w-8 rounded-[8px] hover:bg-red-50 flex items-center justify-center text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 border-t border-gray-200 dark:border-[#1A3356] flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
              <div>Mostrando {paginated.length} de {items.length}</div>
              <div className="flex items-center gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-200 dark:border-[#1A3356] rounded-[8px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Anterior</button>
                <span className="text-gray-700 dark:text-gray-300">Página {page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-gray-200 dark:border-[#1A3356] rounded-[8px] disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div data-testid="user-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={save} className="mt-16 bg-white dark:bg-[#0F2444] rounded-[16px] shadow-xl border border-gray-200 dark:border-[#1A3356] w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? "Editar usuario" : "Nuevo usuario"}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"><X className="h-4 w-4 text-gray-500 dark:text-gray-300" /></button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Grupo 1: Requeridos */}
              <div className="border-b border-gray-100 dark:border-[#1A3356] pb-3 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">Datos Principales y Acceso</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre completo" required>
                  <input data-testid="user-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Usuario (@)">
                  <input data-testid="user-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="johndoe" className={inputCls} />
                </Field>
              </div>
              <Field label="Correo electrónico" required>
                <input data-testid="user-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rol" required>
                  <select data-testid="user-role" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                    <option value="advisor">Asesor</option>
                    <option value="admin">Administrador</option>
                    {current?.role === "super_admin" && <option value="super_admin">Super Administrador</option>}
                  </select>
                </Field>
                <Field label="Estado">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </Field>
              </div>
              <Field label={editingId ? "Nueva contraseña (dejar vacío para mantener)" : "Contraseña"} required={!editingId}>
                <div className="relative">
                  <input data-testid="user-password" type={showPassword ? "text" : "password"} required={!editingId} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputCls} pr-10`} minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {/* Grupo 2: Opcionales */}
              <div className="border-b border-gray-100 dark:border-[#1A3356] pb-3 mb-1 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">Información Complementaria (Opcional)</span>
              </div>
              <Field label="Teléfono / WhatsApp">
                <input data-testid="user-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+57 300 123 4567" className={inputCls} />
              </Field>
              <Field label="Departamento / Sucursal">
                <input data-testid="user-department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Ej. Ventas, Soporte, Sucursal Norte" className={inputCls} />
              </Field>
              <Field label="Notas internas">
                <textarea rows={2} data-testid="user-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Ej. Asesor del turno de la tarde" className={inputCls} />
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3356] rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">Cancelar</button>
              <button type="submit" disabled={saving} data-testid="user-save-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60">
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
        {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 dark:text-gray-400 text-xs font-normal">— Opcional</span>}
      </label>
      {children}
    </div>
  );
}
