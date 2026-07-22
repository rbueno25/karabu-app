import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Plane, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@karabu.com");
  const [password, setPassword] = useState("admin123");
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
        <div className="flex items-center gap-2 z-10">
          <div className="h-9 w-9 rounded-[10px] bg-white/15 flex items-center justify-center backdrop-blur">
            <Plane className="h-4 w-4" />
          </div>
          <div className="text-lg font-semibold tracking-tight">Karabu Viajes</div>
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
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-8 lg:p-12">
        <form
          onSubmit={submit}
          data-testid="login-form"
          className="w-full max-w-sm space-y-6"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-[10px] bg-blue-600 text-white flex items-center justify-center">
              <Plane className="h-4 w-4" />
            </div>
            <div className="font-semibold text-gray-900">Karabu Viajes</div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-gray-500">Ingresa tus credenciales para acceder al panel.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
              <input
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-[10px] border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <input
                data-testid="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-[10px] border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-shadow"
              />
            </div>
          </div>

          {error ? (
            <div
              data-testid="login-error"
              className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-[10px] px-3 py-2"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit-btn"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors shadow-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Ingresar
          </button>

          <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
            <div className="font-medium text-gray-700 mb-1">Credenciales de prueba</div>
            <div>Admin: <code>admin@karabu.com</code> / <code>admin123</code></div>
            <div>Asesor: <code>asesor@karabu.com</code> / <code>asesor123</code></div>
          </div>
        </form>
      </div>
    </div>
  );
}
