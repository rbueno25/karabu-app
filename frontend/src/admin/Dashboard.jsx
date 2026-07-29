import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import PageHeader from "./PageHeader";
import StatCard from "./StatCard";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { Users, CalendarCheck, FileText, DollarSign, Plane, Loader2, Send, CheckCircle2, TrendingUp, Trophy, MapPin } from "lucide-react";
import { formatCurrency, formatDate } from "../lib/format";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

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
  }, [range]);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando panel…
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      <PageHeader title="Tablero" description="Resumen general de tu operación de viajes." />

      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard testId="stat-clients" title="Clientes" value={data.total_clients} icon={Users}
          hint={`${data.new_clients_month} nuevos este mes`} color="blue" to="/admin/clientes" />
        <StatCard testId="stat-reservations" title="Reservas activas" value={data.active_reservations} icon={CalendarCheck}
          hint="En operación" color="green" to="/admin/reservas" />
        <StatCard testId="stat-income" title="Ingresos del mes" value={formatCurrency(data.monthly_income)} icon={DollarSign}
          hint="Pagos completados" color="amber" to="/admin/pagos" />
        <StatCard testId="stat-quotations" title="Cotizaciones pendientes" value={data.pending_quotations} icon={FileText}
          hint="Por gestionar" color="purple" to="/admin/cotizaciones?status=borrador" />
      </div>

      {/* ── Cotizaciones: Enviadas + Aceptadas + Ventas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link to="/admin/cotizaciones?status=enviada" className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:border-[#0D9387]/30 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-[#0D9387] flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-300">Cotizaciones enviadas</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{data.sent_quotations}</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/cotizaciones?status=aceptada" className="bg-white dark:bg-zinc-900 rounded-2xl border border-green-200 dark:border-green-800 p-5 shadow-sm hover:border-green-400 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-300">Cotizaciones aceptadas</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{data.accepted_quotations}</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/reservas" className="bg-white dark:bg-zinc-900 rounded-2xl border border-orange-200 dark:border-orange-800 p-5 shadow-sm hover:border-orange-400 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-brand-orange flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-300">Ventas del mes</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{data.monthly_sales}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Income Chart + Upcoming Trips ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Ingresos</h3>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">Pagos completados</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            {RANGES.map((r) => (
              <button key={r.key} onClick={() => setRange(r.key)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  range === r.key ? "bg-brand-turquoise text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}>
                {r.label}
              </button>
            ))}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.income_series}>
                <defs>
                  <linearGradient id="areaTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00A896" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00A896" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.15} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #374151", fontSize: 12, background: "#1e293b", color: "#e2e8f0" }}
                  formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="income" stroke="#00A896" fill="url(#areaTeal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Próximos viajes</h3>
            <Plane className="h-4 w-4 text-gray-400 dark:text-gray-400" />
          </div>
          {data.upcoming_trips.length === 0 ? (
            <EmptyState title="Sin viajes próximos" description="Cuando confirmes reservas, aparecerán aquí." icon={Plane} />
          ) : (
            <ul className="space-y-3">
              {data.upcoming_trips.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 dark:border-zinc-800 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.destination}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 truncate">{t.client_name}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 shrink-0">{formatDate(t.departure_date)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Top Destinos + Top Brokers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Destinos */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-brand-turquoise" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Destinos más vendidos</h3>
          </div>
          {data.top_destinations?.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-400 text-center py-6">Aún no hay datos</p>
          ) : (
            <div className="space-y-3">
              {data.top_destinations?.map((d, i) => (
                <div key={d.destination} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-brand-turquoise text-white' :
                    i === 1 ? 'bg-brand-turquoise/20 text-brand-turquoise' :
                    'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">{d.destination}</span>
                    <div className="h-1.5 mt-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-turquoise to-brand-navy rounded-full transition-all"
                        style={{ width: `${(d.count / data.top_destinations[0].count) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 shrink-0">{d.count} cotiz.</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Brokers */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-brand-orange" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Asesores con mejor desempeño</h3>
          </div>
          {data.top_brokers?.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-400 text-center py-6">Aún no hay datos</p>
          ) : (
            <div className="space-y-3">
              {data.top_brokers?.map((b, i) => (
                <div key={b.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-navy to-brand-turquoise text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {b.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">{b.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-400">{b.accepted} propuestas aceptadas</span>
                  </div>
                  {i === 0 && <Trophy className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Reservations Table ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 mt-6 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Reservas recientes</h3>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">Últimas 5 reservas creadas</p>
          </div>
        </div>
        {data.recent_reservations.length === 0 ? (
          <EmptyState title="Aún no hay reservas" description="Crea una cotización y conviértela en reserva." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Destino</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Salida</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_reservations.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">{r.client_name}</td>
                  <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{r.destination}</td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{formatDate(r.departure_date)}</td>
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
