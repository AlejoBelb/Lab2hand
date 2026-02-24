// client/src/pages/student/StudentLayout.jsx

import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext.jsx';

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true); // ← nuevo

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
        .sl-sidebar {
          min-height: 100vh; flex-shrink: 0;
          background: rgba(13,20,33,0.95);
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          width: 220px; transition: width 0.2s;
        }
        .sl-sidebar.collapsed { width: 60px; }
        .sl-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .sl-logo-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff;
          box-shadow: 0 4px 12px rgba(124,58,237,0.3);
        }
        .sl-logo-text { font-size: 14px; font-weight: 700; color: #f1f5f9; white-space: nowrap; }
        .sl-logo-sub { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
        .sl-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
        .sl-nav-label { font-size: 10px; color: #334155; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 8px 4px; white-space: nowrap; overflow: hidden; }
        .sl-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px;
          color: #64748b; text-decoration: none; font-size: 13.5px;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; overflow: hidden;
        }
        .sl-nav-link svg { flex-shrink: 0; }
        .sl-nav-link:hover { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .sl-nav-link.active { background: rgba(124,58,237,0.12); color: #a78bfa; }
        .sl-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.06); }
        .sl-user-row { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; overflow: hidden; }
        .sl-avatar {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #6d28d9, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
        }
        .sl-user-name { font-size: 12.5px; color: #94a3b8; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sl-logout { background: none; border: none; cursor: pointer; color: #475569; padding: 4px; border-radius: 5px; display: flex; transition: color 0.15s; flex-shrink: 0; }
        .sl-logout:hover { color: #ef4444; }
        .sl-toggle-btn {
          background: none; border: none; color: #475569; cursor: pointer;
          padding: 8px; border-radius: 6px; display: flex; align-items: center;
          transition: color 0.15s, background 0.15s;
          margin-left: auto; flex-shrink: 0;
        }
        .sl-toggle-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.05); }
        .sl-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: auto; }
        .sl-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(13,20,33,0.6);
          backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 10;
        }
        .sl-topbar-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.25);
          color: #a78bfa; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .sl-content { flex: 1; padding: 28px; }
      `}</style>

      {/* Sidebar */}
      <aside className={`sl-sidebar${sidebarOpen ? '' : ' collapsed'}`}>
        <div className="sl-logo">
          <div className="sl-logo-icon">L2H</div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div className="sl-logo-text">Lab2Hand</div>
              <div className="sl-logo-sub">Estudiante</div>
            </div>
          )}
          <button className="sl-toggle-btn" onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Colapsar' : 'Expandir'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen
                ? <path d="M15 18l-6-6 6-6"/>
                : <path d="M9 18l6-6-6-6"/>
              }
            </svg>
          </button>
        </div>

        <nav className="sl-nav">
          {sidebarOpen && <span className="sl-nav-label">Mi espacio</span>}
          <NavLink to="/student/courses"
            className={({ isActive }) => `sl-nav-link${isActive ? ' active' : ''}`}
            title={!sidebarOpen ? 'Mis cursos' : undefined}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            {sidebarOpen && 'Mis cursos'}
          </NavLink>
        </nav>

        <div className="sl-footer">
          <div className="sl-user-row">
            <div className="sl-avatar">
              {user?.firstName?.[0]?.toUpperCase() || 'E'}
            </div>
            {sidebarOpen && (
              <span className="sl-user-name">
                {user?.firstName || user?.email || 'Estudiante'}
              </span>
            )}
            <button className="sl-logout" onClick={handleLogout} title="Cerrar sesión">
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

      {/* Main */}
      <div className="sl-main">
        <div className="sl-topbar">
          <span className="sl-topbar-chip">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 6px rgba(124,58,237,0.8)' }}/>
            Estudiante
          </span>
          <span style={{ fontSize: 12, color: '#334155' }}>{user?.email}</span>
        </div>
        <div className="sl-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}