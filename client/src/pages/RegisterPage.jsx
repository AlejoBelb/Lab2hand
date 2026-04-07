// client/src/pages/RegisterPage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE || "http://127.0.0.1:4001";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
    institutionId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/auth/institutions`)
      .then(r => r.json())
      .then(d => setInstitutions(d.institutions || []))
      .catch(() => {});
  }, []);

  function set(k) { return (e) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim()) { setError("Ingresa tu nombre"); return; }
    if (!form.lastName.trim()) { setError("Ingresa tu apellido"); return; }
    if (!form.institutionId) { setError("Selecciona tu institución"); return; }
    if (!form.email.trim()) { setError("Ingresa tu correo electrónico"); return; }
    if (form.password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return; }
    if (form.password !== form.confirmPassword) { setError("Las contraseñas no coinciden"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
          institutionId: form.institutionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Error al registrarse");

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  // ── Pantalla de éxito ──────────────────────────────────────────────────

  if (success) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
          .rp-success-root {
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
            padding: 60px 16px;
          }
          .rp-success-card {
            width: 100%;
            max-width: 440px;
            background: rgba(13, 20, 33, 0.8);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 20px;
            padding: 40px 36px;
            box-shadow:
              0 0 0 1px rgba(37, 99, 235, 0.06),
              0 32px 80px -20px rgba(0, 0, 0, 0.7),
              inset 0 1px 0 rgba(255,255,255,0.05);
            text-align: center;
          }
          .rp-btn-submit {
            width: 100%;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            border: none;
            border-radius: 12px;
            padding: 14px;
            color: #fff;
            font-size: 15px;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(37,99,235,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
            letter-spacing: 0.01em;
          }
          .rp-btn-submit:hover {
            opacity: 0.92;
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(37,99,235,0.4);
          }
        `}</style>
        <div className="rp-success-root">
          <div className="rp-success-card">
            <div style={{
              width: 60, height: 60, borderRadius: "50%", margin: "0 auto 20px",
              background: "rgba(16,185,129,0.1)",
              border: "2px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ color: "#f1f5f9", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 12px" }}>
              Solicitud enviada
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
              Tu cuenta ha sido creada y está pendiente de aprobación.
              Un administrador revisará tu solicitud y podrás iniciar sesión una vez aprobada.
            </p>
            <button onClick={() => navigate("/login")} className="rp-btn-submit" type="button">
              Ir al inicio de sesión
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Formulario de registro ─────────────────────────────────────────────

  const isStudent = form.role === "STUDENT";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .rp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080c14;
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px 16px;
        }

        /* ── Orbs decorativos ── */
        .rp-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }
        .rp-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%);
          top: -140px; left: -100px;
          animation: rpOrbFloat 14s ease-in-out infinite;
        }
        .rp-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
          bottom: -120px; right: -80px;
          animation: rpOrbFloat 18s ease-in-out infinite reverse;
        }
        @keyframes rpOrbFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(25px, 35px); }
        }

        /* ── Grid sutil ── */
        .rp-grid-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* ── Card principal ── */
        .rp-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
          background: rgba(13, 20, 33, 0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow:
            0 0 0 1px rgba(37, 99, 235, 0.06),
            0 32px 80px -20px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255,255,255,0.05);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .rp-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Brand ── */
        .rp-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }
        .rp-brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          box-shadow: 0 4px 14px rgba(37,99,235,0.4);
          flex-shrink: 0;
          font-family: 'DM Sans', sans-serif;
        }
        .rp-brand-name {
          font-size: 16px; font-weight: 700; color: #e2e8f0;
          letter-spacing: 0.01em;
        }

        /* ── Headings ── */
        .rp-heading {
          font-size: 24px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 6px;
          letter-spacing: -0.4px;
          line-height: 1.3;
        }
        .rp-subheading {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 32px;
          line-height: 1.5;
        }

        /* ── Campos ── */
        .rp-field {
          margin-bottom: 18px;
        }
        .rp-label {
          display: block;
          font-size: 12.5px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 8px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .rp-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          color: #e2e8f0;
          font-size: 14.5px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .rp-input:focus {
          border-color: rgba(59,130,246,0.6);
          background: rgba(59,130,246,0.04);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .rp-input::placeholder {
          color: #475569;
        }
        .rp-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Select / Dropdown ── */
        .rp-select {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          color: #e2e8f0;
          font-size: 14.5px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .rp-select:focus {
          border-color: rgba(59,130,246,0.6);
          background-color: rgba(59,130,246,0.04);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .rp-select option {
          background: #0f1520;
          color: #e2e8f0;
          padding: 10px;
        }
        .rp-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Botones de rol ── */
        .rp-roles {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .rp-role-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          border: 2px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          color: #64748b;
        }
        .rp-role-btn:hover:not(.rp-role-active) {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.12);
          color: #94a3b8;
        }
        .rp-role-btn .rp-role-icon {
          font-size: 18px;
          line-height: 1;
        }
        .rp-role-btn.rp-role-active.rp-role-student {
          background: rgba(16,185,129,0.1);
          border-color: rgba(16,185,129,0.4);
          color: #34d399;
          box-shadow: 0 0 0 1px rgba(16,185,129,0.15), 0 4px 12px rgba(16,185,129,0.1);
        }
        .rp-role-btn.rp-role-active.rp-role-teacher {
          background: rgba(139,92,246,0.1);
          border-color: rgba(139,92,246,0.4);
          color: #a78bfa;
          box-shadow: 0 0 0 1px rgba(139,92,246,0.15), 0 4px 12px rgba(139,92,246,0.1);
        }

        /* ── Alert de info ── */
        .rp-info-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 12px;
          padding: 12px 14px;
          background: rgba(59,130,246,0.06);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 10px;
          font-size: 13px;
          color: #93c5fd;
          line-height: 1.5;
        }
        .rp-info-alert svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ── Alert de error ── */
        .rp-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
          color: #fca5a5;
          font-size: 13.5px;
          line-height: 1.4;
          animation: rpShake 0.35s ease;
        }
        @keyframes rpShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        /* ── Nombre grid ── */
        .rp-name-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 440px) {
          .rp-name-grid { grid-template-columns: 1fr; gap: 0; }
        }

        /* ── Password wrapper ── */
        .rp-pw-wrap {
          position: relative;
        }
        .rp-pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
          border-radius: 4px;
        }
        .rp-pw-toggle:hover { color: #94a3b8; }
        .rp-pw-toggle:focus-visible {
          outline: 2px solid rgba(59,130,246,0.5);
          outline-offset: 2px;
        }

        /* ── Submit ── */
        .rp-btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border: none;
          border-radius: 12px;
          padding: 14px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37,99,235,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        .rp-btn-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.4);
        }
        .rp-btn-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(37,99,235,0.25);
        }
        .rp-btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* ── Spinner ── */
        .rp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rpSpin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes rpSpin { to { transform: rotate(360deg); } }

        /* ── Footer link ── */
        .rp-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13.5px;
          color: #4b5563;
        }
        .rp-footer a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .rp-footer a:hover { color: #60a5fa; }

        /* ── Helper text ── */
        .rp-helper {
          font-size: 12px;
          color: #475569;
          margin-top: 6px;
          line-height: 1.4;
        }

        /* ── Divider ── */
        .rp-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 24px 0;
        }
      `}</style>

      <div className="rp-root">
        <div className="rp-orb rp-orb-1" />
        <div className="rp-orb rp-orb-2" />
        <div className="rp-grid-bg" />

        <div className={`rp-card${mounted ? " visible" : ""}`}>
          {/* Brand */}
          <div className="rp-brand">
            <div className="rp-brand-icon">L2H</div>
            <span className="rp-brand-name">Lab2Hand</span>
          </div>

          <h1 className="rp-heading">Crear cuenta</h1>
          <p className="rp-subheading">
            Regístrate para acceder a los experimentos de física
          </p>

          {/* ── Selector de rol ── */}
          <div className="rp-field">
            <label className="rp-label">Tipo de cuenta</label>
            <div className="rp-roles">
              <button
                type="button"
                className={`rp-role-btn${form.role === "STUDENT" ? " rp-role-active rp-role-student" : ""}`}
                onClick={() => setForm(f => ({ ...f, role: "STUDENT" }))}
                aria-pressed={form.role === "STUDENT"}
              >
                <span className="rp-role-icon">🎓</span>
                Estudiante
              </button>
              <button
                type="button"
                className={`rp-role-btn${form.role === "TEACHER" ? " rp-role-active rp-role-teacher" : ""}`}
                onClick={() => setForm(f => ({ ...f, role: "TEACHER" }))}
                aria-pressed={form.role === "TEACHER"}
              >
                <span className="rp-role-icon">👨‍🏫</span>
                Docente
              </button>
            </div>
            <div className="rp-info-alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Tu cuenta quedará pendiente de aprobación por un administrador antes de poder acceder.</span>
            </div>
          </div>

          {/* ── Institución ── */}
          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-institution">Institución *</label>
            <select
              id="rp-institution"
              className="rp-select"
              value={form.institutionId}
              onChange={set("institutionId")}
              required
              disabled={loading}
            >
              <option value="">Selecciona tu institución...</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
            {institutions.length === 0 && (
              <div className="rp-helper">Cargando instituciones...</div>
            )}
          </div>

          <div className="rp-divider" />

          {/* ── Error ── */}
          {error && (
            <div className="rp-error-alert" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Nombre y Apellido */}
            <div className="rp-name-grid">
              <div className="rp-field">
                <label className="rp-label" htmlFor="rp-fname">Nombre *</label>
                <input
                  id="rp-fname"
                  className="rp-input"
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: Ana María"
                  value={form.firstName}
                  onChange={set("firstName")}
                  disabled={loading}
                />
              </div>
              <div className="rp-field">
                <label className="rp-label" htmlFor="rp-lname">Apellido *</label>
                <input
                  id="rp-lname"
                  className="rp-input"
                  type="text"
                  required
                  placeholder="Ej: Gómez"
                  value={form.lastName}
                  onChange={set("lastName")}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-email">Correo electrónico *</label>
              <input
                id="rp-email"
                className="rp-input"
                type="email"
                required
                placeholder="tu@correo.com"
                value={form.email}
                onChange={set("email")}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* Contraseña */}
            <div className="rp-field">
              <label className="rp-label" htmlFor="rp-password">Contraseña *</label>
              <div className="rp-pw-wrap">
                <input
                  id="rp-password"
                  className="rp-input"
                  style={{ paddingRight: 44 }}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="rp-pw-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              <div className="rp-helper">Usa al menos 8 caracteres con letras y números</div>
            </div>

            {/* Confirmar contraseña */}
            <div className="rp-field" style={{ marginBottom: 26 }}>
              <label className="rp-label" htmlFor="rp-confirm">Confirmar contraseña *</label>
              <input
                id="rp-confirm"
                className="rp-input"
                type="password"
                required
                placeholder="Repite tu contraseña"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button type="submit" className="rp-btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="rp-spinner" />
                  Registrando...
                </>
              ) : (
                <>
                  Crear cuenta
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="rp-footer">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" onClick={e => { e.preventDefault(); navigate("/login"); }}>
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </>
  );
}