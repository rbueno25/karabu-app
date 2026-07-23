import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { formatDate, formatCurrency } from "../lib/format";
import { toast } from "sonner";
import { 
  ArrowLeft, Calendar, User, DollarSign, Plus, Pencil, 
  Trash2, FileText, CreditCard, Loader2, Save, X, ExternalLink, Info,
  Mail, Phone
} from "lucide-react";

const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#132D52] text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow";

export default function ReservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info"); // info, pasajeros, documentos, pagos

  // Form state for reservation details
  const [form, setForm] = useState({
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
    passengers: [],
    documents: []
  });
  const [savingDetails, setSavingDetails] = useState(false);

  // Modal states
  const [passengerModalOpen, setPassengerModalOpen] = useState(false);
  const [editingPassengerIdx, setEditingPassengerIdx] = useState(null);
  const [passengerForm, setPassengerForm] = useState({ name: "", document_id: "", birth_date: "" });
  const [savingPassenger, setSavingPassenger] = useState(false);

  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [documentForm, setDocumentForm] = useState({ name: "", url: "" });
  const [savingDocument, setSavingDocument] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "efectivo", reference: "", payment_date: "" });
  const [savingPayment, setSavingPayment] = useState(false);

  const loadReservation = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reservations/${id}`);
      setData(res.data);
      setForm({
        client_id: res.data.reservation.client_id,
        destination: res.data.reservation.destination,
        departure_date: (res.data.reservation.departure_date || "").slice(0, 10),
        return_date: (res.data.reservation.return_date || "").slice(0, 10),
        travelers: res.data.reservation.travelers || 1,
        services: res.data.reservation.services || "",
        notes: res.data.reservation.notes || "",
        total_amount: res.data.reservation.total_amount || 0,
        currency: res.data.reservation.currency || "USD",
        status: res.data.reservation.status || "pendiente",
        passengers: res.data.reservation.passengers || [],
        documents: res.data.reservation.documents || []
      });
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar detalle de reserva");
      navigate("/admin/reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservation();
    // eslint-disable-next-line
  }, [id]);

  if (loading || !data) {
    return (
      <div className="p-10 text-center text-gray-500 dark:text-gray-300 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando detalle de reserva…
      </div>
    );
  }

  const { reservation, client, payments = [] } = data;

  const handleUpdateReservation = async (updatedFields) => {
    try {
      const body = {
        client_id: form.client_id,
        quotation_id: reservation.quotation_id,
        destination: form.destination,
        departure_date: form.departure_date,
        return_date: form.return_date,
        travelers: Number(form.travelers || 1),
        services: form.services || "",
        notes: form.notes || "",
        total_amount: Number(form.total_amount || 0),
        currency: form.currency || "USD",
        status: form.status || "pendiente",
        passengers: form.passengers || [],
        documents: form.documents || [],
        ...updatedFields
      };
      
      await api.put(`/reservations/${id}`, body);
      loadReservation();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al actualizar reserva");
      throw e;
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      await handleUpdateReservation({});
      toast.success("Reserva actualizada correctamente");
    } catch (e) {
      // Handled in handleUpdateReservation
    } finally {
      setSavingDetails(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!window.confirm("¿Estás seguro de eliminar esta reserva permanentemente?")) return;
    try {
      await api.delete(`/reservations/${id}`);
      toast.success("Reserva eliminada correctamente");
      navigate("/admin/reservas");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al eliminar reserva");
    }
  };

  // Passenger CRUD Functions
  const openPassengerModal = (idx = null) => {
    if (idx !== null) {
      setEditingPassengerIdx(idx);
      setPassengerForm(form.passengers[idx]);
    } else {
      setEditingPassengerIdx(null);
      setPassengerForm({ name: "", document_id: "", birth_date: "" });
    }
    setPassengerModalOpen(true);
  };

  const savePassenger = async (e) => {
    e.preventDefault();
    setSavingPassenger(true);
    try {
      const updatedPassengers = [...(form.passengers || [])];
      if (editingPassengerIdx !== null) {
        updatedPassengers[editingPassengerIdx] = passengerForm;
      } else {
        updatedPassengers.push(passengerForm);
      }
      await handleUpdateReservation({ passengers: updatedPassengers });
      toast.success(editingPassengerIdx !== null ? "Pasajero actualizado" : "Pasajero agregado");
      setPassengerModalOpen(false);
    } catch (e) {
    } finally {
      setSavingPassenger(false);
    }
  };

  const deletePassenger = async (idx) => {
    if (!window.confirm("¿Quitar este pasajero de la reserva?")) return;
    try {
      const updatedPassengers = (form.passengers || []).filter((_, i) => i !== idx);
      await handleUpdateReservation({ passengers: updatedPassengers });
      toast.success("Pasajero quitado");
    } catch (e) {}
  };

  // Document CRUD Functions
  const openDocumentModal = () => {
    setDocumentForm({ name: "", url: "" });
    setDocumentModalOpen(true);
  };

  const saveDocument = async (e) => {
    e.preventDefault();
    setSavingDocument(true);
    try {
      const newDoc = {
        ...documentForm,
        uploaded_at: new Date().toISOString()
      };
      const updatedDocs = [...(form.documents || []), newDoc];
      await handleUpdateReservation({ documents: updatedDocs });
      toast.success("Documento registrado");
      setDocumentModalOpen(false);
    } catch (e) {}
    finally {
      setSavingDocument(false);
    }
  };

  const deleteDocument = async (idx) => {
    if (!window.confirm("¿Eliminar este documento de la reserva?")) return;
    try {
      const updatedDocs = (form.documents || []).filter((_, i) => i !== idx);
      await handleUpdateReservation({ documents: updatedDocs });
      toast.success("Documento eliminado");
    } catch (e) {}
  };

  // Payment Quick Registration
  const openPaymentModal = () => {
    setPaymentForm({
      amount: String(Math.max(0, form.total_amount - (reservation.paid_amount || 0))),
      method: "efectivo",
      reference: "",
      payment_date: new Date().toISOString().slice(0, 10)
    });
    setPaymentModalOpen(true);
  };

  const savePayment = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      const body = {
        reservation_id: id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference,
        payment_date: paymentForm.payment_date,
        status: "completado"
      };
      await api.post("/payments", body);
      toast.success("Pago registrado correctamente");
      setPaymentModalOpen(false);
      loadReservation();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al registrar el pago");
    } finally {
      setSavingPayment(false);
    }
  };

  const calculatedPaidAmount = (payments || [])
    .filter(p => p.status === "completado")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const calculatedPendingAmount = Math.max(0, form.total_amount - calculatedPaidAmount);

  return (
    <div data-testid="reservation-detail-page" className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link 
          to="/admin/reservas" 
          className="h-9 w-9 border border-gray-200 dark:border-[#1A3356] rounded-[10px] bg-white dark:bg-[#0F2444] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          data-testid="reservation-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Reserva a {reservation.destination}
            </h1>
            <StatusBadge value={reservation.status} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-300">ID Reserva: {reservation.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openPaymentModal}
            data-testid="payment-add-btn"
            disabled={form.status === "cancelada"}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors shadow-sm disabled:opacity-30 disabled:hover:bg-blue-600"
          >
            <CreditCard className="h-4 w-4" /> Registrar Pago
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Quick summary and Accounts */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          {/* Client summary */}
          <div className="bg-white dark:bg-[#0F2444] rounded-[16px] border border-gray-200 dark:border-[#1A3356] p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 block mb-3">Cliente de la Reserva</span>
            {client ? (
              <div className="space-y-2">
                <Link 
                  to={`/admin/clientes/${client.id}`}
                  className="text-base font-bold text-blue-600 hover:text-blue-800 hover:underline block"
                >
                  {client.first_name} {client.last_name}
                </Link>
                <div className="text-xs text-gray-500 dark:text-gray-300 space-y-1">
                  <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {client.email}</p>
                  <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {client.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-300 font-semibold">—</p>
            )}
          </div>

          {/* Pricing & Payments summary */}
          <div className="bg-white dark:bg-[#0F2444] rounded-[16px] border border-gray-200 dark:border-[#1A3356] p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#1A3356] pb-3 mb-4">Estado Financiero</h3>
            <div className="space-y-3.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-300 font-medium">Monto Total:</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(form.total_amount, form.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-300 font-medium">Monto Pagado:</span>
                <span className="font-bold text-green-600">{formatCurrency(calculatedPaidAmount, form.currency)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-[#1A3356]">
                <span className="text-gray-500 dark:text-gray-300 font-semibold">Pendiente:</span>
                <span className={`font-extrabold ${calculatedPendingAmount > 0 ? "text-yellow-600" : "text-gray-500 dark:text-gray-300"}`}>
                  {formatCurrency(calculatedPendingAmount, form.currency)}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Tabbed Panels */}
        <main className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#0F2444] rounded-[16px] border border-gray-200 dark:border-[#1A3356] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Tabs Header */}
            <div className="bg-gray-50 dark:bg-[#132D52]/50 border-b border-gray-200 dark:border-[#1A3356] px-6 py-2 flex items-center gap-1 overflow-x-auto">
              {[
                { id: "info", label: "Detalles", icon: Info },
                { id: "pasajeros", label: "Pasajeros", icon: User },
                { id: "documentos", label: "Documentos", icon: FileText },
                { id: "pagos", label: "Pagos", icon: CreditCard }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  data-testid={`reservation-tab-${t.id}`}
                  className={[
                    "flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-xs font-semibold uppercase tracking-wider transition-colors",
                    tab === t.id 
                      ? "bg-white dark:bg-[#0F2444] text-blue-600 shadow-sm border border-gray-200 dark:border-[#1A3356]" 
                      : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/55"
                  ].join(" ")}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-6">
              {/* DETAILS FORM TAB */}
              {tab === "info" && (
                <form onSubmit={handleSaveDetails} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Destino" required>
                      <input 
                        data-testid="reservation-destination"
                        required 
                        value={form.destination} 
                        onChange={(e) => setForm({ ...form, destination: e.target.value })} 
                        className={inputCls} 
                      />
                    </Field>
                    <Field label="Viajeros (N° Personas)" required>
                      <input 
                        data-testid="reservation-travelers"
                        type="number"
                        min={1}
                        required 
                        value={form.travelers} 
                        onChange={(e) => setForm({ ...form, travelers: Number(e.target.value) })} 
                        className={inputCls} 
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Fecha de Salida" required>
                      <input 
                        type="date"
                        required 
                        value={form.departure_date} 
                        onChange={(e) => setForm({ ...form, departure_date: e.target.value })} 
                        className={inputCls} 
                      />
                    </Field>
                    <Field label="Fecha de Regreso" required>
                      <input 
                        type="date"
                        required 
                        value={form.return_date} 
                        onChange={(e) => setForm({ ...form, return_date: e.target.value })} 
                        className={inputCls} 
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Field label="Monto Total Cotizado" required>
                        <input 
                          data-testid="reservation-amount"
                          type="number"
                          step="0.01"
                          required 
                          value={form.total_amount} 
                          onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })} 
                          className={inputCls} 
                        />
                      </Field>
                    </div>
                    <div>
                      <Field label="Moneda" required>
                        <select 
                          value={form.currency} 
                          onChange={(e) => setForm({ ...form, currency: e.target.value })} 
                          className={inputCls}
                        >
                          <option>USD</option>
                          <option>COP</option>
                          <option>EUR</option>
                          <option>MXN</option>
                        </select>
                      </Field>
                    </div>
                  </div>

                  <Field label="Servicios Incluidos">
                    <input 
                      value={form.services} 
                      onChange={(e) => setForm({ ...form, services: e.target.value })} 
                      placeholder="Vuelos + Hotel + Traslados..."
                      className={inputCls} 
                    />
                  </Field>

                  <Field label="Estado de la Reserva">
                    <select 
                      value={form.status} 
                      onChange={(e) => setForm({ ...form, status: e.target.value })} 
                      className={inputCls}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="pagada">Pagada</option>
                      <option value="en_viaje">En viaje</option>
                      <option value="finalizada">Finalizada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </Field>

                  <Field label="Observaciones / Comentarios">
                    <textarea 
                      rows={4}
                      value={form.notes} 
                      onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                      placeholder="Escribe detalles específicos, códigos de reserva o solicitudes del cliente..."
                      className={inputCls} 
                    />
                  </Field>

                  <div className="pt-4 border-t border-gray-100 dark:border-[#1A3356] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleDeleteReservation}
                      className="inline-flex items-center gap-2 text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar Reserva
                    </button>

                    <button
                      type="submit"
                      disabled={savingDetails}
                      data-testid="reservation-save-btn"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
                    >
                      {savingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}

              {/* PASSENGERS TAB */}
              {tab === "pasajeros" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-sm font-semibold text-gray-850">Acompañantes en el Viaje</h4>
                    <button 
                      onClick={() => openPassengerModal()}
                      data-testid="passenger-add-btn"
                      className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Agregar Pasajero
                    </button>
                  </div>

                  {(!form.passengers || form.passengers.length === 0) ? (
                    <EmptyState 
                      title="Sin pasajeros" 
                      description="No hay acompañantes registrados para este viaje." 
                      icon={User} 
                    />
                  ) : (
                    <div className="overflow-x-auto border border-gray-150 rounded-[10px]">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-[#132D52] border-b border-gray-150">
                          <tr>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre Completo</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Documento</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">F. Nacimiento</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.passengers.map((p, idx) => (
                            <tr key={idx} className="border-b border-gray-100 dark:border-[#1A3356] last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{p.name}</td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-xs">{p.document_id || "—"}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.birth_date ? formatDate(p.birth_date) : "—"}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button 
                                    onClick={() => openPassengerModal(idx)}
                                    data-testid={`passenger-edit-${idx}`}
                                    className="h-7 w-7 rounded-[6px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
                                    aria-label="Editar"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => deletePassenger(idx)}
                                    data-testid={`passenger-delete-${idx}`}
                                    className="h-7 w-7 rounded-[6px] hover:bg-red-50 flex items-center justify-center text-red-655"
                                    aria-label="Quitar"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {tab === "documentos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-sm font-semibold text-gray-850">Documentos de Viaje Adjuntos</h4>
                    <button 
                      onClick={openDocumentModal}
                      data-testid="document-add-btn"
                      className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Agregar Documento
                    </button>
                  </div>

                  {(!form.documents || form.documents.length === 0) ? (
                    <EmptyState 
                      title="Sin documentos" 
                      description="No se han registrado pasaportes o tiquetes para esta reserva." 
                      icon={FileText} 
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {form.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border border-gray-150 rounded-[10px] bg-gray-50 dark:bg-[#132D52]/30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-[8px] text-blue-600 shrink-0">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 block truncate">{doc.name}</span>
                              <span className="text-[10px] text-gray-450 block">Registrado: {formatDate(doc.uploaded_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="h-7 w-7 rounded-[6px] hover:bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"
                              aria-label="Abrir documento"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <button 
                              onClick={() => deleteDocument(idx)}
                              data-testid={`document-delete-${idx}`}
                              className="h-7 w-7 rounded-[6px] hover:bg-red-50 flex items-center justify-center text-red-650"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENTS TAB */}
              {tab === "pagos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-sm font-semibold text-gray-850">Historial de Pagos de la Reserva</h4>
                    <button 
                      onClick={openPaymentModal}
                      disabled={form.status === "cancelada"}
                      className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-blue-50 dark:bg-blue-900/30"
                    >
                      <Plus className="h-3.5 w-3.5" /> Registrar Pago
                    </button>
                  </div>

                  {payments.length === 0 ? (
                    <EmptyState 
                      title="Sin pagos" 
                      description="Esta reserva no registra abonos aún." 
                      icon={CreditCard} 
                    />
                  ) : (
                    <div className="overflow-x-auto border border-gray-150 rounded-[10px]">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-[#132D52] border-b border-gray-150">
                          <tr>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Método</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Referencia</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                            <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map(p => (
                            <tr key={p.id} className="border-b border-gray-100 dark:border-[#1A3356] last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(p.payment_date || p.created_at)}</td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize font-medium">{p.method}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{p.reference || "—"}</td>
                              <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-bold">{formatCurrency(p.amount, p.currency)}</td>
                              <td className="px-4 py-3"><StatusBadge value={p.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Passenger Modal */}
      {passengerModalOpen && (
        <div data-testid="passenger-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={savePassenger} className="mt-16 bg-white dark:bg-[#0F2444] rounded-[16px] shadow-xl border border-gray-200 dark:border-[#1A3356] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {editingPassengerIdx !== null ? "Editar Pasajero" : "Agregar Pasajero"}
              </h3>
              <button type="button" onClick={() => setPassengerModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="space-y-4">
              <Field label="Nombre Completo" required>
                <input 
                  data-testid="passenger-name"
                  required 
                  value={passengerForm.name} 
                  onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })} 
                  className={inputCls} 
                />
              </Field>
              <Field label="Documento de Identidad">
                <input 
                  data-testid="passenger-doc"
                  value={passengerForm.document_id} 
                  onChange={(e) => setPassengerForm({ ...passengerForm, document_id: e.target.value })} 
                  className={inputCls} 
                />
              </Field>
              <Field label="Fecha de Nacimiento">
                <input 
                  data-testid="passenger-birth"
                  type="date"
                  value={passengerForm.birth_date} 
                  onChange={(e) => setPassengerForm({ ...passengerForm, birth_date: e.target.value })} 
                  className={inputCls} 
                />
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setPassengerModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3356] rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">Cancelar</button>
              <button type="submit" disabled={savingPassenger} data-testid="passenger-save-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold disabled:opacity-60">
                {savingPassenger ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Modal */}
      {documentModalOpen && (
        <div data-testid="document-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={saveDocument} className="mt-16 bg-white dark:bg-[#0F2444] rounded-[16px] shadow-xl border border-gray-200 dark:border-[#1A3356] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Agregar Documento</h3>
              <button type="button" onClick={() => setDocumentModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="space-y-4">
              <Field label="Nombre del Documento" required>
                <input 
                  data-testid="document-name"
                  required 
                  placeholder="ej. Boleto de Avión - Juan Pérez"
                  value={documentForm.name} 
                  onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })} 
                  className={inputCls} 
                />
              </Field>
              <Field label="Enlace / URL de descarga" required>
                <input 
                  data-testid="document-url"
                  type="url"
                  required 
                  placeholder="ej. https://drive.google.com/..."
                  value={documentForm.url} 
                  onChange={(e) => setDocumentForm({ ...documentForm, url: e.target.value })} 
                  className={inputCls} 
                />
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDocumentModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3356] rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">Cancelar</button>
              <button type="submit" disabled={savingDocument} data-testid="document-save-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold disabled:opacity-60">
                {savingDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div data-testid="payment-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={savePayment} className="mt-16 bg-white dark:bg-[#0F2444] rounded-[16px] shadow-xl border border-gray-200 dark:border-[#1A3356] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Registrar Pago</h3>
              <button type="button" onClick={() => setPaymentModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="space-y-4">
              <Field label={`Monto a Pagar (${form.currency})`} required>
                <input 
                  data-testid="payment-amount"
                  type="number"
                  step="0.01"
                  required 
                  value={paymentForm.amount} 
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} 
                  className={inputCls} 
                />
              </Field>
              <Field label="Método de Pago" required>
                <select 
                  data-testid="payment-method"
                  value={paymentForm.method} 
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} 
                  className={inputCls}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
              </Field>
              <Field label="Referencia de Transacción">
                <input 
                  data-testid="payment-ref"
                  placeholder="ej. Trans. 984534"
                  value={paymentForm.reference} 
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} 
                  className={inputCls} 
                />
              </Field>
              <Field label="Fecha del Pago" required>
                <input 
                  data-testid="payment-date"
                  type="date"
                  required 
                  value={paymentForm.payment_date} 
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} 
                  className={inputCls} 
                />
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setPaymentModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3356] rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">Cancelar</button>
              <button type="submit" disabled={savingPayment} data-testid="payment-save-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold disabled:opacity-60">
                {savingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Registrar
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
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
