// client/src/pages/loginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const me = await login({ email, password });

      if (me?.role === "SUPERADMIN") {
        navigate("/superadmin");
      } else if (me?.role === "ADMIN") {
        navigate("/admin");
      } else if (me?.role === "TEACHER") {
        navigate("/teacher");
      } else if (me?.role === "STUDENT") {
        navigate("/student");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080c14;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        .login-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .login-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
          top: -120px; left: -80px;
          animation: orbFloat1 12s ease-in-out infinite;
        }
        .login-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%);
          bottom: -100px; right: -60px;
          animation: orbFloat2 15s ease-in-out infinite;
        }
        .login-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
          top: 50%; left: 60%;
          animation: orbFloat1 18s ease-in-out infinite reverse;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 40px); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-25px, -30px); }
        }

        .login-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          margin: 20px;
          background: rgba(13, 20, 33, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 44px 40px;
          box-shadow:
            0 0 0 1px rgba(37, 99, 235, 0.08),
            0 32px 80px -20px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255,255,255,0.06);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .login-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }
        .login-brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.4);
          flex-shrink: 0;
        }
        .login-brand-name {
          font-family: 'Space Mono', monospace;
          font-size: 16px;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.02em;
        }

        .login-heading {
          font-size: 24px;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0 0 6px 0;
          letter-spacing: -0.3px;
          line-height: 1.3;
        }
        .login-subheading {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 32px 0;
        }

        .login-field { margin-bottom: 18px; }
        .login-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 7px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .login-input-wrap { position: relative; }
        .login-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 16px;
          color: #e2e8f0;
          font-size: 14.5px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .login-input:focus {
          border-color: rgba(59,130,246,0.6);
          background: rgba(59,130,246,0.05);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .login-input::placeholder { color: #374151; }
        .login-input-suffix {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #4b5563;
          padding: 4px; display: flex;
          transition: color 0.15s;
        }
        .login-input-suffix:hover { color: #94a3b8; }
        .login-input-has-suffix { padding-right: 44px; }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 9px;
          padding: 10px 14px;
          margin-bottom: 18px;
          color: #f87171;
          font-size: 13.5px;
          animation: errorShake 0.35s ease;
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        .login-submit {
          width: 100%;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border: none;
          border-radius: 11px;
          padding: 13px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(37,99,235,0.35);
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
        }
        .login-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.45);
        }
        .login-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(37,99,235,0.3);
        }
        .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          text-align: center;
          margin-top: 22px;
          font-size: 13px;
          color: #4b5563;
        }
        .login-footer a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .login-footer a:hover { color: #60a5fa; }

        .login-demo-hint {
          margin-top: 20px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 9px;
          font-size: 12px;
          color: #4b5563;
          line-height: 1.6;
        }
        .login-demo-hint code {
          font-family: 'Space Mono', monospace;
          color: #64748b;
          font-size: 11px;
          background: rgba(255,255,255,0.05);
          padding: 1px 5px;
          border-radius: 4px;
        }
      `}</style>

      <div className="login-root">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
        <div className="login-grid" />

        <div className={`login-card ${mounted ? "visible" : ""}`}>
          <div className="login-brand">
            <div className="login-brand-icon">L2H</div>
            <span className="login-brand-name">Lab2hand</span>
          </div>

          <h1 className="login-heading">Iniciar sesión</h1>
          <p className="login-subheading">
            Accede a los experimentos de física
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">
                Correo electrónico
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-email"
                  className="login-input"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="login-password">
                Contraseña
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  className="login-input login-input-has-suffix"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-input-suffix"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Ingresando…
                </>
              ) : (
                <>
                  Ingresar
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {import.meta.env.DEV && (
            <div className="login-demo-hint">
              <strong style={{ color: "#4b5563" }}>Dev:</strong>{" "}
              <code>admin@lab2hand.com</code> / <code>Admin1234!</code>
            </div>
          )}

          <p className="login-footer">
            ¿No tienes cuenta?{" "}
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
