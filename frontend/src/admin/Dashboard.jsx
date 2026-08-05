import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import PageHeader from "./PageHeader";
import StatCard from "./StatCard";
import StatusBadge from "./StatusBadge";
import { Users, CalendarCheck, FileText, DollarSign, Loader2, Send, CheckCircle2, TrendingUp, Clock, Target } from "lucide-react";
import { formatCurrency, formatDate } from "../lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data: newData } = await api.get("/dashboard");
      setData(newData);
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-300 py-20 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando panel…
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      <PageHeader title="Tablero" description="Resumen general de tu operación." />

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard testId="stat-quotations" title="Cotizaciones del mes" value={data.total_quotations} icon={FileText}
          hint={`${data.accepted} aceptadas (${data.conversion_rate}%)`} color="blue" to="/admin/cotizaciones" />
        <StatCard testId="stat-pending" title="Pendientes" value={data.pending} icon={Clock}
          hint="Por gestionar" color="amber" to="/admin/cotizaciones?status=borrador" />
        <StatCard testId="stat-revenue" title="Ingresos" value={formatCurrency(data.revenue)} icon={DollarSign}
          hint="Cotizaciones aceptadas" color="green" to="/admin/reservas" />
        <StatCard testId="stat-clients" title="Clientes" value={data.total_clients} icon={Users}
          hint={`${data.new_leads} leads hoy`} color="purple" to="/admin/clientes" />
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link to="/admin/cotizaciones?status=enviada" className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:border-[#0D9387]/30 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9387]/10 text-[#0D9387] flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Enviadas este mes</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{data.total_quotations - data.pending - data.accepted}</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/cotizaciones?status=aceptada" className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 p-5 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Aceptadas</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{data.accepted}</p>
            </div>
          </div>
        </Link>
        <Link to="/admin/cotizaciones?status=borrador" className="bg-white dark:bg-zinc-900 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Tasa de conversión</span>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{data.conversion_rate}%</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Monthly chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[#0D9387]" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cotizaciones por mes</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.monthly_series} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 13, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              labelStyle={{ fontWeight: 600, color: "#111827" }}
            />
            <Legend wrapperStyle={{ paddingTop: 12 }} />
            <Bar dataKey="total" name="Total" fill="#0D9387" radius={[6, 6, 0, 0]} />
            <Bar dataKey="accepted" name="Aceptadas" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#0D9387]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Actividad reciente</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Últimas notificaciones del sistema</p>
        </div>
        {data.recent_activity?.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarCheck className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Sin actividad reciente</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Las notificaciones aparecerán aquí cuando haya acciones de clientes.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {data.recent_activity?.map((n, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    n.type === 'accepted' ? 'bg-emerald-500' :
                    n.type === 'new_lead' ? 'bg-[#0D9387]' :
                    n.type === 'payment' ? 'bg-blue-500' :
                    n.type === 'changes_requested' || n.type === 'rejected' ? 'bg-amber-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{n.message}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{formatDate(n.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
