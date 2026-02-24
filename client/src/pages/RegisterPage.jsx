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

    if (!form.institutionId) { setError("Selecciona tu institución"); return; }
    if (form.password !== form.confirmPassword) { setError("Las contraseñas no coinciden"); return; }
    if (form.password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return; }

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

      // Siempre pendiente — nadie entra automáticamente
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  // ── Pantalla de éxito ─────────────────────────────────────────────────

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#080c14", fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        <div style={{
          background: "rgba(13,20,33,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "44px 40px",
          maxWidth: 420, width: "100%", margin: 20,
          textAlign: "center",
          boxShadow: "0 32px 80px -20px rgba(0,0,0,0.7)",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 20px",
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 style={{ color: "#f1f5f9", fontSize: "1.2rem", fontWeight: 700, margin: "0 0 12px" }}>
            Solicitud enviada
          </h2>
          <p style={{ color: "#64748b", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 24px" }}>
            Tu solicitud ha sido enviada. Un administrador revisará tu cuenta y te notificará cuando sea aprobada.
          </p>
          <button onClick={() => navigate("/login")} style={{
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            border: "none", borderRadius: 10, padding: "11px 24px",
            color: "#fff", fontSize: 14, fontWeight: 600,
            fontFamily: "inherit", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          }}>
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  // ── Formulario de registro ────────────────────────────────────────────

  const inputS = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "11px 16px",
    color: "#e2e8f0", fontSize: 14.5,
    fontFamily: "system-ui, -apple-system, sans-serif",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
  };
  const labelS = {
    display: "block", fontSize: 12, fontWeight: 500,
    color: "#94a3b8", marginBottom: 7,
    letterSpacing: "0.05em", textTransform: "uppercase",
  };

  return (
    <>
      <style>{`
        .rp-input:focus {
          border-color: rgba(59,130,246,0.6) !important;
          background: rgba(59,130,246,0.05) !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important;
        }
        .rp-input::placeholder { color: #374151; }
        .rp-role-btn {
          flex: 1; padding: 10px 8px; border-radius: 9px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03); color: #64748b;
        }
        .rp-role-btn.active-student {
          background: rgba(16,185,129,0.12);
          border-color: rgba(16,185,129,0.3);
          color: #34d399;
        }
        .rp-role-btn.active-teacher {
          background: rgba(245,158,11,0.10);
          border-color: rgba(245,158,11,0.3);
          color: #fbbf24;
        }
        .rp-role-btn:hover:not(.active-student):not(.active-teacher) {
          background: rgba(255,255,255,0.06); color: #94a3b8;
        }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#080c14", fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        {/* Orbs decorativos */}
        <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", filter: "blur(90px)", pointerEvents: "none", top: -120, left: -80, background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)" }}/>
        <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", filter: "blur(90px)", pointerEvents: "none", bottom: -100, right: -60, background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)" }}/>
        <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }}/>

        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 440, margin: 20,
          background: "rgba(13,20,33,0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: "40px 36px",
          boxShadow: "0 32px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 14px rgba(37,99,235,0.4)", flexShrink: 0,
            }}>L2H</div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0" }}>Lab2Hand</span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
            Crear cuenta
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 28px" }}>
            Regístrate para acceder a los experimentos
          </p>

          {/* Selector de rol */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelS}>Soy...</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button"
                className={`rp-role-btn${form.role === "STUDENT" ? " active-student" : ""}`}
                onClick={() => setForm(f => ({ ...f, role: "STUDENT" }))}>
                🎓 Estudiante
              </button>
              <button type="button"
                className={`rp-role-btn${form.role === "TEACHER" ? " active-teacher" : ""}`}
                onClick={() => setForm(f => ({ ...f, role: "TEACHER" }))}>
                👨‍🏫 Docente
              </button>
            </div>
            {/* Aviso siempre visible — ambos roles quedan pendientes */}
            <div style={{
              marginTop: 8, padding: "8px 12px",
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.15)",
              borderRadius: 8, fontSize: 12, color: "#fbbf24",
            }}>
              Tu cuenta quedará pendiente de aprobación por un administrador.
            </div>
          </div>

          {/* Selector de institución */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelS}>Institución *</label>
            <select className="rp-input" style={{ ...inputS, cursor: 'pointer' }}
              value={form.institutionId} onChange={set("institutionId")} required disabled={loading}>
              <option value="">Selecciona tu institución...</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
            {institutions.length === 0 && (
              <div style={{ fontSize: 11.5, color: '#475569', marginTop: 5 }}>
                Cargando instituciones...
              </div>
            )}
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 9, padding: "10px 14px", marginBottom: 18,
              color: "#f87171", fontSize: 13.5,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelS}>Nombre *</label>
                <input className="rp-input" style={inputS} type="text" required autoFocus
                  placeholder="Ana" value={form.firstName} onChange={set("firstName")} disabled={loading}/>
              </div>
              <div>
                <label style={labelS}>Apellido *</label>
                <input className="rp-input" style={inputS} type="text" required
                  placeholder="Gómez" value={form.lastName} onChange={set("lastName")} disabled={loading}/>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelS}>Correo electrónico *</label>
              <input className="rp-input" style={inputS} type="email" required
                placeholder="tu@correo.com" value={form.email} onChange={set("email")} disabled={loading}/>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelS}>Contraseña *</label>
              <div style={{ position: "relative" }}>
                <input className="rp-input" style={{ ...inputS, paddingRight: 44 }}
                  type={showPassword ? "text" : "password"} required
                  placeholder="Mínimo 8 caracteres"
                  value={form.password} onChange={set("password")} disabled={loading}/>
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#4b5563", padding: 4,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelS}>Confirmar contraseña *</label>
              <input className="rp-input" style={inputS} type="password" required
                placeholder="Repite tu contraseña"
                value={form.confirmPassword} onChange={set("confirmPassword")} disabled={loading}/>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none", borderRadius: 11, padding: 13,
              color: "#fff", fontSize: 15, fontWeight: 600,
              fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
              opacity: loading ? 0.6 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "opacity 0.2s",
            }}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }}/>
                  Registrando...
                </>
              ) : (
                <>
                  Crear cuenta
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#4b5563" }}>
            ¿Ya tienes cuenta?{" "}
            <a href="/login" onClick={e => { e.preventDefault(); navigate("/login"); }}
              style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}>
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </>
  );
}