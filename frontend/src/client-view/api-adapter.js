// API adapter — uses the real karabu api.js but exposes the interface AI Studio expects
import api from "../lib/api";

export async function getQuotation(id) {
  const res = await api.get(`/quotations/${id}`);
  return res.data;
}

export async function updateQuotationStatus(id, payload) {
  const res = await api.patch(`/quotations/${id}/status`, payload);
  return res.data;
}

/**
 * Sube el comprobante de transferencia del cliente.
 * Registra el pago en Pagos (transferencia, estado pendiente).
 */
export async function uploadReceipt(id, { file, bank, reference }) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("bank", bank || "");
  fd.append("reference", reference || "");
  const res = await api.post(`/quotations/${id}/receipt`, fd);
  return res.data;
}
