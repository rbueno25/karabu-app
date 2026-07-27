import React, { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Plus, Loader2, Trash2, CreditCard, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../lib/format";

const emptyPay = {
  reservation_id: "",
  amount: 0,
  method: "transferencia",
  reference: "",
  payment_date: "",
  status: "completado",
  notes: "",
};

export default function Payments() {
  const [items, setItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyPay);

  const load = async () => {
    setLoading(true);
    try {
      const [ps, rs] = await Promise.all([api.get("/payments"), api.get("/reservations")]);
      setItems(ps.data);
      setReservations(rs.data);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ ...emptyPay, reservation_id: reservations[0]?.id || "" });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/payments", { ...form, amount: Number(form.amount) });
      toast.success("Pago registrado");
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "No fue posible registrar el pago");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm("¿Eliminar este pago?")) return;
    try {
      await api.delete(`/payments/${p.id}`);
      toast.success("Pago eliminado");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="payments-page">
      <PageHeader
        title="Pagos"
        description="Registra todos los pagos de las reservas."
        action={
          <button
            onClick={openCreate}
            data-testid="payments-new-btn"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Registrar pago
          </button>
        }
      />

      <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-gray-200 dark:border-zinc-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-300 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="Sin pagos" description="Registra el primer pago para una reserva." icon={CreditCard} />
        ) : (
          <table className="w-full text-sm" data-testid="payments-table">
            <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reserva</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Método</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">{p.client_name}</td>
                  <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{p.reservation_destination}</td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{formatDate(p.payment_date || p.created_at)}</td>
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-3 text-gray-700 dark:text-gray-300 capitalize">{p.method}</td>
                  <td className="px-6 py-3"><StatusBadge value={p.status} /></td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => remove(p)} className="h-8 w-8 rounded-[8px] hover:bg-red-50 flex items-center justify-center text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div data-testid="payment-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={save} className="mt-16 bg-white dark:bg-zinc-900 rounded-[16px] shadow-xl border border-gray-200 dark:border-zinc-800 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Registrar pago</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Reserva" required>
                <select data-testid="payment-reservation" required value={form.reservation_id} onChange={(e) => setForm({ ...form, reservation_id: e.target.value })} className={inputCls}>
                  <option value="">Selecciona una reserva…</option>
                  {reservations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.client_name} — {r.destination} ({formatCurrency(r.total_amount, r.currency)})
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Monto" required>
                  <input data-testid="payment-amount" type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Método" required>
                  <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className={inputCls}>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="otro">Otro</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Referencia">
                  <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Fecha del pago">
                  <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Estado">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  <option value="completado">Completado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="fallido">Fallido</option>
                  <option value="reembolsado">Reembolsado</option>
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
              <button type="submit" disabled={saving} data-testid="payment-save-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

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
