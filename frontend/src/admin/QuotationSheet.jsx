import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import PageHeader from "./PageHeader";
import StatusBadge from "./StatusBadge";
import { formatDate, formatCurrency } from "../lib/format";
import { toast } from "sonner";
import { 
  ArrowLeft, FileText, User, Mail, Phone, Calendar, 
  MapPin, DollarSign, Send, Save, Loader2, X, Clipboard, ExternalLink,
  Plus, Trash2, AlertTriangle, CheckCircle, Sparkles, Layers, Eye
} from "lucide-react";

const inputCls = "w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow";

export default function QuotationSheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    destination: "", travel_date: "", return_date: "", travelers: 1,
    amount: 0, currency: "USD", notes: "", client_notes: "", assigned_hotel: "",
    room_type: "", services: [], booking_price: "", expedia_price: "",
    deposit_percent: 0, hero_image: "", tax_percent: 0,
    status: "borrador", sent_via: "", sent_at: ""
  });

  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sendingPlatform, setSendingPlatform] = useState("");

  const loadQuotation = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quotations/${id}`);
      setData(res.data);
      const q = res.data.quotation;
      setForm({
        client_id: q.client_id,
        destination: q.destination || (q.form_data?.country ? `${q.form_data.country}${q.form_data.city ? ', ' + q.form_data.city : ''}` : ""),
        travel_date: (q.travel_date || q.form_data?.departureDate || "").slice(0, 10),
        return_date: (q.return_date || q.form_data?.returnDate || "").slice(0, 10),
        travelers: q.travelers || (q.form_data?.adultsCount || 0) + (q.form_data?.childrenCount || 0) + (q.form_data?.babiesCount || 0) || 1,
        amount: q.amount || 0, currency: q.currency || "USD",
        notes: q.notes || (q.form_data?.comments || ""),
        client_notes: q.client_notes || "",
        assigned_hotel: q.assigned_hotel || q.form_data?.preferredHotel || "",
        room_type: q.room_type || q.form_data?.roomType || "",
        services: Array.isArray(q.services) ? q.services : [],
        deposit_percent: q.deposit_percent ?? 0,
        hero_image: q.hero_image || "",
        tax_percent: q.tax_percent ?? 0,
        booking_price: q.booking_price || "", expedia_price: q.expedia_price || "",
        status: q.status || "borrador",
        sent_via: q.sent_via || q.form_data?.preferredContact || "",
        sent_at: q.sent_at || ""
      });
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al cargar cotización");
      navigate("/admin/cotizaciones");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadQuotation(); }, [id]);

  const handleAddService = (nameOverride, priceOverride) => {
    const nameToUse = nameOverride !== undefined ? nameOverride : newServiceName;
    const priceToUse = priceOverride !== undefined ? priceOverride : newServicePrice;
    if (!nameToUse.trim()) { toast.error("Ingresa el nombre del servicio"); return; }
    const priceNum = parseFloat(priceToUse) || 0;
    // Validar que no exista otro servicio con el mismo precio
    const duplicate = (form.services || []).find(s => Number(s.price) === priceNum);
    if (duplicate && priceNum > 0) {
      toast.error(`Ya existe "${duplicate.name}" con el mismo precio (${formatCurrency(priceNum, form.currency)}). Cada servicio debe tener un precio distinto.`);
      return;
    }
    const newService = { id: "srv-" + Date.now() + Math.random().toString(36).substring(2, 5), name: nameToUse.trim(), price: priceNum };
    const updatedServices = [...(form.services || []), newService];
    const newSum = updatedServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
    setForm(prev => ({ ...prev, services: updatedServices, amount: newSum }));
    if (nameOverride === undefined) { setNewServiceName(""); setNewServicePrice(""); }
  };

  const handleRemoveService = (index) => {
    setForm(prev => {
      const updated = prev.services.filter((_, i) => i !== index);
      const newSum = updated.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
      return { ...prev, services: updated, amount: newSum };
    });
  };

  const handleUpdateService = (index, field, value) => {
    setForm(prev => {
      const updated = [...(prev.services || [])];
      const newPrice = field === "price" ? (parseFloat(value) || 0) : updated[index].price;
      // Validar precio duplicado
      if (field === "price" && newPrice > 0) {
        const duplicate = updated.find((s, i) => i !== index && Number(s.price) === newPrice);
        if (duplicate) {
          toast.error(`Ya existe "${duplicate.name}" con el mismo precio. Cada servicio debe tener un precio distinto.`);
          return prev;
        }
      }
      updated[index] = { ...updated[index], [field]: field === "price" ? newPrice : value };
      const newSum = updated.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
      return { ...prev, services: updated, amount: newSum };
    });
  };

  const sumServices = (form.services || []).reduce((acc, s) => acc + (Number(s.price) || 0), 0);
  const totalAmount = Number(form.amount) || 0;
  const diffManagement = totalAmount - sumServices;
  const isOverBudget = sumServices > totalAmount;

  const handleSyncTotalWithServices = () => {
    setForm(prev => ({ ...prev, amount: sumServices }));
    toast.success(`Monto total ajustado a ${formatCurrency(sumServices, form.currency)}`);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, travelers: Number(form.travelers), amount: Number(form.amount), booking_price: form.booking_price ? Number(form.booking_price) : null, expedia_price: form.expedia_price ? Number(form.expedia_price) : null };
      await api.put(`/quotations/${id}`, body);
      toast.success("Cotización guardada correctamente");
      loadQuotation();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al guardar cotización");
    } finally { setSaving(false); }
  };

  const handleSend = async (platform) => {
    setSaving(true); setSendingPlatform(platform);
    try {
      const isoNow = new Date().toISOString();
      const updatedForm = { ...form, travelers: Number(form.travelers), amount: Number(form.amount), booking_price: form.booking_price ? Number(form.booking_price) : null, expedia_price: form.expedia_price ? Number(form.expedia_price) : null, status: "enviada", sent_via: platform, sent_at: isoNow };
      await api.put(`/quotations/${id}`, updatedForm);
      toast.success(`Cotización marcada como enviada vía ${platform}`);
      setSendModalOpen(false); setSuccessModalOpen(true);
      loadQuotation();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Error al enviar cotización");
    } finally { setSaving(false); }
  };

  const copyClientLink = () => {
    const link = `${window.location.origin}/#/cotizacion/${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace copiado al portapapeles");
  };

  const handleDeleteQuotation = async () => {
    setDeleting(true);
    try { await api.delete(`/quotations/${id}`); toast.success("Cotización eliminada correctamente"); navigate("/admin/cotizaciones"); }
    catch (e) { toast.error(formatApiError(e.response?.data?.detail) || "Error al eliminar la cotización"); setDeleting(false); }
  };

  if (loading || !data) {
    return <div className="p-10 text-center text-gray-500 dark:text-gray-300 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Cargando hoja de cotización…</div>;
  }

  const { quotation, client, broker } = data;
  const clientLink = `${window.location.origin}/#/cotizacion/${id}`;
  const cleanPhone = (client.phone || "").replace(/[^\d+]/g, "");
  const whatsappMsg = `Hola ${client.first_name}, aquí tienes tu propuesta de viaje personalizada para ${form.destination}. Puedes ver todos los detalles y aceptarla aquí: ${clientLink}`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div data-testid="quotation-sheet-page" className="space-y-6 relative">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-turquoise/5 dark:bg-brand-turquoise/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-navy/3 dark:bg-brand-navy/6 rounded-full blur-3xl" />
      </div>
      <div className="flex items-center gap-3">
        <Link to="/admin/cotizaciones" className="h-9 w-9 border border-gray-200 dark:border-zinc-800 rounded-[10px] bg-white dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" data-testid="quotation-back-btn"><ArrowLeft className="h-4 w-4" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5"><h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Cotización</h1><StatusBadge value={form.status} /></div>
          <p className="text-xs text-gray-500 dark:text-gray-300">ID Cotización: {quotation.id}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href={clientLink} target="_blank" rel="noopener noreferrer" data-testid="quotation-view-deliverable-btn" className="h-9 w-9 inline-flex items-center justify-center border border-[#0D9387]/30 bg-[#0D9387]/10 hover:bg-[#0D9387]/25 text-[#0D9387] dark:text-teal-300 rounded-[10px] transition-all shadow-sm" title="Ver entregable del cliente"><Eye className="h-4.5 w-4.5" /></a>
          <a href={`/#/factura/${quotation.id}`} target="_blank" rel="noopener noreferrer" data-testid="quotation-view-invoice-btn" className="h-9 px-3 inline-flex items-center gap-1.5 border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-[10px] transition-all shadow-sm" title="Ver / Generar Factura"><FileText className="h-4 w-4" /><span>Factura</span></a>
          <button type="button" onClick={() => setDeleteModalOpen(true)} data-testid="quotation-delete-btn" className="h-9 w-9 inline-flex items-center justify-center border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-[10px] transition-all shadow-sm" title="Eliminar cotización"><Trash2 className="h-4.5 w-4.5" /></button>
          <button onClick={() => setSendModalOpen(true)} data-testid="quotation-send-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-3.5 py-2 text-sm font-semibold transition-colors shadow-sm"><Send className="h-4 w-4" /><span>Enviar al Cliente</span></button>
        </div>
      </div>

      {/* Banner de cambios solicitados por el cliente */}
      {(form.status === 'cambios_solicitados' || form.status === 'rechazada') && (
        <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 p-5 flex gap-4 items-start shadow-[0_0_20px_rgba(251,191,36,0.15)]">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
              {form.status === 'cambios_solicitados' ? '🔄 El cliente solicita cambios' : '❌ El cliente rechazó la propuesta'}
            </h3>
            {(form.client_notes || form.notes) && (
              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-wrap">
                {form.client_notes || form.notes}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <form onSubmit={handleSave} className="col-span-12 lg:col-span-8 bg-white dark:bg-zinc-900 rounded-[20px] shadow-[0_4px_24px_rgba(15,42,74,0.06),0_1px_4px_rgba(0,168,150,0.04)] border border-brand-turquoise/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-navy via-brand-turquoise to-brand-orange" />
          <div className="p-8 border-b border-brand-turquoise/10 dark:border-brand-turquoise/20 bg-gradient-to-br from-brand-navy/3 via-white to-brand-turquoise/5 dark:from-brand-navy/15 dark:via-brand-navy/10 dark:to-brand-turquoise/10 flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="text-xl font-bold text-brand-navy dark:text-gray-100 flex items-center gap-2"><FileText className="h-5 w-5 text-brand-turquoise" /><span>KARABU VIAJES & VISAS</span></div>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">Propuesta y Presupuesto de Servicios Turísticos</p>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-300">
              <p className="font-semibold text-gray-800 dark:text-gray-200">Fecha de Creación:</p>
              <p>{formatDate(quotation.created_at)}</p>
              {quotation.sent_at && <div className="mt-1"><p className="font-semibold text-gray-800 dark:text-gray-200">Fecha de Envío:</p><p>{formatDate(quotation.sent_at)} ({quotation.sent_via})</p></div>}
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Client and Broker Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none" />
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#0D9387] bg-[#0D9387]/10 dark:bg-teal-500/20 dark:text-teal-300 mb-3"><User className="w-3 h-3" /> Información del Cliente</span>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D9387] to-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">{(client.first_name?.[0] || 'C') + (client.last_name?.[0] || '')}</div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h4 className="font-bold text-base text-gray-900 dark:text-zinc-100 truncate">{client.first_name} {client.last_name}</h4>
                    <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-zinc-400 font-medium">
                      <a href={`mailto:${client.email}`} className="flex items-center gap-2 hover:text-[#0D9387] dark:hover:text-teal-300 transition-colors truncate"><Mail className="h-3.5 w-3.5 text-[#0D9387] shrink-0" /><span className="truncate">{client.email || 'Sin correo registrado'}</span></a>
                      {client.phone && <a href={`tel:${client.phone}`} className="flex items-center gap-2 hover:text-[#0D9387] dark:hover:text-teal-300 transition-colors"><Phone className="h-3.5 w-3.5 text-[#0D9387] shrink-0" /><span>{client.phone}</span></a>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 mb-3"><User className="w-3 h-3" /> Asesor Asignado (Broker)</span>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">{broker.name ? broker.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'A'}</div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h4 className="font-bold text-base text-gray-900 dark:text-zinc-100 truncate">{broker.name || 'Asesor Karabu'}</h4>
                    <a href={`mailto:${broker.email}`} className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"><Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" /><span className="truncate">{broker.email || 'asesor@karabu.com'}</span></a>
                  </div>
                </div>
              </div>
            </div>

            {/* Destino y Fechas */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-zinc-800 pb-2">Destino y Fechas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Destino del Viaje" required><input data-testid="quotation-destination" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputCls} /></Field>
                <Field label="Cantidad de Viajeros" required><input data-testid="quotation-travelers" type="number" min={1} required value={form.travelers} onChange={(e) => setForm({ ...form, travelers: e.target.value })} className={inputCls} /></Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Fecha de Salida"><input data-testid="quotation-travel-date" type="date" value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} className={inputCls} /></Field>
                <Field label="Fecha de Regreso"><input data-testid="quotation-return-date" type="date" value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} className={inputCls} /></Field>
              </div>
            </div>

            {/* Hotel + Tipo Habitación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Hotel Asignado"><input data-testid="quotation-assigned-hotel" value={form.assigned_hotel} onChange={(e) => setForm({ ...form, assigned_hotel: e.target.value })} placeholder="Ej: Grand Palladium Costa Mujeres..." className={inputCls} /></Field>
              <Field label="Tipo de Habitación">
                <input data-testid="quotation-room-type" value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })} placeholder="Ej: Sencilla, Doble, Triple..." className={inputCls} />
              </Field>
            </div>

            {/* Configuración del Entregable */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-zinc-800 pb-2">Configuración del Entregable</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Comisión extra (%)">
                  <div className="relative">
                    <input data-testid="quotation-tax" type="number" min="0" max="100" step="0.5" value={form.tax_percent || ''} onChange={(e) => setForm({ ...form, tax_percent: e.target.value })} className={`${inputCls} w-28`} placeholder="0" />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">Margen adicional sobre el total (solo interno)</p>
                </Field>

                <Field label="Imagen del Hero (URL)">
                  <input data-testid="quotation-hero-image" value={form.hero_image} onChange={(e) => setForm({ ...form, hero_image: e.target.value })} placeholder="https://... o deja vacío para usar la del destino" className={inputCls} />
                </Field>
              </div>
            </div>

            {/* DESGLOSE POR SERVICIO */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-gray-100 dark:border-zinc-800 pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"><Layers className="h-4 w-4 text-[#0D9387]" />Desglose por Servicio</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Agrega servicios individuales con nombre y precio. El total se calcula automáticamente.</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-medium text-gray-400">Atajos:</span>
                  <button type="button" onClick={() => handleAddService("Vuelos ida y vuelta", 800)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 transition font-medium">+ Vuelos</button>
                  <button type="button" onClick={() => handleAddService("Hospedaje", 1200)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 transition font-medium">+ Hospedaje</button>
                  <button type="button" onClick={() => handleAddService("Traslados aeropuerto - hotel", 150)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 transition font-medium">+ Traslados</button>
                  <button type="button" onClick={() => handleAddService("Seguro de viaje médico", 100)} className="px-2.5 py-1 text-xs rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 transition font-medium">+ Seguro</button>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-[12px] border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-7"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Nombre del Servicio</label><input data-testid="service-name-input" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="Ej: Vuelos ida y vuelta, Hospedaje..." className={inputCls} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(); } }} /></div>
                  <div className="sm:col-span-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Precio Individual ($)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input data-testid="service-price-input" type="number" step="0.01" min="0" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} placeholder="0.00" className={`${inputCls} pl-6`} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(); } }} /></div></div>
                  <div className="sm:col-span-2"><button type="button" onClick={() => handleAddService()} data-testid="add-service-btn" className="w-full h-[38px] bg-[#0D9387] hover:bg-[#0b7d72] text-white font-semibold text-xs rounded-[10px] flex items-center justify-center gap-1.5 transition shadow-sm"><Plus className="h-4 w-4" /> Agregar</button></div>
                </div>
              </div>

              {form.services && form.services.length > 0 ? (
                <div className="space-y-2 border border-gray-200 dark:border-gray-700/80 rounded-[12px] p-3 bg-white dark:bg-zinc-900">
                  {form.services.map((srv, index) => (
                    <div key={srv.id || index} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-150 dark:border-gray-700/50">
                      <div className="flex-1"><input value={srv.name} onChange={(e) => handleUpdateService(index, "name", e.target.value)} className="w-full bg-transparent font-medium text-sm text-gray-900 dark:text-gray-100 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-1 py-0.5" /></div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative w-32"><span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input type="number" step="0.01" min="0" value={srv.price} onChange={(e) => handleUpdateService(index, "price", e.target.value)} className="w-full pl-6 pr-2 py-1 text-right font-bold text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500" /></div>
                        <span className="text-xs text-gray-400 font-semibold">{form.currency}</span>
                        <button type="button" onClick={() => handleRemoveService(index)} title="Eliminar servicio" className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-[12px] text-xs text-gray-400">Aún no has agregado desgloses de servicios. Usa el formulario de arriba o los atajos rápidos.</div>
              )}

              {/* Resumen de cálculo */}
              <div className="p-4 rounded-[14px] bg-gradient-to-r from-gray-50 to-teal-50/30 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2"><span className="font-semibold text-gray-700 dark:text-gray-300">Suma de Servicios:</span><span className="font-bold text-gray-900 dark:text-white text-base">{formatCurrency(sumServices, form.currency)}</span></div>
                  <div className="flex items-center gap-2"><span className="font-semibold text-gray-700 dark:text-gray-300">Monto General:</span><span className="font-bold text-[#0D9387] text-base">{formatCurrency(totalAmount, form.currency)}</span></div>
                </div>
                {isOverBudget ? (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0 text-red-500" /><span><strong>¡Atención!</strong> La suma de los servicios ({formatCurrency(sumServices, form.currency)}) excede el monto total ({formatCurrency(totalAmount, form.currency)}).</span></div>
                    <button type="button" onClick={handleSyncTotalWithServices} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shrink-0 transition shadow-sm">Ajustar Monto Total a {formatCurrency(sumServices, form.currency)}</button>
                  </div>
                ) : diffManagement > 0 && form.services && form.services.length > 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 shrink-0 text-emerald-500" /><span><strong>Gastos de gestión:</strong> {formatCurrency(diffManagement, form.currency)} (Diferencia calculada entre el monto general y la suma de servicios)</span></div>
                  </div>
                ) : form.services && form.services.length > 0 && sumServices === totalAmount ? (
                  <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-500" /><span>La suma de los servicios coincide exactamente con el monto general.</span></div>
                ) : null}
              </div>
            </div>

            {/* Precio de la Propuesta */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-zinc-800 pb-2">Precio de la Propuesta</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2"><Field label="Monto Cotizado" required><input data-testid="quotation-amount" type="number" step="0.01" min={0} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} /></Field></div>
                <div><Field label="Moneda" required><select data-testid="quotation-currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}><option>USD</option><option>DOP</option><option>COP</option><option>EUR</option><option>MXN</option></select></Field></div>
              </div>
            </div>

            {/* Comparativa de Precios */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-zinc-800 pb-2">Comparativa de Precios</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio en Booking.com"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span><input data-testid="quotation-booking-price" type="number" step="0.01" min={0} value={form.booking_price} onChange={(e) => setForm({ ...form, booking_price: e.target.value })} placeholder="0.00" className={`${inputCls} pl-7`} /></div></Field>
                <Field label="Precio en Expedia"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span><input data-testid="quotation-expedia-price" type="number" step="0.01" min={0} value={form.expedia_price} onChange={(e) => setForm({ ...form, expedia_price: e.target.value })} placeholder="0.00" className={`${inputCls} pl-7`} /></div></Field>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-2">
                      <div className="flex flex-col items-center p-5 text-center border-r border-slate-200 dark:border-zinc-800">
                        <div className="w-full h-28 rounded-xl bg-[#003580] flex items-center justify-center p-3 mb-3 shadow-inner">
                          <img src="/booking-logo.svg" alt="Booking" className="h-full w-full object-contain rounded-lg" />
                        </div>
                        <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">Booking.com</div>
                        <div className="text-xl font-black text-slate-800 dark:text-slate-200">
                          {form.booking_price ? formatCurrency(Number(form.booking_price), form.currency) : '—'}
                        </div>
                      </div>
                      <div className="flex flex-col items-center p-5 text-center">
                        <div className="w-full h-28 rounded-xl bg-[#FFE000] flex items-center justify-center p-3 mb-3 shadow-inner">
                          <img src="/expedia-logo.svg" alt="Expedia" className="h-full w-full object-contain rounded-lg" />
                        </div>
                        <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">Expedia</div>
                        <div className="text-xl font-black text-slate-800 dark:text-slate-200">
                          {form.expedia_price ? formatCurrency(Number(form.expedia_price), form.currency) : '—'}
                        </div>
                      </div>
                  </div>
                </div>
            </div>

            {/* Notas */}
            <div className="space-y-4 pt-2">
              <Field label="Especificaciones / Notas de Itinerario">
                <textarea data-testid="quotation-notes" rows={6} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Detalla qué incluye la cotización: Hoteles propuestos, categoría de habitación, vuelos, traslados, etc..." className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="p-6 border-t border-brand-turquoise/10 dark:border-brand-turquoise/20 bg-gradient-to-r from-brand-navy/[0.02] to-brand-turquoise/[0.03] dark:from-brand-navy/15 dark:to-brand-turquoise/10 flex items-center justify-end gap-2">
            <button type="submit" disabled={saving} data-testid="quotation-save-btn" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] px-5 py-2 text-sm font-semibold transition-colors shadow-sm disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Guardar Hoja de Cotización</button>
          </div>
        </form>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {quotation.form_data && Object.keys(quotation.form_data).length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-green-200 dark:border-green-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 border-b border-green-100 dark:border-green-800 pb-3 mb-4 flex items-center gap-2"><User className="h-4 w-4" /> Datos del Formulario Web</h3>
              <div className="space-y-3 text-sm">
                {quotation.form_data.fullName && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-400 font-medium">Nombre:</span><span className="text-gray-900 dark:text-gray-100 font-semibold">{quotation.form_data.fullName}</span></div>}
                {quotation.form_data.email && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-400 font-medium">Email:</span><span className="text-gray-700 dark:text-gray-300">{quotation.form_data.email}</span></div>}
                {quotation.form_data.phone && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-400 font-medium">Teléfono:</span><span className="text-gray-700 dark:text-gray-300">{quotation.form_data.phone}</span></div>}
                {quotation.form_data.hotelCategory && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-400 font-medium">Categoría hotel:</span><span className="text-gray-700 dark:text-gray-300">{quotation.form_data.hotelCategory}</span></div>}
                {quotation.form_data.roomType && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-400 font-medium">Tipo habitación:</span><span className="text-gray-700 dark:text-gray-300">{quotation.form_data.roomType}</span></div>}
                {quotation.form_data.preferredHotel && <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-400 font-medium">Pref. Hotel:</span><span className="text-gray-700 dark:text-gray-300">{quotation.form_data.preferredHotel}</span></div>}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-[20px] shadow-[0_2px_12px_rgba(15,42,74,0.04)] border border-brand-turquoise/8 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">Información del Sistema</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-400 font-medium">Estado actual:</span><StatusBadge value={quotation.status} /></div>
              <div className="flex justify-between"><span className="text-gray-400 dark:text-gray-400 font-medium">Última actualización:</span><span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(quotation.updated_at)}</span></div>
              {quotation.client_notes && (
                <div className="pt-3 border-t border-amber-200 dark:border-amber-800">
                  <span className="text-amber-600 dark:text-amber-400 font-medium text-xs uppercase tracking-wider block mb-1">Mensaje del cliente</span>
                  <p className="text-amber-900 dark:text-amber-200 text-sm whitespace-pre-wrap leading-relaxed">{quotation.client_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {sendModalOpen && (
        <div data-testid="send-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mt-16 bg-white dark:bg-zinc-900 rounded-[16px] shadow-xl border border-gray-200 dark:border-zinc-800 w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Enviar Cotización</h3><button type="button" onClick={() => setSendModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"><X className="h-4 w-4 text-gray-500 dark:text-gray-300" /></button></div>
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-5">Elige el canal por el cual deseas enviarle la propuesta interactiva al cliente.</p>
            <div className="space-y-3">
              <button onClick={() => handleSend("whatsapp")} data-testid="send-via-whatsapp" className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-[10px] py-2.5 text-sm font-semibold transition-colors"><Send className="h-4 w-4" /> Enviar por WhatsApp</button>
              <button onClick={() => handleSend("email")} data-testid="send-via-email" className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] py-2.5 text-sm font-semibold transition-colors"><Mail className="h-4 w-4" /> Enviar por Correo</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModalOpen && (
        <div data-testid="success-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mt-16 bg-white dark:bg-zinc-900 rounded-[16px] shadow-xl border border-gray-200 dark:border-zinc-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between mb-2"><h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Propuesta Generada Correctamente</h3><button type="button" onClick={() => setSuccessModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"><X className="h-4 w-4 text-gray-500 dark:text-gray-300" /></button></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">La cotización ha sido guardada con el estado <strong>"Enviada"</strong>. Ya se puede compartir el enlace con el cliente.</p>
            <div className="space-y-2"><span className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider block">Enlace Público de la Propuesta</span>
              <div className="flex items-center gap-1.5"><input readOnly value={clientLink} className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-[8px] px-3 py-2 text-xs text-gray-600 dark:text-gray-300 font-mono focus:outline-none" /><button onClick={copyClientLink} className="h-9 w-9 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-250 rounded-[8px] flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0 transition-colors"><Clipboard className="h-4 w-4" /></button></div>
            </div>
            {sendingPlatform === "whatsapp" ? (
              <div className="pt-2"><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-[10px] py-2.5 text-sm font-semibold transition-colors"><ExternalLink className="h-4 w-4" /> Abrir WhatsApp Web</a></div>
            ) : (
              <div className="pt-2 bg-gray-50 dark:bg-zinc-800 p-4 rounded-[10px] border"><span className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Correo Preparado</span><p className="text-xs text-gray-500 dark:text-gray-300">Puedes copiar el enlace y redactar el correo a <strong>{client.email}</strong>.</p></div>
            )}
            <div className="flex justify-end pt-2"><button type="button" onClick={() => setSuccessModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">Cerrar</button></div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div data-testid="delete-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[16px] shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3"><div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-lg"><AlertTriangle className="h-5 w-5" /><span>Eliminar Cotización</span></div><button type="button" onClick={() => setDeleteModalOpen(false)} className="h-8 w-8 rounded-[8px] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"><X className="h-4 w-4 text-gray-500 dark:text-gray-300" /></button></div>
            <p className="text-sm text-gray-700 dark:text-gray-300">¿Estás seguro de que deseas eliminar esta cotización? Esta acción es irreversible.</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={deleting} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-800">Cancelar</button>
              <button type="button" onClick={handleDeleteQuotation} disabled={deleting} data-testid="confirm-delete-btn" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Sí, eliminar</button>
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
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  );
}
