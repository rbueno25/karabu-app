import React, { useEffect, useState } from "react";
import api from "../lib/api";
import PageHeader from "./PageHeader";
import StatCard from "./StatCard";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Users, CalendarCheck, FileText, DollarSign, Plane, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "../lib/format";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const RANGES = [
  { key: "day", label: "Hoy" },
  { key: "7d", label: "7 días" },
  { key: "month", label: "Mes" },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
  { key: "year", label: "Anual" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("6m");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      if (!data) setLoading(true);
      else setRefreshing(true);
      try {
        const { data: newData } = await api.get("/dashboard/stats", { params: { period: range } });
        setData(newData);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando panel…
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      <PageHeader
        title="Tablero"
        description="Resumen general de tu operación de viajes."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          testId="stat-clients"
          title="Clientes"
          value={data.total_clients}
          icon={Users}
          hint={`${data.new_clients_month} nuevos este mes`}
          color="blue"
        />
        <StatCard
          testId="stat-reservations"
          title="Reservas activas"
          value={data.active_reservations}
          icon={CalendarCheck}
          hint="En operación"
          color="green"
        />
        <StatCard
          testId="stat-income"
          title="Ingresos del mes"
          value={formatCurrency(data.monthly_income)}
          icon={DollarSign}
          hint="Pagos completados"
          color="amber"
        />
        <StatCard
          testId="stat-quotations"
          title="Cotizaciones pendientes"
          value={data.pending_quotations}
          icon={FileText}
          hint="Por gestionar"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-8">
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-[16px] border border-gray-200 dark:border-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Ingresos</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pagos completados</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1 text-xs font-medium rounded-[8px] transition-colors ${
                  range === r.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.income_series}>
                <defs>
                  <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #374151", fontSize: 12, background: "#1e293b", color: "#e2e8f0" }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" fill="url(#areaBlue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[16px] border border-gray-200 dark:border-gray-800 p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Próximos viajes</h3>
            <Plane className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          {data.upcoming_trips.length === 0 ? (
            <EmptyState title="Sin viajes próximos" description="Cuando confirmes reservas, aparecerán aquí." icon={Plane} />
          ) : (
            <ul className="space-y-3">
              {data.upcoming_trips.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.destination}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.client_name}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{formatDate(t.departure_date)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[16px] border border-gray-200 dark:border-gray-800 mt-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Reservas recientes</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Últimas 5 reservas creadas</p>
          </div>
        </div>
        {data.recent_reservations.length === 0 ? (
          <EmptyState title="Aún no hay reservas" description="Crea una cotización y conviértela en reserva." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destino</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salida</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_reservations.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">{r.client_name}</td>
                  <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{r.destination}</td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{formatDate(r.departure_date)}</td>
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{formatCurrency(r.total_amount, r.currency)}</td>
                  <td className="px-6 py-3"><StatusBadge value={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
