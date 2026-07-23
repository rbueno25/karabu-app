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
