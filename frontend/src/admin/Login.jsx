import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";

const BG_IMAGE = "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?w=1200";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      nav("/admin");
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-zinc-900">
      {/* Left panel — brand + background */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMAGE})` }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F2A4A]/90 via-[#0F2A4A]/80 to-[#0D9387]/70" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.06)_0%,transparent_60%)]" />

        <div className="z-10">
          <Logo light showText={true} />
        </div>
        <div className="z-10">
          <h2 className="text-4xl font-semibold tracking-tight leading-tight">
            Gestiona tu agencia con precisión.
          </h2>
          <p className="mt-4 text-white/80 text-sm max-w-md leading-relaxed">
            Clientes, cotizaciones, reservas y pagos en un solo panel. Diseñado para
            equipos que trabajan varias horas al día.
          </p>
        </div>
        <div className="text-xs text-white/60 z-10">© {new Date().getFullYear()} Karabu Viajes</div>
      </div>

      {/* Right panel — login form */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <form
          onSubmit={submit}
          data-testid="login-form"
          className="w-full max-w-sm space-y-6"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Logo light={false} showText={true} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ingresa tus credenciales para acceder al panel.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo electrónico</label>
              <input
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  data-testid="login-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 pr-10 text-sm focus:border-[#0D9387] focus:ring-2 focus:ring-[#0D9387]/20 outline-none transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div
              data-testid="login-error"
              className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-[10px] px-3 py-2"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit-btn"
            className="w-full flex items-center justify-center gap-2 bg-[#0D9387] hover:bg-[#0b7d72] disabled:opacity-60 text-white rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors shadow-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
