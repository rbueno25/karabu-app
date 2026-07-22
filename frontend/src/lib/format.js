export function formatCurrency(amount, currency = "USD") {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

export function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
