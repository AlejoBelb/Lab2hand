// client/src/pages/teacher/TeacherLayout.jsx

import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext.jsx';

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#080c14', color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        .tl-sidebar {
          min-height: 100vh; flex-shrink: 0;
          background: rgba(13,20,33,0.95);
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          width: 220px; transition: width 0.2s;
          overflow: hidden;
        }
        .tl-sidebar.collapsed { width: 60px; }

        .tl-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .tl-logo-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          background: linear-gradient(135deg, #059669, #047857);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff;
          box-shadow: 0 4px 12px rgba(5,150,105,0.3);
        }
        .tl-logo-text { font-size: 14px; font-weight: 700; color: #f1f5f9; white-space: nowrap; }
        .tl-logo-sub  { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }

        .tl-collapse-btn {
          margin-left: auto; flex-shrink: 0;
          background: none; border: none; cursor: pointer;
          color: #475569; padding: 6px; border-radius: 6px;
          display: flex; align-items: center;
          transition: color 0.15s, background 0.15s;
        }
        .tl-collapse-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.06); }

        .tl-expand-btn {
          flex-shrink: 0; width: 100%; border: none;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: none; cursor: pointer; color: #475569;
          padding: 18px 0;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s, background 0.15s;
        }
        .tl-expand-btn:hover { color: #34d399; background: rgba(5,150,105,0.1); }

        .tl-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
        .tl-nav-label { font-size: 10px; color: #334155; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 8px 4px; white-space: nowrap; }
        .tl-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px;
          color: #64748b; text-decoration: none; font-size: 13.5px;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; overflow: hidden;
        }
        .tl-nav-link svg { flex-shrink: 0; }
        .tl-nav-link:hover  { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .tl-nav-link.active { background: rgba(5,150,105,0.12); color: #34d399; }

        .tl-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .tl-user-row { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; overflow: hidden; }
        .tl-avatar {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #047857, #059669);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
        }
        .tl-user-name { font-size: 12.5px; color: #94a3b8; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tl-logout { background: none; border: none; cursor: pointer; color: #475569; padding: 4px; border-radius: 5px; display: flex; transition: color 0.15s; flex-shrink: 0; }
        .tl-logout:hover { color: #ef4444; }

        .tl-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: auto; }
        .tl-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(13,20,33,0.6);
          backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 10;
        }
        .tl-topbar-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(5,150,105,0.1);
          border: 1px solid rgba(5,150,105,0.25);
          color: #34d399; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .tl-content { flex: 1; padding: 28px; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className={`tl-sidebar${sidebarOpen ? '' : ' collapsed'}`}>

        {sidebarOpen ? (
          <div className="tl-logo">
            <div className="tl-logo-icon">L2H</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="tl-logo-text">Lab2Hand</div>
              <div className="tl-logo-sub">Docente</div>
            </div>
            <button className="tl-collapse-btn" onClick={() => setSidebarOpen(false)} title="Colapsar panel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          </div>
        ) : (
          <button className="tl-expand-btn" onClick={() => setSidebarOpen(true)} title="Expandir panel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}

        <nav className="tl-nav">
          {sidebarOpen && <span className="tl-nav-label">Mi panel</span>}

          <NavLink to="/teacher/courses"
            className={({ isActive }) => `tl-nav-link${isActive ? ' active' : ''}`}
            title={!sidebarOpen ? 'Cursos' : undefined}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            {sidebarOpen && 'Cursos'}
          </NavLink>

          <NavLink to="/teacher/students"
            className={({ isActive }) => `tl-nav-link${isActive ? ' active' : ''}`}
            title={!sidebarOpen ? 'Estudiantes' : undefined}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {sidebarOpen && 'Estudiantes'}
          </NavLink>
        </nav>

        <div className="tl-footer">
          <div className="tl-user-row">
            <div className="tl-avatar">
              {user?.firstName?.[0]?.toUpperCase() || 'D'}
            </div>
            {sidebarOpen && (
              <span className="tl-user-name">
                {user?.firstName || user?.email || 'Docente'}
              </span>
            )}
            <button className="tl-logout" onClick={handleLogout} title="Cerrar sesión">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="tl-main">
        <div className="tl-topbar">
          <span className="tl-topbar-chip">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', boxShadow: '0 0 6px rgba(5,150,105,0.8)' }}/>
            Docente
          </span>
          <span style={{ fontSize: 12, color: '#334155' }}>{user?.email}</span>
        </div>
        <div className="tl-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
