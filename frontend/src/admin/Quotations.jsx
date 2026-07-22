import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Plus, Loader2, Pencil, Trash2, FileText, ArrowRight, X } from "lucide-react";
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

export default function Quotations() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyQuote);

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
      load();
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
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nueva cotización
          </button>
        }
      />

      <div className="bg-white rounded-[16px] border border-gray-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-[10px] px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
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
          <div className="p-10 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Sin cotizaciones"
            description="Crea la primera cotización para un cliente."
            icon={FileText}
          />
        ) : (
          <table className="w-full text-sm" data-testid="quotations-table">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha viaje</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => (
                <tr key={q.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900 font-medium">{q.client_name}</td>
                  <td className="px-6 py-3">
                    <Link
                      to={`/admin/cotizaciones/${q.id}`}
                      data-testid={`quotation-link-${q.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                    >
                      {q.destination}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{formatDate(q.travel_date)}</td>
                  <td className="px-6 py-3 text-gray-900">{formatCurrency(q.amount, q.currency)}</td>
                  <td className="px-6 py-3"><StatusBadge value={q.status} /></td>
                  <td className="px-6 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {q.status === "aceptada" && (
                        <button
                          onClick={() => convert(q)}
                          data-testid={`quotation-convert-${q.id}`}
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-[8px] bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                        >
                          <ArrowRight className="h-3.5 w-3.5" /> Convertir
                        </button>
                      )}
                      <Link
                        to={`/admin/cotizaciones/${q.id}`}
                        data-testid={`quotation-edit-${q.id}`}
                        className="h-8 w-8 rounded-[8px] hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
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
        )}
      </div>

      {modalOpen && (
        <div data-testid="quotation-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={save} className="mt-16 bg-white rounded-[16px] shadow-xl border border-gray-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? "Editar cotización" : "Nueva cotización"}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500" />
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
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-[10px] hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={saving} data-testid="quotation-save-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-medium disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-[10px] border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

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
