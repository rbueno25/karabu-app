import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { formatDate, formatCurrency } from "../lib/format";
import { toast } from "sonner";
import { 
  ArrowLeft, User, Mail, Phone, MapPin, FileText, 
  CalendarCheck, CreditCard, History, Loader2, Save, Trash2 
} from "lucide-react";

const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info");
  
  // States for updating client info
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    document_id: "",
    address: "",
    notes: "",
    status: "activo"
  });
  const [saving, setSaving] = useState(false);
  
  // State for notes tab
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const loadClient = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/clients/${id}`);
      setData(res.data);
      setForm({
        first_name: res.data.client.first_name,
        last_name: res.data.client.last_name,
        email: res.data.client.email,
        phone: res.data.client.phone,
        document_id: res.data.client.document_id || "",
        address: res.data.client.address || "",
        notes: res.data.client.notes || "",
        status: res.data.client.status || "activo"
      });
      setNotesText(res.data.client.notes || "");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar detalle del cliente");
      navigate("/admin/clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClient();
    // eslint-disable-next-line
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/clients/${id}`, form);
      toast.success("Cliente actualizado correctamente");
      loadClient();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al actualizar cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const updatedForm = { ...form, notes: notesText };
      await api.put(`/clients/${id}`, updatedForm);
      toast.success("Notas del cliente guardadas");
      loadClient();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al guardar notas");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${form.first_name} ${form.last_name}?`)) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success("Cliente eliminado correctamente");
      navigate("/admin/clientes");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al eliminar cliente");
    }
  };

  // Chronological timeline calculations
  const timeline = useMemo(() => {
    if (!data) return [];
    const events = [];
    
    // Client Created
    if (data.client.created_at) {
      events.push({
        date: data.client.created_at,
        type: "creation",
        title: "Cliente Registrado",
        desc: `Registro inicial de ${data.client.first_name} ${data.client.last_name} en el sistema.`,
        color: "bg-blue-50 dark:bg-blue-900/300",
        icon: User
      });
    }

    // Quotations
    (data.quotations || []).forEach(q => {
      events.push({
        date: q.created_at,
        type: "quotation",
        title: `Cotización Creada`,
        desc: `Cotización de viaje a ${q.destination} por ${formatCurrency(q.amount, q.currency)} (${q.status}).`,
        color: q.status === "aceptada" ? "bg-green-500" : q.status === "rechazada" ? "bg-red-500" : "bg-yellow-50 dark:bg-yellow-900/300",
        icon: FileText
      });
    });

    // Reservations
    (data.reservations || []).forEach(r => {
      events.push({
        date: r.created_at,
        type: "reservation",
        title: `Reserva Creada`,
        desc: `Reserva confirmada de viaje a ${r.destination} por un total de ${formatCurrency(r.total_amount, r.currency)} (${r.status}).`,
        color: r.status === "pagada" ? "bg-green-500" : r.status === "cancelada" ? "bg-gray-50 dark:bg-gray-8000" : "bg-blue-50 dark:bg-blue-900/300",
        icon: CalendarCheck
      });
    });

    // Payments
    (data.payments || []).forEach(p => {
      events.push({
        date: p.payment_date || p.created_at,
        type: "payment",
        title: `Pago Registrado`,
        desc: `Pago de ${formatCurrency(p.amount, p.currency)} recibido vía ${p.method} (${p.status}).`,
        color: p.status === "completado" ? "bg-green-500" : "bg-red-500",
        icon: CreditCard
      });
    });

    // Sort descending by date
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando detalle del cliente…
      </div>
    );
  }

  const { client, reservations = [], quotations = [], payments = [] } = data;

  return (
    <div data-testid="client-detail-page" className="space-y-6">
      <div className="flex items-center gap-3">
        <Link 
          to="/admin/clientes" 
          className="h-9 w-9 border border-gray-200 dark:border-gray-700 rounded-[10px] bg-white dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          data-testid="client-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              {client.first_name} {client.last_name}
            </h1>
            <StatusBadge value={client.status} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {client.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Profile Summary Card */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[16px] border border-gray-200 dark:border-gray-700 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),_0_1px_2px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100 dark:border-gray-800">
              <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-3">
                {client.first_name[0]}{client.last_name[0]}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{client.first_name} {client.last_name}</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Cliente desde: {formatDate(client.created_at)}</span>
            </div>

            <div className="py-4 space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-400 dark:text-gray-500 block font-medium">Correo Electrónico</span>
                  <a href={`mailto:${client.email}`} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 break-all font-medium">{client.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 block font-medium">Teléfono</span>
                  <a href={`tel:${client.phone}`} className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">{client.phone}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 block font-medium">Documento de Identidad</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{client.document_id || "No registrado"}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 block font-medium">Dirección</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{client.address || "No registrada"}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around text-center">
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 block">{reservations.length}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Reservas</span>
              </div>
              <div className="border-r border-gray-200 dark:border-gray-700 h-8"></div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 block">{quotations.length}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Cotizaciones</span>
              </div>
              <div className="border-r border-gray-200 dark:border-gray-700 h-8"></div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 block">
                  {formatCurrency(payments.reduce((sum, p) => sum + (p.status === "completado" ? p.amount : 0), 0))}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Invertido</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Details Tabs Card */}
        <main className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[16px] border border-gray-200 dark:border-gray-700 shadow-[0_1px_3px_0_rgba(0,0,0,0.05),_0_1px_2px_-1px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Tabs Header */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6 py-2 flex items-center gap-1 overflow-x-auto">
              {[
                { id: "info", label: "Perfil", icon: User },
                { id: "reservas", label: "Reservas", icon: CalendarCheck },
                { id: "cotizaciones", label: "Cotizaciones", icon: FileText },
                { id: "pagos", label: "Pagos", icon: CreditCard },
                { id: "notas", label: "Notas", icon: FileText },
                { id: "historial", label: "Historial", icon: History }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={`client-tab-${t.id}`}
                  className={[
                    "flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-xs font-semibold uppercase tracking-wider transition-colors",
                    tab === t.id 
                      ? "bg-white dark:bg-gray-900 text-blue-600 shadow-sm border border-gray-200 dark:border-gray-700" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/55"
                  ].join(" ")}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-6">
              {/* Profile/Info Tab */}
              {tab === "info" && (
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nombre" required>
                      <input 
                        data-testid="client-first-name"
                        required 
                        value={form.first_name} 
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })} 
                        className={inputCls} 
                      />
                    </Field>
                    <Field label="Apellidos" required>
                      <input 
                        data-testid="client-last-name"
                        required 
                        value={form.last_name} 
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })} 
                        className={inputCls} 
                      />
                    </Field>
                  </div>

                  <Field label="Correo Electrónico" required>
                    <input 
                      data-testid="client-email"
                      type="email" 
                      required 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      className={inputCls} 
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Teléfono" required>
                      <input 
                        data-testid="client-phone"
                        required 
                        value={form.phone} 
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                        className={inputCls} 
                      />
                    </Field>
                    <Field label="Documento de Identidad">
                      <input 
                        value={form.document_id} 
                        onChange={(e) => setForm({ ...form, document_id: e.target.value })} 
                        className={inputCls} 
                      />
                    </Field>
                  </div>

                  <Field label="Dirección">
                    <input 
                      value={form.address} 
                      onChange={(e) => setForm({ ...form, address: e.target.value })} 
                      className={inputCls} 
                    />
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

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleDelete}
                      data-testid="client-delete-btn"
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar Cliente
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      data-testid="client-save-btn"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}

              {/* Reservations Tab */}
              {tab === "reservas" && (
                <div className="space-y-4">
                  {reservations.length === 0 ? (
                    <EmptyState 
                      title="Sin reservas" 
                      description="Este cliente no tiene viajes confirmados registrados." 
                      icon={CalendarCheck} 
                    />
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-[10px]">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destino</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha Salida</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto Total</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ver</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations.map(r => (
                            <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{r.destination}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(r.departure_date)}</td>
                              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatCurrency(r.total_amount, r.currency)}</td>
                              <td className="px-4 py-3"><StatusBadge value={r.status} /></td>
                              <td className="px-4 py-3 text-right">
                                <Link 
                                  to={`/admin/reservas/${r.id}`}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline"
                                >
                                  Detalle
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Quotations Tab */}
              {tab === "cotizaciones" && (
                <div className="space-y-4">
                  {quotations.length === 0 ? (
                    <EmptyState 
                      title="Sin cotizaciones" 
                      description="Este cliente no tiene cotizaciones en el sistema." 
                      icon={FileText} 
                    />
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-[10px]">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destino</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha Viaje</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Viajeros</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotations.map(q => (
                            <tr key={q.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{q.destination}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{q.travel_date ? formatDate(q.travel_date) : "Sin definir"}</td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{q.travelers}</td>
                              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{formatCurrency(q.amount, q.currency)}</td>
                              <td className="px-4 py-3"><StatusBadge value={q.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {tab === "pagos" && (
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <EmptyState 
                      title="Sin pagos registrados" 
                      description="No se han registrado pagos por parte de este cliente." 
                      icon={CreditCard} 
                    />
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-[10px]">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Método</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Referencia</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map(p => (
                            <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(p.payment_date || p.created_at)}</td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">{p.method}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{p.reference || "—"}</td>
                              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-semibold">{formatCurrency(p.amount, p.currency)}</td>
                              <td className="px-4 py-3"><StatusBadge value={p.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {tab === "notas" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">Notas sobre el Cliente</h4>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Las notas son solo visibles para asesores y administradores.</p>
                  </div>
                  <textarea
                    rows={8}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Escribe observaciones, preferencias de viaje del cliente, historial de contacto, etc..."
                    className="w-full rounded-[10px] border border-gray-300 dark:border-gray-600 px-3.5 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      data-testid="client-notes-save-btn"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
                    >
                      {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Guardar Notas
                    </button>
                  </div>
                </div>
              )}

              {/* History Timeline Tab */}
              {tab === "historial" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">Línea de Tiempo de Interacciones</h4>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Total de eventos: {timeline.length}</span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-150">
                    {timeline.map((event, idx) => {
                      const Icon = event.icon;
                      return (
                        <div key={idx} className="relative flex items-start gap-4">
                          {/* Dot Icon */}
                          <div className={`absolute -left-6 mt-1.5 h-6.5 w-6.5 rounded-full ${event.color} text-white flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-gray-100 z-10`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          {/* Event details */}
                          <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-[12px] p-4 transition-colors">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                              <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{event.title}</h5>
                              <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(event.date)}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">{event.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
