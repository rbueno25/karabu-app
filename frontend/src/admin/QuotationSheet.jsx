import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import { formatDate, formatCurrency } from "../lib/format";
import { toast } from "sonner";
import { 
  ArrowLeft, FileText, User, Mail, Phone, Calendar, 
  MapPin, DollarSign, Send, Save, Loader2, X, Clipboard, ExternalLink
} from "lucide-react";

const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#132D52] text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow";

export default function QuotationSheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    destination: "",
    travel_date: "",
    return_date: "",
    travelers: 1,
    amount: 0,
    currency: "USD",
    notes: "",
    assigned_hotel: "",
    booking_price: "",
    expedia_price: "",
    status: "borrador",
    sent_via: "",
    sent_at: ""
  });

  // Modal state
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [sendingPlatform, setSendingPlatform] = useState("");

  const loadQuotation = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quotations/${id}`);
      setData(res.data);
      setForm({
        client_id: res.data.quotation.client_id,
        destination: res.data.quotation.destination || (res.data.quotation.form_data?.country ? `${res.data.quotation.form_data.country}${res.data.quotation.form_data.city ? ', ' + res.data.quotation.form_data.city : ''}` : ""),
        travel_date: (res.data.quotation.travel_date || res.data.quotation.form_data?.departureDate || "").slice(0, 10),
        return_date: (res.data.quotation.return_date || res.data.quotation.form_data?.returnDate || "").slice(0, 10),
        travelers: res.data.quotation.travelers || (res.data.quotation.form_data?.adultsCount || 0) + (res.data.quotation.form_data?.childrenCount || 0) + (res.data.quotation.form_data?.babiesCount || 0) || 1,
        amount: res.data.quotation.amount || 0,
        currency: res.data.quotation.currency || "USD",
        notes: res.data.quotation.notes || (res.data.quotation.form_data?.comments || ""),
        assigned_hotel: res.data.quotation.assigned_hotel || res.data.quotation.form_data?.preferredHotel || "",
        booking_price: res.data.quotation.booking_price || "",
        expedia_price: res.data.quotation.expedia_price || "",
        status: res.data.quotation.status || "borrador",
        sent_via: res.data.quotation.sent_via || res.data.quotation.form_data?.preferredContact || "",
        sent_at: res.data.quotation.sent_at || ""
      });
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar cotización");
      navigate("/admin/cotizaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotation();
    // eslint-disable-next-line
  }, [id]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        travelers: Number(form.travelers),
        amount: Number(form.amount),
        booking_price: form.booking_price ? Number(form.booking_price) : null,
        expedia_price: form.expedia_price ? Number(form.expedia_price) : null,
      };
      await api.put(`/quotations/${id}`, body);
      toast.success("Cotización guardada correctamente");
      loadQuotation();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al guardar cotización");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (platform) => {
    setSaving(true);
    setSendingPlatform(platform);
    try {
      const isoNow = new Date().toISOString();
      const updatedForm = {
        ...form,
        travelers: Number(form.travelers),
        amount: Number(form.amount),
        booking_price: form.booking_price ? Number(form.booking_price) : null,
        expedia_price: form.expedia_price ? Number(form.expedia_price) : null,
        status: "enviada",
        sent_via: platform,
        sent_at: isoNow
      };
      await api.put(`/quotations/${id}`, updatedForm);
      toast.success(`Cotización marcada como enviada vía ${platform}`);
      setSendModalOpen(false);
      setSuccessModalOpen(true);
      loadQuotation();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al enviar cotización");
    } finally {
      setSaving(false);
    }
  };

  const copyClientLink = () => {
    const link = `${window.location.origin}/#/cotizacion/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace copiado al portapapeles");
  };

  if (loading || !data) {
    return (
      <div className="p-10 text-center text-gray-500 dark:text-gray-300 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando hoja de cotización…
      </div>
    );
  }

  const { quotation, client, broker } = data;
  const clientLink = `${window.location.origin}/#/cotizacion/${id}`;
  
  // Custom WhatsApp deep link
  const cleanPhone = (client.phone || "").replace(/[^\d+]/g, "");
  const whatsappMsg = `Hola ${client.first_name}, aquí tienes tu propuesta de viaje personalizada para ${form.destination}. Puedes ver todos los detalles y aceptarla aquí: ${clientLink}`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div data-testid="quotation-sheet-page" className="space-y-6 relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-turquoise/5 dark:bg-brand-turquoise/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-navy/3 dark:bg-brand-navy/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.04] bg-[radial-gradient(#0F2A4A_1px,transparent_1px)] dark:bg-[radial-gradient(#00A896_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>
      <div className="flex items-center gap-3">
        <Link 
          to="/admin/cotizaciones" 
          className="h-9 w-9 border border-gray-200 dark:border-[#1A3356] rounded-[10px] bg-white dark:bg-[#0F2444] flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          data-testid="quotation-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Hoja de Cotización
            </h1>
            <StatusBadge value={form.status} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-300">ID Cotización: {quotation.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSendModalOpen(true)}
            data-testid="quotation-send-btn"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors shadow-sm"
          >
            <Send className="h-4 w-4" /> Enviar al Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Quotation Sheet Document (Membretada) */}
        <form onSubmit={handleSave} className="col-span-12 lg:col-span-8 bg-white dark:bg-[#0F2444] rounded-[20px] shadow-[0_4px_24px_rgba(15,42,74,0.06),0_1px_4px_rgba(0,168,150,0.04)] border border-brand-turquoise/10 overflow-hidden relative">
          {/* Decorative top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-navy via-brand-turquoise to-brand-orange" />
          {/* Header del documento */}
          <div className="p-8 border-b border-brand-turquoise/10 dark:border-brand-turquoise/20 bg-gradient-to-br from-brand-navy/3 via-white to-brand-turquoise/5 dark:from-brand-navy/15 dark:via-brand-navy/10 dark:to-brand-turquoise/10 flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="text-xl font-bold text-brand-navy dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-turquoise" />
                <span>KARABU VIAJES & VISAS</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">Propuesta y Presupuesto de Servicios Turísticos</p>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-300">
              <p className="font-semibold text-gray-800 dark:text-gray-200">Fecha de Creación:</p>
              <p>{formatDate(quotation.created_at)}</p>
              {quotation.sent_at && (
                <div className="mt-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Fecha de Envío:</p>
                  <p>{formatDate(quotation.sent_at)} ({quotation.sent_via})</p>
                </div>
              )}
            </div>
          </div>

          {/* Body del documento */}
          <div className="p-8 space-y-6">
            {/* Client and Broker Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-gradient-to-r from-brand-navy/[0.02] to-brand-turquoise/[0.03] dark:from-brand-navy/15 dark:to-brand-turquoise/10 rounded-[14px] border border-brand-turquoise/10 dark:border-brand-turquoise/20">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 block mb-2">Para el Cliente</span>
                <div className="space-y-1 text-sm">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{client.first_name} {client.last_name}</h4>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400 dark:text-gray-400" /> {client.email}</p>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400 dark:text-gray-400" /> {client.phone}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 block mb-2">Asesor Asignado (Broker)</span>
                <div className="space-y-1 text-sm">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{broker.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400 dark:text-gray-400" /> {broker.email}</p>
                </div>
              </div>
            </div>

            {/* ── 1. Destino y Fechas + Hotel Asignado ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#1A3356] pb-2">Destino y Fechas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Destino del Viaje" required>
                  <input 
                    data-testid="quotation-destination"
                    required 
                    value={form.destination} 
                    onChange={(e) => setForm({ ...form, destination: e.target.value })} 
                    className={inputCls} 
                  />
                </Field>
                <Field label="Cantidad de Viajeros" required>
                  <input 
                    data-testid="quotation-travelers"
                    type="number"
                    min={1}
                    required 
                    value={form.travelers} 
                    onChange={(e) => setForm({ ...form, travelers: e.target.value })} 
                    className={inputCls} 
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Fecha de Salida (Aproximada)">
                  <input 
                    data-testid="quotation-travel-date"
                    type="date"
                    value={form.travel_date} 
                    onChange={(e) => setForm({ ...form, travel_date: e.target.value })} 
                    className={inputCls} 
                  />
                </Field>
                <Field label="Fecha de Regreso (Aproximada)">
                  <input 
                    data-testid="quotation-return-date"
                    type="date"
                    value={form.return_date} 
                    onChange={(e) => setForm({ ...form, return_date: e.target.value })} 
                    className={inputCls} 
                  />
                </Field>
              </div>
            </div>

            {/* Hotel Asignado — junto al destino */}
            <div className="space-y-4">
              <Field label="Hotel de Preferencia">
                <input 
                  data-testid="quotation-assigned-hotel"
                  value={form.assigned_hotel} 
                  onChange={(e) => setForm({ ...form, assigned_hotel: e.target.value })} 
                  placeholder="Asigna un hotel si el cliente no especificó uno..."
                  className={inputCls} 
                />
              </Field>
            </div>

            {/* ── 2. Precio Broker + Comparativa ── */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#1A3356] pb-2">Precio de la Propuesta</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Field label="Monto Cotizado" required>
                    <input 
                      data-testid="quotation-amount"
                      type="number"
                      step="0.01"
                      min={0}
                      required 
                      value={form.amount} 
                      onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                      className={inputCls} 
                    />
                  </Field>
                </div>
                <div>
                  <Field label="Moneda" required>
                    <select 
                      data-testid="quotation-currency"
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
            </div>

            {/* Comparativa de Precios — debajo del precio broker */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#1A3356] pb-2">
                Comparativa de Precios
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio en Booking.com">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input 
                      data-testid="quotation-booking-price"
                      type="number" step="0.01" min={0}
                      value={form.booking_price} 
                      onChange={(e) => setForm({ ...form, booking_price: e.target.value })} 
                      placeholder="0.00"
                      className={`${inputCls} pl-7`} 
                    />
                  </div>
                </Field>
                <Field label="Precio en Expedia">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input 
                      data-testid="quotation-expedia-price"
                      type="number" step="0.01" min={0}
                      value={form.expedia_price} 
                      onChange={(e) => setForm({ ...form, expedia_price: e.target.value })} 
                      placeholder="0.00"
                      className={`${inputCls} pl-7`} 
                    />
                  </div>
                </Field>
              </div>
              {/* Live comparison */}
              {form.booking_price || form.expedia_price ? (
                <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-brand-turquoise/5 to-brand-orange/5 border border-brand-turquoise/20">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-400 block mb-1">Karabu</span>
                      <span className="font-bold text-brand-turquoise">{formatCurrency(form.amount, form.currency)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-400 block mb-1">Booking</span>
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{form.booking_price ? formatCurrency(Number(form.booking_price), form.currency) : '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-400 block mb-1">Expedia</span>
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{form.expedia_price ? formatCurrency(Number(form.expedia_price), form.currency) : '—'}</span>
                    </div>
                  </div>
                  {form.booking_price && Number(form.booking_price) > 0 && (
                    <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-300">
                      {Number(form.amount) <= Number(form.booking_price) 
                        ? <>✅ Karabu es <strong className="text-brand-turquoise">más económico</strong> o igual que Booking</>
                        : <>Ahorras <strong className="text-brand-orange">{formatCurrency(Number(form.booking_price) - Number(form.amount), form.currency)}</strong> vs Booking</>
                      }
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {/* ── 3. Estado ── */}
            <div className="space-y-4 pt-2">
              <Field label="Estado de la Cotización">
                <select 
                  data-testid="quotation-status"
                  value={form.status} 
                  onChange={(e) => setForm({ ...form, status: e.target.value })} 
                  className={inputCls}
                >
                  <option value="borrador">Borrador (Edición)</option>
                  <option value="enviada">Enviada al Cliente</option>
                  <option value="aceptada">Aceptada por Cliente</option>
                  <option value="rechazada">Rechazada por Cliente</option>
                  <option value="expirada">Expirada</option>
                </select>
              </Field>
            </div>

            {/* ── 4. Notas / Especificaciones (último) ── */}
            <div className="space-y-4 pt-2">
              <Field label="Especificaciones / Notas de Itinerario">
                <textarea 
                  data-testid="quotation-notes"
                  rows={6}
                  value={form.notes} 
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                  placeholder="Detalla qué incluye la cotización: Hoteles propuestos, categoría de habitación, vuelos, traslados, etc..."
                  className={inputCls} 
                />
              </Field>
            </div>
          </div>

          {/* Footer del documento con botones */}
          <div className="p-6 border-t border-brand-turquoise/10 dark:border-brand-turquoise/20 bg-gradient-to-r from-brand-navy/[0.02] to-brand-turquoise/[0.03] dark:from-brand-navy/15 dark:to-brand-turquoise/10 flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={saving}
              data-testid="quotation-save-btn"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-5 py-2 text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Hoja de Cotización
            </button>
          </div>
        </form>

        {/* Sidebar Info Card */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Form Data Card — shown for leads from landing page */}
          {quotation.form_data && Object.keys(quotation.form_data).length > 0 && (
            <div className="bg-white dark:bg-[#0F2444] rounded-[16px] border border-green-200 dark:border-green-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 border-b border-green-100 dark:border-green-800 pb-3 mb-4 flex items-center gap-2">
                <User className="h-4 w-4" /> Datos del Formulario Web
              </h3>
              <div className="space-y-3 text-sm">
                {quotation.form_data.fullName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Nombre:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">{quotation.form_data.fullName}</span>
                  </div>
                )}
                {quotation.form_data.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Email:</span>
                    <span className="text-gray-700 dark:text-gray-300">{quotation.form_data.email}</span>
                  </div>
                )}
                {quotation.form_data.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Teléfono:</span>
                    <span className="text-gray-700 dark:text-gray-300">{quotation.form_data.phone}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 dark:border-[#1A3356] pt-2.5 mt-1"></div>
                {quotation.form_data.adultsCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Viajeros:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {quotation.form_data.adultsCount} adultos
                      {quotation.form_data.childrenCount > 0 && `, ${quotation.form_data.childrenCount} niños`}
                      {quotation.form_data.babiesCount > 0 && `, ${quotation.form_data.babiesCount} bebés`}
                    </span>
                  </div>
                )}
                {quotation.form_data.budgetRange && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Presupuesto:</span>
                    <span className="text-brand-navy dark:text-brand-turquoise font-semibold">{quotation.form_data.budgetRange}</span>
                  </div>
                )}
                {quotation.form_data.travelType && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Tipo de viaje:</span>
                    <span className="text-gray-700 dark:text-gray-300">{quotation.form_data.travelType}</span>
                  </div>
                )}
                {quotation.form_data.hotelCategory && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Hotel:</span>
                    <span className="text-gray-700 dark:text-gray-300">{quotation.form_data.hotelCategory}</span>
                  </div>
                )}
                {quotation.form_data.preferredHotel && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Pref. Hotel:</span>
                    <span className="text-gray-700 dark:text-gray-300">{quotation.form_data.preferredHotel}</span>
                  </div>
                )}
                {quotation.form_data.flexibleDates && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Fechas flexibles:</span>
                    <span className="text-gray-700 dark:text-gray-300">{quotation.form_data.flexibleDates}</span>
                  </div>
                )}
                {quotation.form_data.additionalServices?.length > 0 && (
                  <div>
                    <span className="text-gray-400 dark:text-gray-400 font-medium block mb-1.5">Servicios requeridos:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {quotation.form_data.additionalServices.map((s, i) => (
                        <span key={i} className="bg-brand-turquoise/10 text-brand-turquoise text-xs font-semibold px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {quotation.form_data.preferredContact && (
                  <div className="border-t border-gray-100 dark:border-[#1A3356] pt-2.5 mt-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400 dark:text-gray-400 font-medium">Recibir por:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-semibold capitalize">
                        {quotation.form_data.preferredContact === 'ambos' ? 'Email y WhatsApp' : quotation.form_data.preferredContact}
                      </span>
                    </div>
                  </div>
                )}
                {quotation.form_data.comments && (
                  <div className="border-t border-gray-100 dark:border-[#1A3356] pt-2.5 mt-1">
                    <span className="text-gray-400 dark:text-gray-400 font-medium block mb-1">Comentarios:</span>
                    <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed italic">"{quotation.form_data.comments}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#0F2444] rounded-[20px] shadow-[0_2px_12px_rgba(15,42,74,0.04)] border border-brand-turquoise/8 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-[#1A3356] pb-3 mb-4">Información del Sistema</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-400 font-medium">Estado actual:</span>
                <span className="capitalize"><StatusBadge value={quotation.status} /></span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-400 font-medium">Última actualización:</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(quotation.updated_at)}</span>
              </div>
              {quotation.sent_via && (
                <div className="pt-2.5 border-t border-gray-100 dark:border-[#1A3356] space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 block">Información de Envío</span>
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Enviado vía:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold capitalize">{quotation.sent_via}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 dark:text-gray-400 font-medium">Fecha:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(quotation.sent_at)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Public link preview if sent/accepted/etc */}
            {["enviada", "aceptada", "rechazada"].includes(form.status) && (
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#1A3356] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 block">Enlace de Propuesta</span>
                <p className="text-xs text-gray-500 dark:text-gray-300 leading-normal">Esta cotización tiene una propuesta web interactiva activa para el cliente:</p>
                <div className="flex items-center gap-1">
                  <input readOnly value={clientLink} className="flex-1 bg-gray-50 dark:bg-[#132D52] border border-gray-200 dark:border-[#1A3356] rounded-[8px] px-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 font-mono focus:outline-none" />
                  <button onClick={copyClientLink} className="h-8 w-8 bg-gray-100 dark:bg-[#132D52] hover:bg-gray-200 rounded-[8px] flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0 transition-colors"><Clipboard className="h-4 w-4" /></button>
                </div>
                <a href={clientLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-300 text-xs font-semibold hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir propuesta del cliente
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Select platform modal */}
      {sendModalOpen && (
        <div data-testid="send-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mt-16 bg-white dark:bg-[#0F2444] rounded-[16px] shadow-xl border border-gray-200 dark:border-[#1A3356] w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Enviar Cotización</h3>
              <button type="button" onClick={() => setSendModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-5">Elige el canal por el cual deseas enviarle la propuesta interactiva al cliente.</p>

            <div className="space-y-3">
              <button
                onClick={() => handleSend("whatsapp")}
                data-testid="send-via-whatsapp"
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-[10px] py-2.5 text-sm font-semibold transition-colors"
              >
                <Send className="h-4 w-4" /> Enviar por WhatsApp
              </button>

              <button
                onClick={() => handleSend("email")}
                data-testid="send-via-email"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] py-2.5 text-sm font-semibold transition-colors"
              >
                <Mail className="h-4 w-4" /> Enviar por Correo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success / platform redirection modal */}
      {successModalOpen && (
        <div data-testid="success-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mt-16 bg-white dark:bg-[#0F2444] rounded-[16px] shadow-xl border border-gray-200 dark:border-[#1A3356] w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Propuesta Generada Correctamente</h3>
              <button type="button" onClick={() => setSuccessModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              La cotización ha sido guardada con el estado <strong>"Enviada"</strong>. Ya se puede compartir el enlace con el cliente.
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Enlace Público de la Propuesta</span>
              <div className="flex items-center gap-1.5">
                <input readOnly value={clientLink} className="flex-1 bg-gray-50 dark:bg-[#132D52] border border-gray-200 dark:border-[#1A3356] rounded-[8px] px-3 py-2 text-xs text-gray-600 dark:text-gray-300 font-mono focus:outline-none" />
                <button onClick={copyClientLink} className="h-9 w-9 bg-gray-100 dark:bg-[#132D52] hover:bg-gray-250 rounded-[8px] flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0 transition-colors"><Clipboard className="h-4 w-4" /></button>
              </div>
            </div>

            {sendingPlatform === "whatsapp" ? (
              <div className="pt-2">
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-[10px] py-2.5 text-sm font-semibold transition-colors"
                >
                  <ExternalLink className="h-4 w-4" /> Abrir WhatsApp Web
                </a>
                <p className="text-[10px] text-gray-400 dark:text-gray-400 text-center mt-1.5">Se abrirá WhatsApp Web con un mensaje y enlace pre-llenados para tu cliente.</p>
              </div>
            ) : (
              <div className="pt-2 bg-gray-50 dark:bg-[#132D52] p-4 rounded-[10px] border border-gray-150">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Correo Preparado</span>
                <p className="text-xs text-gray-500 dark:text-gray-300 leading-normal">
                  Puedes copiar el enlace de arriba y redactar el correo a <strong>{client.email}</strong>, o usar la plantilla de correo de cotización configurada.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setSuccessModalOpen(false)} 
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1A3356] rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
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
