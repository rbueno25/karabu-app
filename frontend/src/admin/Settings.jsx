import React, { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import { Loader2, Building2, ImageIcon, Share2, DollarSign, Percent, Mail, FileText, Lock, User, Key } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { handlePhoneInput } from "../utils/phone";

const SECTIONS = [
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "logo", label: "Logo", icon: ImageIcon },
  { id: "redes", label: "Redes sociales", icon: Share2 },
  { id: "moneda", label: "Moneda", icon: DollarSign },
  { id: "impuestos", label: "Impuestos", icon: Percent },
  { id: "correo", label: "Correo", icon: Mail },
  { id: "plantillas", label: "Plantillas", icon: FileText },
  { id: "seguridad", label: "Seguridad", icon: Lock },
  { id: "perfil", label: "Mi Perfil", icon: User },
];

const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState("empresa");
  const [form, setForm] = useState(null);

  const canEdit = user && (user.role === "super_admin" || user.role === "admin");

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    current_password: "",
    new_password: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const body = { name: profileForm.name, phone: profileForm.phone };
      if (profileForm.new_password) {
        body.current_password = profileForm.current_password;
        body.new_password = profileForm.new_password;
      }
      await api.put("/profile", body);
      toast.success("Perfil actualizado");
      setProfileForm(p => ({ ...p, current_password: "", new_password: "" }));
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al actualizar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/settings");
        setForm(data);
      } catch (e) {
        toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar configuración");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, tax_percent: Number(form.tax_percent), smtp_port: Number(form.smtp_port), session_hours: Number(form.session_hours) };
      await api.put("/settings", body);
      toast.success("Configuración guardada");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "No fue posible guardar");
    } finally { setSaving(false); }
  };

  if (loading || !form) {
    return (
      <div>
        <PageHeader title="Configuración" description="Configuración general de la empresa." />
        <div className="p-10 text-center text-gray-500 dark:text-gray-300 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>
      </div>
    );
  }

  return (
    <div data-testid="settings-page">
      <PageHeader title="Configuración" description="Configuración general de tu agencia." />

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <nav className="bg-white dark:bg-zinc-900 rounded-[16px] border border-gray-200 dark:border-zinc-800 p-2 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                data-testid={`settings-tab-${id}`}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-colors text-left",
                  section === id ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-teal-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
        </aside>

        <form onSubmit={save} className="col-span-12 md:col-span-9 bg-white dark:bg-zinc-900 rounded-[16px] border border-gray-200 dark:border-zinc-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] space-y-6" data-testid="settings-form">
          {!canEdit && (
            <div className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 rounded-[10px] px-3 py-2">
              Solo lectura. Únicamente los administradores pueden modificar la configuración.
            </div>
          )}

          {section === "empresa" && (
            <div className="space-y-4">
              <SectionTitle>Información de la empresa</SectionTitle>
              <Field label="Nombre de la empresa">
                <input data-testid="settings-company-name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className={inputCls} disabled={!canEdit} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Correo de contacto">
                  <input type="email" value={form.company_email} onChange={(e) => setForm({ ...form, company_email: e.target.value })} className={inputCls} disabled={!canEdit} />
                </Field>
                <Field label="Teléfono">
                  <input value={form.company_phone} onChange={(e) => setForm({ ...form, company_phone: handlePhoneInput(e.target.value) })} className={inputCls} disabled={!canEdit} />
                </Field>
              </div>
              <Field label="Dirección">
                <input value={form.company_address} onChange={(e) => setForm({ ...form, company_address: e.target.value })} className={inputCls} disabled={!canEdit} />
              </Field>
            </div>
          )}

          {section === "logo" && (
            <div className="space-y-4">
              <SectionTitle>Logo de la empresa</SectionTitle>
              <Field label="URL del logo">
                <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className={inputCls} placeholder="https://…" disabled={!canEdit} />
              </Field>
              {form.logo_url ? (
                <div className="border border-gray-200 dark:border-zinc-800 rounded-[10px] p-4 bg-gray-50 dark:bg-zinc-800">
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-2">Vista previa</div>
                  <img src={form.logo_url} alt="Logo" className="max-h-24 object-contain" />
                </div>
              ) : null}
            </div>
          )}

          {section === "redes" && (
            <div className="space-y-4">
              <SectionTitle>Redes sociales</SectionTitle>
              <Field label="Facebook"><input value={form.social_facebook} onChange={(e) => setForm({ ...form, social_facebook: e.target.value })} className={inputCls} disabled={!canEdit} /></Field>
              <Field label="Instagram"><input value={form.social_instagram} onChange={(e) => setForm({ ...form, social_instagram: e.target.value })} className={inputCls} disabled={!canEdit} /></Field>
              <Field label="X (Twitter)"><input value={form.social_twitter} onChange={(e) => setForm({ ...form, social_twitter: e.target.value })} className={inputCls} disabled={!canEdit} /></Field>
              <Field label="WhatsApp"><input value={form.social_whatsapp} onChange={(e) => setForm({ ...form, social_whatsapp: e.target.value })} className={inputCls} disabled={!canEdit} /></Field>
            </div>
          )}

          {section === "moneda" && (
            <div className="space-y-4">
              <SectionTitle>Moneda predeterminada</SectionTitle>
              <Field label="Moneda">
                <select value={form.default_currency} onChange={(e) => setForm({ ...form, default_currency: e.target.value })} className={inputCls} disabled={!canEdit}>
                  <option>USD</option><option>COP</option><option>EUR</option><option>MXN</option><option>PEN</option><option>ARS</option>
                </select>
              </Field>
            </div>
          )}

          {section === "impuestos" && (
            <div className="space-y-4">
              <SectionTitle>Impuestos</SectionTitle>
              <Field label="Porcentaje de impuesto (%)">
                <input type="number" step="0.01" min={0} max={100} value={form.tax_percent} onChange={(e) => setForm({ ...form, tax_percent: e.target.value })} className={inputCls} disabled={!canEdit} />
              </Field>
            </div>
          )}

          {section === "correo" && (
            <div className="space-y-4">
              <SectionTitle>Configuración de correo (SMTP)</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Host SMTP"><input value={form.smtp_host} onChange={(e) => setForm({ ...form, smtp_host: e.target.value })} className={inputCls} disabled={!canEdit} /></Field>
                <Field label="Puerto"><input type="number" value={form.smtp_port} onChange={(e) => setForm({ ...form, smtp_port: e.target.value })} className={inputCls} disabled={!canEdit} /></Field>
              </div>
              <Field label="Usuario SMTP"><input value={form.smtp_user} onChange={(e) => setForm({ ...form, smtp_user: e.target.value })} className={inputCls} disabled={!canEdit} /></Field>
              <Field label="Correo remitente (From)"><input type="email" value={form.smtp_from} onChange={(e) => setForm({ ...form, smtp_from: e.target.value })} className={inputCls} disabled={!canEdit} /></Field>
            </div>
          )}

          {section === "plantillas" && (
            <div className="space-y-4">
              <SectionTitle>Plantillas de correo</SectionTitle>
              <Field label="Plantilla de cotización">
                <textarea rows={6} value={form.template_quotation} onChange={(e) => setForm({ ...form, template_quotation: e.target.value })} className={inputCls} placeholder="Hola {cliente}, adjuntamos tu cotización para {destino}…" disabled={!canEdit} />
              </Field>
              <Field label="Plantilla de confirmación de reserva">
                <textarea rows={6} value={form.template_reservation} onChange={(e) => setForm({ ...form, template_reservation: e.target.value })} className={inputCls} placeholder="Hola {cliente}, tu reserva ha sido confirmada…" disabled={!canEdit} />
              </Field>
            </div>
          )}

          {section === "seguridad" && (
            <div className="space-y-4">
              <SectionTitle>Seguridad</SectionTitle>
              <Field label="Duración de sesión (horas)">
                <input type="number" min={1} max={168} value={form.session_hours} onChange={(e) => setForm({ ...form, session_hours: e.target.value })} className={inputCls} disabled={!canEdit} />
              </Field>
              <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={!!form.require_2fa} onChange={(e) => setForm({ ...form, require_2fa: e.target.checked })} disabled={!canEdit} className="rounded border-gray-300 dark:border-gray-600 text-[#0D9387] focus:ring-[#0D9387]" />
                Requerir autenticación en dos pasos (2FA) — próximamente
              </label>
            </div>
          )}

          {section === "perfil" && (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <SectionTitle>Mi Perfil</SectionTitle>
              <Field label="Nombre completo">
                <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Teléfono / WhatsApp">
                <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: handlePhoneInput(e.target.value) })} className={inputCls} />
              </Field>
              <Field label="Email">
                <input value={user?.email || ""} disabled className={`${inputCls} opacity-60`} />
                <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar. Contacta al administrador.</p>
              </Field>

              <hr className="border-gray-100 dark:border-zinc-800" />
              <SectionTitle className="text-sm">Cambiar contraseña</SectionTitle>
              <Field label="Contraseña actual">
                <input type="password" value={profileForm.current_password} onChange={(e) => setProfileForm({ ...profileForm, current_password: e.target.value })} className={inputCls} placeholder="••••••••" />
              </Field>
              <Field label="Nueva contraseña">
                <input type="password" value={profileForm.new_password} onChange={(e) => setProfileForm({ ...profileForm, new_password: e.target.value })} className={inputCls} placeholder="Mínimo 6 caracteres" />
              </Field>

              <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button type="submit" disabled={savingProfile} className="inline-flex items-center gap-2 bg-[#0D9387] hover:bg-[#0b7d72] text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60">
                  {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />} Actualizar perfil
                </button>
              </div>
            </form>
          )}

          {canEdit && (
            <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
              <button type="submit" disabled={saving} data-testid="settings-save-btn" className="inline-flex items-center gap-2 bg-[#0D9387] hover:bg-[#0b7d72] text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar cambios
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-zinc-800 pb-3">{children}</h3>;
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
