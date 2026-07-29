import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Printer, ArrowLeft, User, CreditCard, Mail, Phone, MapPin, 
  FileText, ShieldCheck, Plus, Trash2, Edit3
} from "lucide-react";
import Logo from "../components/Logo";
import api from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";

const EMISOR = {
  name: "Karabu Viajes & Visas S.R.L.",
  rnc: "1-32-84920-1",
  email: "facturacion@karabu.com",
  phone: "+1 (809) 555-0199",
  address: "Av. Winston Churchill esq. 27 de Febrero, Torre Karabu, Piso 8, Santo Domingo, R.D."
};

const DEFAULT_CLIENT = {
  name: "Cliente Karabu", email: "", phone: "",
  document_id: "", address: ""
};

const BANK_INFO = {
  bank: "Banco Popular Dominicano",
  account: "812-49102-3",
  titular: "Karabu Viajes & Visas S.R.L.",
  rnc: "1-32-84920-1"
};

const FALLBACK_ITEMS = [
  { id: "1", description: "Servicio Turístico", quantity: 1, unitPrice: 0 }
];

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [client, setClient] = useState(DEFAULT_CLIENT);

  const [invoice, setInvoice] = useState({
    number: "",
    ncf: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    status: "pendiente", currency: "USD",
    notes: "Factura correspondiente a reserva de paquete turístico con Karabu Viajes."
  });

  const [items, setItems] = useState(FALLBACK_ITEMS);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/quotations/${id}`);
        const qData = res.data?.quotation || res.data;
        const cliData = res.data?.client;
        if (qData) {
          setInvoice(prev => ({
            ...prev,
            number: `FAC-${String(qData.id).slice(0, 8).toUpperCase()}`,
            currency: qData.currency || "USD",
            issueDate: qData.created_at ? qData.created_at.split("T")[0] : prev.issueDate,
            notes: qData.notes || prev.notes,
          }));
          if (cliData) {
            setClient({
              name: `${cliData.first_name || ''} ${cliData.last_name || ''}`.trim() || DEFAULT_CLIENT.name,
              email: cliData.email || "",
              phone: cliData.phone || "",
              document_id: cliData.document_id || "",
              address: cliData.address || ""
            });
          }
          if (Array.isArray(qData.services) && qData.services.length > 0) {
            setItems(qData.services.map((s, idx) => ({
              id: String(idx + 1), description: s.name || "Servicio Turístico", quantity: 1, unitPrice: Number(s.price) || 0
            })));
          } else if (qData.amount) {
            const totalAmt = Number(qData.amount);
            setItems([{
              id: "1",
              description: `Paquete Turístico — ${qData.destination || 'Destino'}`,
              quantity: 1,
              unitPrice: totalAmt
            }]);
          }
        }
      } catch (err) { console.error("Error loading invoice:", err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [id]);

  const rawSubtotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);

  const handleItemChange = (index, field, val) => {
    const updated = [...items];
    updated[index][field] = val;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { id: String(Date.now()), description: "Nuevo servicio", quantity: 1, unitPrice: 100 }]);
  const removeItem = (index) => { if (items.length <= 1) return; setItems(items.filter((_, i) => i !== index)); };
  const handlePrint = () => window.print();
  const handleBack = () => { if (window.history.length > 1) navigate(-1); else navigate("/"); };

  if (loading) return <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex items-center justify-center text-slate-500">Cargando factura…</div>;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 antialiased py-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto mb-6 print:hidden flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-md">
        <button onClick={handleBack} className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Volver</button>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsEditing(!isEditing)} className={`h-9 px-3.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${isEditing ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300" : "border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"}`}><Edit3 className="w-3.5 h-3.5" />{isEditing ? "Finalizar Edición" : "Editar Datos"}</button>
          <button onClick={handlePrint} className="h-9 px-4 text-xs font-bold rounded-xl bg-[#0D9387] hover:bg-[#0b7e74] text-white transition-all shadow-md flex items-center gap-2"><Printer className="w-4 h-4" /><span>Imprimir / PDF</span></button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:max-w-none print:rounded-none">
        <div className="h-3 bg-gradient-to-r from-[#0F2A4A] via-[#0D9387] to-[#00A896]" />
        <div className="p-8 sm:p-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-zinc-800">
            <div className="space-y-3 max-w-md">
              <Logo light={false} showText={true} />
              <div className="text-xs text-slate-500 dark:text-zinc-400 space-y-1 mt-2">
                <p className="font-bold text-slate-800 dark:text-zinc-200">{EMISOR.name}</p>
                <p>RNC: <span className="font-semibold text-slate-700 dark:text-zinc-300">{EMISOR.rnc}</span></p>
                <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#0D9387]" />{EMISOR.address}</p>
                <p><Phone className="w-3 h-3 text-[#0D9387] inline mr-1" />{EMISOR.phone} • <Mail className="w-3 h-3 text-[#0D9387] inline mr-1" />{EMISOR.email}</p>
              </div>
            </div>
            <div className="text-left sm:text-right space-y-2 bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 min-w-[240px]">
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#0D9387] bg-[#0D9387]/10 px-2.5 py-0.5 rounded-full">Factura de Venta</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${invoice.status === 'pagada' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>{invoice.status === 'pagada' ? 'Pagada' : 'Pendiente'}</span>
              </div>
              <div className="text-2xl font-black text-[#0F2A4A] dark:text-zinc-100 font-mono tracking-tight">{invoice.number}</div>
              {invoice.ncf && <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">NCF: <span className="font-bold">{invoice.ncf}</span></p>}
              <div className="pt-2 text-xs text-slate-500 dark:text-zinc-400 space-y-0.5">
                <p>Emisión: <strong className="text-slate-800 dark:text-zinc-200">{formatDate(invoice.issueDate)}</strong></p>
                <p>Vencimiento: <strong className="text-slate-800 dark:text-zinc-200">{formatDate(invoice.dueDate)}</strong></p>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="bg-slate-50/80 dark:bg-zinc-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0D9387] block mb-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Facturado A (Cliente)</span>
            <div className="space-y-1 text-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">{client.name}</h3>
              {client.document_id && <p>Cédula/Documento: <span className="font-bold text-slate-800 dark:text-zinc-200">{client.document_id}</span></p>}
              {client.address && <p className="text-slate-500">{client.address}</p>}
              <p className="flex items-center gap-2">
                {client.email && <><Mail className="w-3.5 h-3.5 text-[#0D9387]" />{client.email}</>}
                {client.email && client.phone && " • "}
                {client.phone && <><Phone className="w-3.5 h-3.5 text-[#0D9387]" />{client.phone}</>}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4 text-[#0D9387]" />Desglose de Servicios</h3>
              {isEditing && <button onClick={addItem} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0D9387]/10 text-[#0D9387] hover:bg-[#0D9387]/20 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Agregar</button>}
            </div>
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <thead><tr className="bg-[#0F2A4A] text-white"><th className="text-left p-3.5 font-bold uppercase tracking-wider w-12 text-center">#</th><th className="text-left p-3.5 font-bold uppercase tracking-wider">Descripción</th><th className="text-center p-3.5 font-bold uppercase tracking-wider w-20">Cant.</th><th className="text-right p-3.5 font-bold uppercase tracking-wider w-28">Precio Unit.</th><th className="text-right p-3.5 font-bold uppercase tracking-wider w-32">Total</th>{isEditing && <th className="p-3.5 w-10"></th>}</tr></thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {items.map((item, idx) => {
                    const rowTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40">
                        <td className="p-3.5 text-center font-bold text-slate-400 dark:text-zinc-500">{idx + 1}</td>
                        <td className="p-3.5 font-medium text-slate-800 dark:text-zinc-200">{isEditing ? <input value={item.description} onChange={(e) => handleItemChange(idx, "description", e.target.value)} className="w-full p-1 border rounded text-xs" /> : item.description}</td>
                        <td className="p-3.5 text-center font-semibold text-slate-700 dark:text-zinc-300">{isEditing ? <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(idx, "quantity", e.target.value)} className="w-14 p-1 border rounded text-center text-xs" /> : item.quantity}</td>
                        <td className="p-3.5 text-right font-medium text-slate-700 dark:text-zinc-300">{isEditing ? <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)} className="w-24 p-1 border rounded text-right text-xs" /> : formatCurrency(item.unitPrice, invoice.currency)}</td>
                        <td className="p-3.5 text-right font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(rowTotal, invoice.currency)}</td>
                        {isEditing && <td className="p-2 text-center"><button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 p-1 rounded"><Trash2 className="w-3.5 h-3.5" /></button></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2A4A] dark:text-zinc-200 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-[#0D9387]" /> Datos de Pago</h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400"><strong>Métodos:</strong> Transferencia, Tarjeta o Efectivo.</p>
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-[#0D9387] uppercase block">Cuenta Principal</span>
                <p className="font-bold text-slate-800 dark:text-zinc-200">{BANK_INFO.bank}</p>
                <p className="font-mono text-xs">Cta Cte #: <strong>{BANK_INFO.account}</strong></p>
                <p className="text-[11px]">Titular: {BANK_INFO.titular} • RNC: {BANK_INFO.rnc}</p>
              </div>
            </div>
            <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-zinc-700"><span className="font-medium text-slate-600 dark:text-zinc-400">Subtotal</span><span className="font-bold text-slate-800 dark:text-zinc-200 font-mono text-sm">{formatCurrency(rawSubtotal, invoice.currency)}</span></div>
              <div className="flex items-center justify-between pt-2 pb-1 bg-gradient-to-r from-[#0F2A4A] to-[#0D9387] text-white p-3 rounded-xl shadow-md">
                <div><span className="text-xs font-bold uppercase tracking-wider block">Monto Total</span></div>
                <span className="text-xl font-black font-mono tracking-tight">{formatCurrency(rawSubtotal, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#0D9387]" />
            {invoice.notes}
          </div>
        </div>
      </div>
    </div>
  );
}
