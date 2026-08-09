import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import StatusBadge from "./StatusBadge";
import ImageUpload from "./ImageUpload";
import { formatDate, formatCurrency } from "../lib/format";
import { formatPhoneWithCode } from "../utils/phone";
import { toast } from "sonner";
import { 
  ArrowLeft, FileText, User, Mail, Phone, Calendar, 
  MapPin, DollarSign, Send, Save, Loader2, X, Clipboard, ExternalLink,
  Plus, Trash2, AlertTriangle, CheckCircle, Sparkles, Layers, Eye,
  ChevronDown, ChevronRight, RotateCcw, XCircle
} from "lucide-react";

const inputCls = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none transition-all placeholder:text-gray-400";

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 group">
        <div className="flex items-center gap-2 flex-1">
          {Icon && <Icon className="h-4 w-4 text-[#0D9387]" />}
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-[#0D9387] transition-colors" /> : <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#0D9387] transition-colors" />}
      </button>
      {open && <div className="pl-0">{children}</div>}
    </div>
  );
}

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
    gallery_images: [],
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
        gallery_images: Array.isArray(q.gallery_images) ? q.gallery_images : [],
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
      // Copy WhatsApp message to clipboard
      if (platform === "whatsapp") {
        await navigator.clipboard.writeText(whatsappMsg);
        toast.success("Mensaje copiado. Pégalo en WhatsApp.");
      }
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

  const btnBase = "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-sm";

  return (
    <div data-testid="quotation-sheet-page" className="space-y-6 relative">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-turquoise/5 dark:bg-brand-turquoise/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-navy/3 dark:bg-brand-navy/6 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/cotizaciones" className="h-9 w-9 border border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors" data-testid="quotation-back-btn"><ArrowLeft className="h-4 w-4" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2.5"><h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Cotización</h1><StatusBadge value={form.status} /></div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{quotation.code || `#${quotation.id?.slice(0, 8)}`}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href={clientLink} target="_blank" rel="noopener noreferrer" className="h-9 w-9 inline-flex items-center justify-center border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 dark:text-gray-500 rounded-xl transition-all" title="Ver entregable"><Eye className="h-4 w-4" /></a>
          <a href={`/#/factura/${quotation.id}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 inline-flex items-center justify-center border border-[#0D9387]/30 bg-[#0D9387]/10 hover:bg-[#0D9387]/20 text-[#0D9387] rounded-xl transition-all" title="Factura"><FileText className="h-4 w-4" /></a>
          <button type="button" onClick={() => setDeleteModalOpen(true)} className="h-9 w-9 inline-flex items-center justify-center border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 rounded-xl transition-all" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
          <button onClick={() => setSendModalOpen(true)} className={`${btnBase} bg-blue-600 hover:bg-blue-700 text-white`}><Send className="h-4 w-4" />Enviar al Cliente</button>
        </div>
      </div>

      {/* Banner de cambios */}
      {(form.status === 'cambios_solicitados' || form.status === 'rechazada') && (
        <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-5 flex gap-4 items-start shadow-[0_0_20px_rgba(251,191,36,0.15)]">
          <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
              {form.status === 'cambios_solicitados' ? <span className="inline-flex items-center gap-1"><RotateCcw className="w-4 h-4" />El cliente solicita cambios</span> : <span className="inline-flex items-center gap-1"><XCircle className="w-4 h-4" />El cliente rechazó la propuesta</span>}
            </h3>
            {(form.client_notes || form.notes) && (
              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-wrap">{form.client_notes || form.notes}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Formulario principal */}
        <form onSubmit={handleSave} className="col-span-12 lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
          {/* Header del form */}
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-start flex-wrap gap-4 bg-gradient-to-r from-[#0F2A4A]/5 to-[#0D9387]/5 dark:from-[#0F2A4A]/20 dark:to-[#0D9387]/10">
            <div>
              <div className="text-lg font-bold text-[#0F2A4A] dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0D9387]" /> KARABU VIAJES
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Propuesta de Servicios Turísticos</p>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Creada: {formatDate(quotation.created_at)}</p>
              {quotation.sent_at && <p className="mt-0.5">Enviada: {formatDate(quotation.sent_at)} ({quotation.sent_via})</p>}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Cards Cliente + Broker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#0D9387] bg-[#0D9387]/10 mb-3"><User className="w-3 h-3" /> Cliente</span>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0D9387] text-white font-bold flex items-center justify-center text-sm shrink-0">{(client.first_name?.[0] || 'C') + (client.last_name?.[0] || '')}</div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{client.first_name} {client.last_name}</h4>
                    <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0D9387] transition-colors truncate"><Mail className="h-3 w-3 shrink-0" />{client.email || 'Sin correo'}</a>
                    {client.phone && <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0D9387] transition-colors"><Phone className="h-3 w-3 shrink-0" />{formatPhoneWithCode(client.phone)}</a>}
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#0F2A4A] bg-[#0F2A4A]/10 dark:text-teal-300 dark:bg-blue-950/50 mb-3"><User className="w-3 h-3" /> Asesor</span>
                <div className="flex items-start gap-3">
                  {broker.avatar_url ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#0D9387] shrink-0">
                      <img src={broker.avatar_url} alt={broker.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#0F2A4A] text-white font-bold flex items-center justify-center text-sm shrink-0">{broker.name ? broker.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'K'}</div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{broker.name || 'Asesor Karabu'}</h4>
                    <a href={`mailto:${broker.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0D9387] transition-colors truncate"><Mail className="h-3 w-3 shrink-0" />{broker.email || 'asesor@karabu.com'}</a>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-zinc-800" />

            {/* Destino y Fechas */}
            <Section title="Destino y Fechas" icon={MapPin}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Destino del Viaje" required><input data-testid="quotation-destination" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={inputCls} /></Field>
                  <Field label="Viajeros" required><input data-testid="quotation-travelers" type="number" min={1} required value={form.travelers} onChange={(e) => setForm({ ...form, travelers: e.target.value })} className={inputCls} /></Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Fecha de Salida"><input data-testid="quotation-travel-date" type="date" value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} className={inputCls} /></Field>
                  <Field label="Fecha de Regreso"><input data-testid="quotation-return-date" type="date" value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} className={inputCls} /></Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Hotel Asignado"><input data-testid="quotation-assigned-hotel" value={form.assigned_hotel} onChange={(e) => setForm({ ...form, assigned_hotel: e.target.value })} placeholder="Ej: Grand Palladium..." className={inputCls} /></Field>
                  <Field label="Tipo de Habitación"><input data-testid="quotation-room-type" value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })} placeholder="Sencilla, Doble, Triple..." className={inputCls} /></Field>
                </div>
              </div>
            </Section>

            <hr className="border-gray-100 dark:border-zinc-800" />

            {/* Precio de la Propuesta */}
            <Section title="Precio de la Propuesta" icon={DollarSign}>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><Field label="Monto Cotizado" required><input data-testid="quotation-amount" type="number" step="0.01" min={0} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} /></Field></div>
                <div><Field label="Moneda" required><select data-testid="quotation-currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}><option>USD</option><option>DOP</option><option>COP</option><option>EUR</option><option>MXN</option></select></Field></div>
              </div>
            </Section>

            <hr className="border-gray-100 dark:border-zinc-800" />

            {/* Configuración */}
            <Section title="Configuración del Entregable" icon={Eye} defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Comisión extra (%)">
                  <div className="relative">
                    <input data-testid="quotation-tax" type="number" min="0" max="100" step="0.5" value={form.tax_percent || ''} onChange={(e) => setForm({ ...form, tax_percent: e.target.value })} className={`${inputCls} w-28`} placeholder="0" />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">Margen interno (no visible al cliente)</p>
                </Field>
                <Field label="Imagen Hero">
                  <ImageUpload
                    value={form.hero_image}
                    onChange={(url) => setForm({ ...form, hero_image: url })}
                    label="Cargar imagen del destino"
                    previewSize="sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Vacío = se usará una imagen del destino automáticamente</p>
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Galería de imágenes (carrusel)">
                  <textarea
                    value={Array.isArray(form.gallery_images) ? form.gallery_images.join('\n') : (form.gallery_images || '')}
                    onChange={(e) => setForm({ ...form, gallery_images: e.target.value.split('\n').filter(u => u.trim()) })}
                    rows={4}
                    placeholder={'https://images.unsplash.com/photo-...\nhttps://images.unsplash.com/photo-...'}
                    className={inputCls}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Pega URLs de imágenes, una por línea. Se mostrarán en carrusel en el entregable.</p>
                </Field>
              </div>
            </Section>

            <hr className="border-gray-100 dark:border-zinc-800" />

            {/* Desglose por Servicio */}
            <Section title="Desglose por Servicio" icon={Layers}>
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Agrega servicios con nombre y precio. El total se calcula automáticamente.</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-medium">Atajos:</span>
                  {[
                    ["Vuelos ida y vuelta", 800],
                    ["Hospedaje", 1200],
                    ["Traslados aeropuerto - hotel", 150],
                    ["Seguro de viaje médico", 100]
                  ].map(([name, price]) => (
                    <button key={name} type="button" onClick={() => handleAddService(name, price)} className="px-2.5 py-1 text-xs rounded-lg bg-[#0D9387]/10 text-[#0D9387] border border-[#0D9387]/20 hover:bg-[#0D9387]/20 transition font-medium">{name.split(' ')[0]}</button>
                  ))}
                </div>

                <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-6"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Servicio</label><input data-testid="service-name-input" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="Vuelos, Hospedaje..." className={inputCls} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(); } }} /></div>
                    <div className="sm:col-span-4"><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Precio</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input data-testid="service-price-input" type="number" step="0.01" min="0" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} placeholder="0.00" className={`${inputCls} pl-6`} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(); } }} /></div></div>
                    <div className="sm:col-span-2"><button type="button" onClick={() => handleAddService()} className="w-full h-[42px] bg-[#0D9387] hover:bg-[#0b7d72] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"><Plus className="h-4 w-4" />Agregar</button></div>
                  </div>
                </div>

                {form.services && form.services.length > 0 ? (
                  <div className="space-y-2">
                    {form.services.map((srv, index) => (
                      <div key={srv.id || index} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                        <div className="flex-1"><input value={srv.name} onChange={(e) => handleUpdateService(index, "name", e.target.value)} className="w-full bg-transparent font-medium text-sm text-gray-900 dark:text-gray-100 border-b border-transparent hover:border-gray-300 focus:border-[#0D9387] outline-none px-1 py-0.5" /></div>
                        <div className="relative w-28"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input type="number" step="0.01" min="0" value={srv.price} onChange={(e) => handleUpdateService(index, "price", e.target.value)} className="w-full pl-5 pr-2 py-1 text-right font-bold text-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 outline-none focus:border-[#0D9387]" /></div>
                        <span className="text-xs text-gray-400 font-medium">{form.currency}</span>
                        <button type="button" onClick={() => handleRemoveService(index)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-400">Sin servicios. Usa el formulario o los atajos.</div>
                )}

                {/* Resumen con comisión */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-[#0D9387]/5 dark:from-zinc-800/50 dark:to-zinc-800/30 border border-gray-100 dark:border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2"><span className="font-semibold text-gray-600 dark:text-gray-400">Suma servicios:</span><span className="font-bold text-gray-900 dark:text-white">{formatCurrency(sumServices, form.currency)}</span></div>
                    <div className="flex items-center gap-2"><span className="font-semibold text-gray-600 dark:text-gray-400">Total:</span><span className="font-bold text-[#0D9387] text-lg">{formatCurrency(totalAmount, form.currency)}</span></div>
                  </div>
                  {Number(form.tax_percent) > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#0D9387]/10 border border-[#0D9387]/20 text-[#0D9387] text-xs font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />Comisión: {form.tax_percent}% = {formatCurrency(totalAmount * Number(form.tax_percent) / 100, form.currency)} → Total final cliente: {formatCurrency(totalAmount * (1 + Number(form.tax_percent) / 100), form.currency)}
                    </div>
                  )}
                  {isOverBudget ? (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 shrink-0" />Servicios ({formatCurrency(sumServices, form.currency)}) exceden el total ({formatCurrency(totalAmount, form.currency)})</span>
                      <button type="button" onClick={handleSyncTotalWithServices} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shrink-0 transition">Ajustar a {formatCurrency(sumServices, form.currency)}</button>
                    </div>
                  ) : diffManagement > 0 && form.services?.length > 0 ? (
                    <div className="p-2.5 rounded-xl bg-[#0D9387]/10 border border-[#0D9387]/20 text-[#0D9387] text-xs font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4" />Gastos de gestión: {formatCurrency(diffManagement, form.currency)}</div>
                  ) : form.services?.length > 0 && sumServices === totalAmount ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2"><CheckCircle className="h-4 w-4" />Servicios y total coinciden</div>
                  ) : null}
                </div>
              </div>
            </Section>

            <hr className="border-gray-100 dark:border-zinc-800" />

            {/* Comparativa */}
            <Section title="Comparativa de Precios" icon={Sparkles} defaultOpen={!!form.booking_price || !!form.expedia_price}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Booking.com"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span><input data-testid="quotation-booking-price" type="number" step="0.01" value={form.booking_price} onChange={(e) => setForm({ ...form, booking_price: e.target.value })} placeholder="0.00" className={`${inputCls} pl-7`} /></div></Field>
                  <Field label="Expedia"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span><input data-testid="quotation-expedia-price" type="number" step="0.01" value={form.expedia_price} onChange={(e) => setForm({ ...form, expedia_price: e.target.value })} placeholder="0.00" className={`${inputCls} pl-7`} /></div></Field>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-zinc-800">
                    <div className="flex flex-col items-center p-4 bg-[#003580]/5">
                      <img src="/booking-logo.svg" alt="Booking" className="h-20 object-contain mb-2" />
                      <span className="text-xs font-bold text-gray-500 uppercase mb-1">Booking.com</span>
                      <span className="text-lg font-black text-gray-900 dark:text-white">{form.booking_price ? formatCurrency(Number(form.booking_price), form.currency) : '—'}</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-[#FFE000]/5">
                      <img src="/expedia-logo.svg" alt="Expedia" className="h-20 object-contain mb-2" />
                      <span className="text-xs font-bold text-gray-500 uppercase mb-1">Expedia</span>
                      <span className="text-lg font-black text-gray-900 dark:text-white">{form.expedia_price ? formatCurrency(Number(form.expedia_price), form.currency) : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <hr className="border-gray-100 dark:border-zinc-800" />

            {/* Notas */}
            <Section title="Especificaciones / Notas" icon={FileText} defaultOpen={!!form.notes}>
              <textarea data-testid="quotation-notes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Detalles del itinerario, hoteles, vuelos, traslados..." className={inputCls} />
            </Section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex items-center justify-end">
            <button type="submit" disabled={saving} className={`${btnBase} bg-[#0D9387] hover:bg-[#0b7d72] text-white disabled:opacity-50`}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Cotización
            </button>
          </div>
        </form>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {quotation.form_data && Object.keys(quotation.form_data).length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5">
              <h3 className="text-sm font-semibold text-[#0D9387] border-b border-gray-100 dark:border-zinc-800 pb-3 mb-3 flex items-center gap-2"><User className="h-4 w-4" />Datos del Formulario Web</h3>
              <div className="space-y-2 text-sm">
                {quotation.form_data.fullName && <Row label="Nombre" value={quotation.form_data.fullName} bold />}
                {quotation.form_data.email && <Row label="Email" value={quotation.form_data.email} />}
                {quotation.form_data.phone && <Row label="Teléfono" value={formatPhoneWithCode(quotation.form_data.phone)} />}
                {quotation.form_data.hotelCategory && <Row label="Categoría hotel" value={quotation.form_data.hotelCategory} />}
                {quotation.form_data.roomType && <Row label="Tipo habitación" value={quotation.form_data.roomType} />}
                {quotation.form_data.preferredHotel && <Row label="Hotel preferido" value={quotation.form_data.preferredHotel} />}
                {/* Habitaciones */}
                {(quotation.form_data.habitacionesSencilla > 0 || quotation.form_data.habitacionesDoble > 0 || quotation.form_data.habitacionesTriple > 0) && (
                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Habitaciones</span>
                    <div className="flex gap-2 flex-wrap">
                      {quotation.form_data.habitacionesSencilla > 0 && <span className="px-2 py-1 bg-[#0D9387]/10 text-[#0D9387] rounded-lg text-xs font-semibold">{quotation.form_data.habitacionesSencilla} Sencilla</span>}
                      {quotation.form_data.habitacionesDoble > 0 && <span className="px-2 py-1 bg-[#0D9387]/10 text-[#0D9387] rounded-lg text-xs font-semibold">{quotation.form_data.habitacionesDoble} Doble</span>}
                      {quotation.form_data.habitacionesTriple > 0 && <span className="px-2 py-1 bg-[#0D9387]/10 text-[#0D9387] rounded-lg text-xs font-semibold">{quotation.form_data.habitacionesTriple} Triple</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-3">Información</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Estado</span><StatusBadge value={quotation.status} /></div>
              <div className="flex justify-between"><span className="text-gray-400">Actualizado</span><span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(quotation.updated_at)}</span></div>
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

      {/* Modales (sin cambios visuales mayores) */}
      {sendModalOpen && (
        <div data-testid="send-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mt-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Enviar Cotización</h3><button type="button" onClick={() => setSendModalOpen(false)} className="h-8 w-8 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center"><X className="h-4 w-4" /></button></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Elige el canal para enviar la propuesta al cliente.</p>
            <div className="space-y-3">
              <button onClick={() => handleSend("whatsapp")} className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-sm font-semibold transition"><Send className="h-4 w-4" />Enviar por WhatsApp</button>
              <button onClick={() => handleSend("email")} className="w-full inline-flex items-center justify-center gap-2 bg-[#0D9387] hover:bg-[#0b7d72] text-white rounded-xl py-2.5 text-sm font-semibold transition"><Mail className="h-4 w-4" />Enviar por Correo</button>
            </div>
          </div>
        </div>
      )}

      {successModalOpen && (
        <div data-testid="success-modal" className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mt-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Propuesta Generada</h3><button type="button" onClick={() => setSuccessModalOpen(false)} className="h-8 w-8 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center"><X className="h-4 w-4" /></button></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Cotización marcada como <strong>Enviada</strong>. Comparte el enlace con el cliente.</p>
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Enlace público</span>
              <div className="flex items-center gap-1.5">
                <input readOnly value={clientLink} className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-300 font-mono outline-none" />
                <button onClick={copyClientLink} className="h-9 w-9 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0 transition"><Clipboard className="h-4 w-4" /></button>
              </div>
            </div>
            {sendingPlatform === "whatsapp" ? (
              <>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Mensaje para WhatsApp</span>
                  <div className="relative">
                    <textarea readOnly rows={3} value={whatsappMsg} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-300 font-sans outline-none resize-none" />
                    <button
                      onClick={() => { navigator.clipboard.writeText(whatsappMsg); toast.success("Mensaje copiado"); }}
                      className="absolute top-2 right-2 h-8 px-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    ><Clipboard className="h-3.5 w-3.5" />Copiar</button>
                  </div>
                </div>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-sm font-semibold transition"><ExternalLink className="h-4 w-4" />Abrir WhatsApp Web</a>
              </>
            ) : (
              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl border border-gray-100 dark:border-zinc-700"><p className="text-xs text-gray-500">Copia el enlace y envíalo a <strong>{client.email}</strong>.</p></div>
            )}
            <div className="flex justify-end pt-2"><button type="button" onClick={() => setSuccessModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800">Cerrar</button></div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div data-testid="delete-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3"><div className="flex items-center gap-2 text-red-500 font-bold text-lg"><AlertTriangle className="h-5 w-5" />Eliminar Cotización</div><button type="button" onClick={() => setDeleteModalOpen(false)} className="h-8 w-8 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center"><X className="h-4 w-4" /></button></div>
            <p className="text-sm text-gray-700 dark:text-gray-300">¿Eliminar esta cotización? Es irreversible.</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={deleting} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800">Cancelar</button>
              <button type="button" onClick={handleDeleteQuotation} disabled={deleting} className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Eliminar</button>
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
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-400 shrink-0">{label}:</span>
      <span className={`text-right ${bold ? 'text-gray-900 dark:text-gray-100 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>{value}</span>
    </div>
  );
}
