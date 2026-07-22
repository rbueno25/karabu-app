import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarCheck,
  CreditCard,
  MapPin,
  Package,
  UserCog,
  Settings,
  LogOut,
  Plane,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const items = [
  { to: "/admin", label: "Tablero", icon: LayoutDashboard, testId: "sidebar-link-dashboard" },
  { to: "/admin/clientes", label: "Clientes", icon: Users, testId: "sidebar-link-clientes" },
  { to: "/admin/cotizaciones", label: "Cotizaciones", icon: FileText, testId: "sidebar-link-cotizaciones" },
  { to: "/admin/reservas", label: "Reservas", icon: CalendarCheck, testId: "sidebar-link-reservas" },
  { to: "/admin/pagos", label: "Pagos", icon: CreditCard, testId: "sidebar-link-pagos" },
  { to: "/admin/destinos", label: "Destinos", icon: MapPin, testId: "sidebar-link-destinos" },
  { to: "/admin/paquetes", label: "Paquetes", icon: Package, testId: "sidebar-link-paquetes" },
  { to: "/admin/usuarios", label: "Usuarios", icon: UserCog, testId: "sidebar-link-usuarios" },
  { to: "/admin/configuracion", label: "Configuración", icon: Settings, testId: "sidebar-link-configuracion" },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav("/login");
  };

  return (
    <aside
      data-testid="sidebar"
      className="fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col"
    >
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="h-8 w-8 rounded-[10px] bg-blue-600 text-white flex items-center justify-center">
          <Plane className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100">Karabu</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">Viajes</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {items.map(({ to, label, icon: Icon, testId }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            data-testid={testId}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
              ].join(" ")
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          data-testid="sidebar-logout-btn"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
