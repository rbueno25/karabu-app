// API adapter — uses the real karabu api.js but exposes the interface AI Studio expects
import api from "../lib/api";

export async function getQuotation(id) {
  const res = await api.get(`/quotations/${id}`);
  return res.data;
}

export async function updateQuotation(id, payload) {
  const res = await api.put(`/quotations/${id}`, payload);
  return res.data;
}
