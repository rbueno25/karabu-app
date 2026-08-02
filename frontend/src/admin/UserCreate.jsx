import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { ArrowLeft, Loader2, Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none transition-colors";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const empty = {
  username: "", name: "", email: "", role: "advisor", status: "activo",
  phone: "", avatar_url: "", department: "", notes: "", password: "",
};

export default function UserCreate() {
  const { user: current } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canManage = current && (current.role === "super_admin" || current.role === "admin");
  if (!canManage) return null; // ProtectedRoute handles redirect

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/users", form);
      toast.success("Usuario creado correctamente");
      nav("/admin/usuarios");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "No fue posible crear el usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="user-create-page">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => nav("/admin/usuarios")}
          className="h-9 w-9 rounded-[10px] hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nuevo Usuario</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Completa los datos para crear un usuario en el sistema</p>
        </div>
      </div>

      <form onSubmit={save} className="bg-white dark:bg-zinc-900 rounded-[16px] border border-gray-200 dark:border-zinc-800 p-6 sm:p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda */}
          <div className="space-y-5">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">Datos Principales</span>
            </div>

            <Field label="Nombre completo" required>
              <input
                data-testid="user-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Carlos Bueno"
                className={inputCls}
              />
            </Field>

            <Field label="Nombre de usuario (@)">
              <input
                data-testid="user-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="carlosb"
                className={inputCls}
              />
            </Field>

            <Field label="Correo electrónico" required>
              <input
                data-testid="user-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="carlos@karabu.com"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Rol" required>
                <select
                  data-testid="user-role"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputCls}
                >
                  <option value="advisor">Asesor</option>
                  <option value="admin">Administrador</option>
                  {current?.role === "super_admin" && <option value="super_admin">Super Administrador</option>}
                </select>
              </Field>
              <Field label="Estado">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputCls}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </Field>
            </div>

            <Field label="Contraseña" required>
              <div className="relative">
                <input
                  data-testid="user-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`${inputCls} pr-10`}
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          {/* Columna derecha */}
          <div className="space-y-5">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-3 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">Información Complementaria</span>
            </div>

            <Field label="Teléfono / WhatsApp">
              <input
                data-testid="user-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 809 555 1234"
                className={inputCls}
              />
              <p className="text-[11px] text-gray-400 mt-1">Este número aparecerá en el entregable para que el cliente pueda contactarte.</p>
            </Field>

            <Field label="URL de foto de perfil">
              <input
                data-testid="user-avatar"
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                placeholder="https://..."
                className={inputCls}
              />
              <p className="text-[11px] text-gray-400 mt-1">Si no agregas una, se mostrarán tus iniciales como avatar.</p>
            </Field>

            <Field label="Departamento / Sucursal">
              <input
                data-testid="user-department"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Ej. Ventas, Soporte, Sucursal Norte"
                className={inputCls}
              />
            </Field>

            <Field label="Notas internas">
              <textarea
                rows={3}
                data-testid="user-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ej. Asesor del turno de la tarde, especialista en paquetes familiares"
                className={inputCls}
              />
            </Field>

            {/* Vista previa del avatar */}
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 block mb-3">Vista previa del avatar</span>
              <div className="flex items-center gap-3">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="Preview" className="h-12 w-12 rounded-full object-cover border-2 border-[#0D9387]" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[#0D9387] text-white flex items-center justify-center text-base font-bold">
                    {form.name ? form.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() : "?"}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{form.name || "Nombre del asesor"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{form.role === "super_admin" ? "Super Administrador" : form.role === "admin" ? "Administrador" : "Asesor"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => nav("/admin/usuarios")}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 rounded-[10px] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            data-testid="user-save-btn"
            className="inline-flex items-center gap-2 bg-[#0D9387] hover:bg-[#0b7d72] text-white rounded-[10px] px-6 py-2.5 text-sm font-medium disabled:opacity-60 shadow-sm transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {saving ? "Creando..." : "Crear Usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className={labelCls}>
        {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 dark:text-gray-400 text-xs font-normal">— Opcional</span>}
      </label>
      {children}
    </div>
  );
}
