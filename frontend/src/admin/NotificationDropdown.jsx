import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, UserPlus, CheckCircle2, XCircle, RotateCcw,
  CreditCard, Plane, UserCheck, RefreshCw, Loader2, X,
} from "lucide-react";
import api from "../lib/api";
import { formatDate } from "../lib/format";

const TYPE_ICONS = {
  new_lead: UserPlus,
  accepted: CheckCircle2,
  rejected: XCircle,
  regret: RotateCcw,
  payment: CreditCard,
  upcoming_trip: Plane,
  assigned: UserCheck,
  converted: RefreshCw,
};

const TYPE_COLORS = {
  new_lead: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
  accepted: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
  rejected: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
  regret: "text-red-500 bg-red-100 dark:bg-red-900/30",
  payment: "text-green-500 bg-green-100 dark:bg-green-900/30",
  upcoming_trip: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
  assigned: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30",
  converted: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30",
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const nav = useNavigate();

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnreadCount(data.count);
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = () => {
    if (!open) {
      fetchAll();
    }
    setOpen(!open);
  };

  const handleClickNotification = async (n) => {
    if (!n.read) {
      try { await api.patch(`/notifications/${n.id}/read`); } catch {}
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.link) nav(n.link);
  };

  const handleMarkAllRead = async () => {
    try { await api.patch("/notifications/read-all"); } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleToggle}
        data-testid="header-notifications-btn"
        className="relative h-9 w-9 rounded-[10px] border border-gray-200 dark:border-[#1A3356] hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[480px] overflow-hidden bg-white dark:bg-[#0F2444] rounded-2xl border border-gray-200 dark:border-[#1A3356] shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-[#1A3356]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Notificaciones
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-medium text-red-500">({unreadCount} sin leer)</span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-gray-400 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Cargando...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-400 dark:text-gray-400">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((n) => {
                  const Icon = TYPE_ICONS[n.type] || Bell;
                  const colorCls = TYPE_COLORS[n.type] || "text-gray-500 bg-gray-100 dark:bg-[#132D52]";
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClickNotification(n)}
                      className={`w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-start gap-3 ${
                        !n.read ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm truncate ${!n.read ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                          )}
                        </div>
                        {n.message && (
                          <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                        <p className="text-[10px] text-gray-400 dark:text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
