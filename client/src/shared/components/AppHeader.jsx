// client/src/shared/components/AppHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../lib/auth/AuthContext.jsx";

// Etiqueta legible para el rol
const ROLE_LABEL = {
  ADMIN: "Administrador",
  TEACHER: "Docente",
  STUDENT: "Estudiante",
};

// Iniciales del usuario para el avatar
function getInitials(user) {
  if (!user) return "?";
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || user.email?.[0]?.toUpperCase() || "U";
}

export default function AppHeader() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/login");
  }

  return (
    <>
      <style>{`
        .ah-root {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(8, 12, 20, 0.7);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ah-bar {
          max-width: 1360px;
          margin: 0 auto;
          padding: 0 20px;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Logo */
        .ah-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .ah-logo-icon {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          font-family: 'Space Mono', 'Courier New', monospace;
          box-shadow: 0 2px 10px rgba(37,99,235,0.35);
        }
        .ah-logo-name {
          font-size: 15px;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.01em;
          font-family: 'Space Mono', 'Courier New', monospace;
        }

        .ah-grow { flex: 1; }

        /* Botón login (no autenticado) */
        .ah-login-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(37,99,235,0.15);
          border: 1px solid rgba(37,99,235,0.35);
          border-radius: 9px;
          padding: 7px 16px;
          color: #93c5fd;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          font-family: inherit;
        }
        .ah-login-btn:hover {
          background: rgba(37,99,235,0.25);
          border-color: rgba(59,130,246,0.6);
        }

        /* Contenedor del menú de usuario */
        .ah-user-wrap {
          position: relative;
        }

        /* Botón trigger del menú */
        .ah-user-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 50px;
          padding: 5px 14px 5px 6px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          font-family: inherit;
        }
        .ah-user-btn:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.15);
        }
        .ah-user-btn.open {
          background: rgba(37,99,235,0.12);
          border-color: rgba(59,130,246,0.35);
        }

        /* Avatar con iniciales */
        .ah-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.03em;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.3);
          user-select: none;
        }

        .ah-user-name {
          font-size: 13.5px;
          font-weight: 500;
          color: #cbd5e1;
          white-space: nowrap;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ah-chevron {
          color: #475569;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .ah-chevron.open { transform: rotate(180deg); }

        /* Dropdown */
        .ah-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 240px;
          background: rgba(13, 20, 33, 0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(37,99,235,0.07);
          overflow: hidden;
          opacity: 0;
          transform: translateY(-6px) scale(0.97);
          transform-origin: top right;
          transition: opacity 0.18s ease, transform 0.18s ease;
          pointer-events: none;
        }
        .ah-dropdown.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        /* Cabecera del dropdown */
        .ah-dd-header {
          padding: 16px 18px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ah-dd-fullname {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ah-dd-email {
          font-size: 12px;
          color: #475569;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 8px;
        }
        .ah-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(37,99,235,0.12);
          border: 1px solid rgba(37,99,235,0.25);
          border-radius: 20px;
          padding: 2px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #60a5fa;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Items del dropdown */
        .ah-dd-section {
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .ah-dd-section:last-child { border-bottom: none; }

        .ah-dd-item {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 10px 18px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13.5px;
          color: #94a3b8;
          font-family: inherit;
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .ah-dd-item:hover {
          background: rgba(255,255,255,0.05);
          color: #e2e8f0;
        }
        .ah-dd-item.danger { color: #f87171; }
        .ah-dd-item.danger:hover {
          background: rgba(239,68,68,0.08);
          color: #fca5a5;
        }
        .ah-dd-icon {
          width: 16px; height: 16px;
          flex-shrink: 0;
          opacity: 0.8;
        }
      `}</style>

      <header className="ah-root">
        <div className="ah-bar">
          {/* Logo */}
          <RouterLink to="/" className="ah-logo">
            <div className="ah-logo-icon">L2H</div>
            <span className="ah-logo-name">Lab2hand</span>
          </RouterLink>

          <div className="ah-grow" />

          {/* Sin sesión */}
          {!isAuthenticated && (
            <button className="ah-login-btn" onClick={() => navigate("/login")}>
              <svg
                className="ah-dd-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Iniciar sesión
            </button>
          )}

          {/* Con sesión – botón + menú */}
          {isAuthenticated && (
            <div className="ah-user-wrap" ref={menuRef}>
              <button
                className={`ah-user-btn ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                {/* Ãcono de usuario (solo decorativo, no editable) */}
                <div className="ah-avatar">{getInitials(user)}</div>
                <span className="ah-user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                {/* Chevron */}
                <svg
                  className={`ah-chevron ${menuOpen ? "open" : ""}`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown */}
              <div
                className={`ah-dropdown ${menuOpen ? "open" : ""}`}
                role="menu"
              >
                {/* Info del usuario */}
                <div className="ah-dd-header">
                  <div className="ah-dd-fullname">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="ah-dd-email">{user?.email}</div>
                  <span className="ah-role-badge">
                    {ROLE_LABEL[user?.role] ?? user?.role}
                  </span>
                </div>

                {/* Navegación */}
                <div className="ah-dd-section">
                  <button
                    className="ah-dd-item"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/");
                    }}
                  >
                    <svg
                      className="ah-dd-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Inicio
                  </button>

                  {/* Solo ADMIN */}
                  {user?.role === "ADMIN" && (
                    <button
                      className="ah-dd-item"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/admin/users");
                      }}
                    >
                      <svg
                        className="ah-dd-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Gestión de usuarios
                    </button>
                  )}

                  {/* Solo TEACHER */}
                  {user?.role === "TEACHER" && (
                    <button
                      className="ah-dd-item"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/teacher/courses");
                      }}
                    >
                      <svg
                        className="ah-dd-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Mis cursos
                    </button>
                  )}

                  {/* Solo STUDENT */}
                  {/* Solo STUDENT */}
                  {user?.role === "STUDENT" && (
                    <button
                      className="ah-dd-item"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/student/courses");
                      }}
                    >
                      <svg
                        className="ah-dd-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                      Mis cursos
                    </button>
                  )}
                </div>

                {/* Cerrar sesión */}
                <div className="ah-dd-section">
                  <button
                    className="ah-dd-item danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <svg
                      className="ah-dd-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
