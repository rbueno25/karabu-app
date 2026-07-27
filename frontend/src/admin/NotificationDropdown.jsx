import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, UserPlus, CheckCircle2, XCircle, RotateCcw, CreditCard, Plane, UserCheck, RefreshCw, Loader2, X, Sparkles } from "lucide-react";
import api from "../lib/api";
import { formatDate } from "../lib/format";

const TYPE_ICONS = {
  new_lead: UserPlus, accepted: CheckCircle2, rejected: XCircle,
  regret: RotateCcw, payment: CreditCard, upcoming_trip: Plane,
  assigned: UserCheck, converted: RefreshCw,
};

const TYPE_COLORS = {
  new_lead: "text-blue-500 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400",
  accepted: "text-emerald-500 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400",
  rejected: "text-orange-500 bg-orange-100 dark:bg-orange-950/60 dark:text-orange-400",
  regret: "text-red-500 bg-red-100 dark:bg-red-950/60 dark:text-red-400",
  payment: "text-green-500 bg-green-100 dark:bg-green-950/60 dark:text-green-400",
  upcoming_trip: "text-purple-500 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-400",
  assigned: "text-indigo-500 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400",
  converted: "text-cyan-500 bg-cyan-100 dark:bg-cyan-950/60 dark:text-cyan-400",
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const dropdownRef = useRef(null);
  const nav = useNavigate();

  const fetchUnread = useCallback(async () => {
    try { const { data } = await api.get("/notifications/unread-count"); setUnreadCount(data.count); } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get("/notifications"); setNotifications(data); setUnreadCount(data.filter((n) => !n.read).length); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUnread(); const interval = setInterval(fetchUnread, 30000); return () => clearInterval(interval); }, [fetchUnread]);

  useEffect(() => {
    const handleClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = () => { if (!open) fetchAll(); setOpen(!open); };

  const handleClickNotification = async (n) => {
    if (!n.read) { try { await api.patch(`/notifications/${n.id}/read`); } catch {} setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x)); setUnreadCount((c) => Math.max(0, c - 1)); }
    setOpen(false); if (n.link) nav(n.link);
  };

  const handleMarkAllRead = async () => {
    try { await api.patch("/notifications/read-all"); } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); setUnreadCount(0);
  };

  const displayedNotifications = notifications.filter(n => filter === "all" || !n.read);

  return (
    <div ref={dropdownRef} className="relative">
      <button onClick={handleToggle} data-testid="header-notifications-btn" className="relative h-9 w-9 rounded-[10px] border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors" aria-label="Notificaciones" title="Centro de notificaciones">
        <Bell className="h-4 w-4 text-gray-600 dark:text-zinc-300" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none shadow-sm">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {open && (
        <div data-testid="notifications-panel" className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[500px] overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800 space-y-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100">Notificaciones</h3>
                {unreadCount > 0 && <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">{unreadCount} nuevas</span>}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <button onClick={handleMarkAllRead} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline" title="Marcar todas como leídas"><CheckCheck className="h-3.5 w-3.5" />Marcar todas</button>}
                <button onClick={() => setOpen(false)} className="h-7 w-7 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 transition-colors"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/60 rounded-xl">
              <button type="button" onClick={() => setFilter("all")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === "all" ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 shadow-sm" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"}`}>Todas ({notifications.length})</button>
              <button type="button" onClick={() => setFilter("unread")} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === "unread" ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 shadow-sm" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"}`}>Sin leer ({unreadCount})</button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-zinc-800/80">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-gray-400 dark:text-zinc-500"><Loader2 className="h-4 w-4 animate-spin text-teal-500" /><span className="text-xs font-medium">Cargando notificaciones...</span></div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2"><div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500"><Bell className="h-6 w-6" /></div><p className="text-xs font-medium text-gray-500 dark:text-zinc-400">{filter === "unread" ? "No tienes notificaciones sin leer" : "No tienes notificaciones aún"}</p></div>
            ) : (
              displayedNotifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                const colorCls = TYPE_COLORS[n.type] || "text-gray-500 bg-gray-100 dark:bg-zinc-800 dark:text-zinc-300";
                return (
                  <button key={n.id} onClick={() => handleClickNotification(n)} className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors flex items-start gap-3 ${!n.read ? "bg-teal-500/5 dark:bg-teal-500/10" : ""}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2"><p className={`text-xs truncate ${!n.read ? "font-bold text-gray-900 dark:text-zinc-100" : "font-medium text-gray-700 dark:text-zinc-300"}`}>{n.title}</p>{!n.read && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1" />}</div>
                      {n.message && <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-normal">{n.message}</p>}
                      <p className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 mt-1">{formatDate(n.created_at)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
