import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Plus, Loader2, Pencil, Trash2, CalendarCheck, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../lib/format";

const emptyRes = {
  client_id: "",
  destination: "",
  departure_date: "",
  return_date: "",
  travelers: 1,
  services: "",
  notes: "",
  total_amount: 0,
  currency: "USD",
  status: "pendiente",
};

export default function Reservations() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyRes);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status_f = statusFilter;
      const [rs, cs] = await Promise.all([
        api.get("/reservations", { params }),
        api.get("/clients"),
      ]);
      setItems(rs.data);
      setClients(cs.data);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyRes, client_id: clients[0]?.id || "" });
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditingId(r.id);
    setForm({
      client_id: r.client_id,
      destination: r.destination,
      departure_date: (r.departure_date || "").slice(0, 10),
      return_date: (r.return_date || "").slice(0, 10),
      travelers: r.travelers || 1,
      services: r.services || "",
      notes: r.notes || "",
      total_amount: r.total_amount || 0,
      currency: r.currency || "USD",
      status: r.status || "pendiente",
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        travelers: Number(form.travelers),
        total_amount: Number(form.total_amount),
      };
      if (editingId) {
        await api.put(`/reservations/${editingId}`, body);
        toast.success("Reserva actualizada");
      } else {
        await api.post("/reservations", body);
        toast.success("Reserva creada");
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "No fue posible guardar la reserva");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm("¿Eliminar esta reserva?")) return;
    try {
      await api.delete(`/reservations/${r.id}`);
      toast.success("Reserva eliminada");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="reservations-page">
      <PageHeader
        title="Reservas"
        description="Administra todos los viajes confirmados."
        action={
          <button
            onClick={openCreate}
            data-testid="reservations-new-btn"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nueva reserva
          </button>
        }
      />

      <div className="bg-white dark:bg-gray-900 rounded-[16px] border border-gray-200 dark:border-gray-700 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-[10px] px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white dark:bg-gray-900"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="pagada">Pagada</option>
            <option value="en_viaje">En viaje</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Sin reservas"
            description="Crea una reserva o convierte una cotización aceptada."
            icon={CalendarCheck}
          />
        ) : (
          <table className="w-full text-sm" data-testid="reservations-table">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destino</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salida</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pagado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">{r.client_name}</td>
                  <td className="px-6 py-3">
                    <Link
                      to={`/admin/reservas/${r.id}`}
                      data-testid={`reservation-link-${r.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                    >
                      {r.destination}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{formatDate(r.departure_date)}</td>
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{formatCurrency(r.total_amount, r.currency)}</td>
                  <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{formatCurrency(r.paid_amount || 0, r.currency)}</td>
                  <td className="px-6 py-3"><StatusBadge value={r.status} /></td>
                  <td className="px-6 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/admin/reservas/${r.id}`}
                        data-testid={`reservation-edit-${r.id}`}
                        className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => remove(r)} className="h-8 w-8 rounded-[8px] hover:bg-red-50 flex items-center justify-center text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div data-testid="reservation-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={save} className="mt-16 bg-white dark:bg-gray-900 rounded-[16px] shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? "Editar reserva" : "Nueva reserva"}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Cliente" required>
                <select data-testid="reservation-client" required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={inputCls}>
                  <option value="">Selecciona un cliente…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Destino" required>
                <input data-testid="reservation-destination" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Salida" required>
                  <input type="date" required value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Regreso" required>
                  <input type="date" required value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Viajeros">
                  <input type="number" min={1} value={form.travelers} onChange={(e) => setForm({ ...form, travelers: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Monto total">
                  <input type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} className={inputCls} />
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
              <Field label="Servicios incluidos">
                <input value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} className={inputCls} placeholder="Vuelos + Hotel + Traslados" />
              </Field>
              <Field label="Estado">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  <option value="pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="pagada">Pagada</option>
                  <option value="en_viaje">En viaje</option>
                  <option value="finalizada">Finalizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </Field>
              <Field label="Observaciones">
                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancelar
              </button>
              <button type="submit" disabled={saving} data-testid="reservation-save-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

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
