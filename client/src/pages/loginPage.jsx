// client/src/pages/loginPage.jsx

import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext.jsx";

export default function LoginPage() {
  // Estado local del formulario
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin1234!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Auth + navegación
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirección post-login
  const from = location.state?.from?.pathname || "/experiments/bernoulli";

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Email y contraseña son obligatorios");
      }
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.message || "No fue posible iniciar sesión";
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440, paddingTop: "6vh" }}>
      <div className="card" style={{ padding: "20px 18px" }}>
        <h1 style={{ marginBottom: 4 }}>Iniciar sesión</h1>
        <p className="subtitle" style={{ marginBottom: 14 }}>
          Accede con tus credenciales de Lab2hand
        </p>

        {formError && (
          <div
            className="card"
            style={{
              background: "rgba(248,113,113,0.10)",
              borderColor: "rgba(248,113,113,0.45)",
              color: "#fecaca",
              marginBottom: 12,
              padding: 10,
            }}
            role="alert"
          >
            {formError}
          </div>
        )}

        {authError && !formError && (
          <div
            className="card"
            style={{
              background: "rgba(248,113,113,0.10)",
              borderColor: "rgba(248,113,113,0.45)",
              color: "#fecaca",
              marginBottom: 12,
              padding: 10,
            }}
            role="alert"
          >
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Campo email */}
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="login-email" className="small" style={{ display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              id="login-email"
              className="input"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(formError) && !email ? "true" : "false"}
            />
          </div>

          {/* Campo contraseña con “ojo” */}
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="login-password" className="small" style={{ display: "block", marginBottom: 6 }}>
              Contraseña
            </label>
            <div className="input-group">
              <input
                id="login-password"
                className="input"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(formError) && !password ? "true" : "false"}
                aria-describedby="toggle-password-visibility"
              />
              <button
                id="toggle-password-visibility"
                type="button"
                className="input-action"
                onClick={() => setShowPassword((v) => !v)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword ? "true" : "false"}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  /* Ojo abierto */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                       width="18" height="18" aria-hidden="true" focusable="false">
                    <path fill="currentColor"
                          d="M12 5c5.523 0 10 4.477 10 7s-4.477 7-10 7-10-4.477-10-7 4.477-7 10-7Zm0 2C8.134 7 4.828 9.642 3.65 12c1.179 2.358 4.484 5 8.35 5s7.172-2.642 8.35-5C19.172 9.642 15.866 7 12 7Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>
                  </svg>
                ) : (
                  /* Ojo tachado */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                       width="18" height="18" aria-hidden="true" focusable="false">
                    <path fill="currentColor"
                          d="M3.707 2.293 21.707 20.293 20.293 21.707 16.883 18.297C15.423 18.765 13.77 19 12 19 6.477 19 2 14.523 2 12c0-1.098.716-2.698 2.063-4.137l-1.77-1.77 1.414-1.414Zm4.2 4.2C9.113 5.55 10.49 5 12 5c5.523 0 10 4.477 10 7 0 .817-.319 1.91-.98 3.05l-3.4-3.4A5 5 0 0 0 10.943 7.5l-3.036-3.007ZM9.88 11.293a2 2 0 0 0 2.827 2.827l-2.827-2.827Z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
            <Link to="/experiments/bernoulli" className="btn-link" style={{ alignSelf: "center" }}>
              Cancelar
            </Link>
          </div>
        </form>

        <div className="small" style={{ marginTop: 12, color: "#9aa4b2" }}>
          <div>Credenciales de ejemplo: <span className="mono">admin@example.com / Admin1234!</span></div>
        </div>
      </div>
    </div>
  );
}
