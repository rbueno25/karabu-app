import React from "react";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { useLocation } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

const CRUMB_MAP = {
  "/": ["Tablero"],
  "/clientes": ["Clientes"],
  "/cotizaciones": ["Cotizaciones"],
  "/reservas": ["Reservas"],
  "/pagos": ["Pagos"],
  "/destinos": ["Destinos"],
  "/paquetes": ["Paquetes"],
  "/usuarios": ["Usuarios"],
  "/configuracion": ["Configuración"],
};

export default function Header() {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();
  const crumbs = CRUMB_MAP[pathname] || ["Tablero"];
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <header
      data-testid="app-header"
      className="h-16 border-b border-gray-200 dark:border-[#1A3356] bg-white dark:bg-[#0F2444] dark:bg-opacity-90 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30"
    >
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="text-gray-400 dark:text-gray-400">Karabu</span>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className="text-gray-300 dark:text-gray-300">/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{c}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="h-9 w-9 rounded-[10px] border border-gray-200 dark:border-[#1A3356] hover:bg-gray-50 dark:hover:bg-[#132D52] flex items-center justify-center transition-colors"
          aria-label={dark ? "Modo claro" : "Modo oscuro"}
        >
          {dark ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
        </button>
        <NotificationDropdown />
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-[#1A3356]">
          <div className="text-right leading-tight">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || "—"}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Administrador" : "Asesor"}
            </div>
          </div>
          <div
            data-testid="header-user-avatar"
            className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
