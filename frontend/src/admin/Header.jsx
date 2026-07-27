import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, User, Settings, LogOut, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import Logo from "../components/Logo";

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
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const crumbs = CRUMB_MAP[pathname] || ["Tablero"];
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header data-testid="app-header" className="h-16 border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
        <Logo light={false} showText={false} className="scale-[0.4] origin-left" />
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className="text-gray-300 dark:text-zinc-600">/</span>
            <span className="text-gray-900 dark:text-zinc-100 font-semibold">{c}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={toggle} className="h-9 w-9 rounded-[10px] border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors" aria-label={dark ? "Modo claro" : "Modo oscuro"} title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
          {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-gray-600 dark:text-zinc-400" />}
        </button>

        <NotificationDropdown />

        <div ref={userMenuRef} className="relative pl-3 border-l border-gray-200 dark:border-zinc-800">
          <button type="button" data-testid="header-user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-all outline-none">
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{user?.name || "—"}</div>
              <div className="text-[11px] text-gray-500 dark:text-zinc-400 capitalize">{user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Administrador" : "Asesor"}</div>
            </div>
            <div data-testid="header-user-avatar" className="h-9 w-9 rounded-full bg-blue-600 dark:bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0">{initials}</div>
            <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-zinc-500 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen && (
            <div data-testid="user-profile-menu" className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2.5 border-b border-gray-100 dark:border-zinc-800 mb-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">{user?.name || "Usuario"}</p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">{user?.email || "usuario@karabu.com"}</p>
              </div>
              <div className="space-y-0.5">
                <button type="button" onClick={() => { setUserMenuOpen(false); navigate("/admin/configuracion"); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"><Settings className="h-4 w-4 text-gray-500 dark:text-zinc-400" /><span>Configuración de Cuenta</span></button>
                <button type="button" onClick={() => { toggle(); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-2.5">{dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-gray-500 dark:text-zinc-400" />}<span>Modo {dark ? "Claro" : "Oscuro"}</span></div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500">{dark ? "ON" : "OFF"}</span>
                </button>
                <div className="border-t border-gray-100 dark:border-zinc-800 my-1"></div>
                <button type="button" onClick={handleLogout} data-testid="header-menu-logout-btn" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"><LogOut className="h-4 w-4" /><span>Cerrar Sesión</span></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
