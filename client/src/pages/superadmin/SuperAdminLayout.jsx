// client/src/pages/superadmin/SuperAdminLayout.jsx

import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext.jsx';

const NAV_ITEMS = [
  {
    to: '/superadmin/institutions',
    label: 'Instituciones',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7L12 2 3 7z"/>
      </svg>
    ),
  },
  {
    to: '/superadmin/users',
    label: 'Usuarios',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#07090f',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        /* ── Sidebar ── */
        .sa-sidebar {
          width: 220px; min-height: 100vh; flex-shrink: 0;
          background: rgba(10,14,24,0.98);
          border-right: 1px solid rgba(139,92,246,0.12);
          display: flex; flex-direction: column;
          transition: width 0.2s;
        }
        .sa-sidebar.collapsed { width: 60px; }

        .sa-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 14px 16px;
          border-bottom: 1px solid rgba(139,92,246,0.1);
          overflow: hidden;
        }
        .sa-logo-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff;
          letter-spacing: -0.5px;
          box-shadow: 0 4px 12px rgba(124,58,237,0.35);
        }
        .sa-logo-text {
          font-size: 13.5px; font-weight: 700; color: #f1f5f9;
          white-space: nowrap; overflow: hidden;
          line-height: 1.3;
        }
        .sa-logo-badge {
          display: inline-block;
          font-size: 9px; font-weight: 600;
          background: rgba(139,92,246,0.2);
          color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 4px;
          padding: 1px 5px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .sa-toggle {
          margin-left: auto; flex-shrink: 0;
          background: none; border: none; cursor: pointer;
          color: #475569; padding: 4px; border-radius: 5px;
          transition: color 0.15s, background 0.15s;
        }
        .sa-toggle:hover { color: #94a3b8; background: rgba(255,255,255,0.05); }

        /* Nav */
        .sa-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
        .sa-nav-section {
          font-size: 10px; color: #312e54; text-transform: uppercase;
          letter-spacing: 0.08em; padding: 8px 8px 4px;
          white-space: nowrap; overflow: hidden;
        }
        .sa-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px;
          color: #64748b; text-decoration: none; font-size: 13.5px;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; overflow: hidden;
        }
        .sa-nav-link:hover { background: rgba(139,92,246,0.07); color: #c4b5fd; }
        .sa-nav-link.active {
          background: rgba(139,92,246,0.12);
          color: #a78bfa;
        }
        .sa-nav-link svg { flex-shrink: 0; }

        /* Footer */
        .sa-footer {
          padding: 12px 8px;
          border-top: 1px solid rgba(139,92,246,0.08);
        }
        .sa-user-row {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 10px; border-radius: 8px; overflow: hidden;
        }
        .sa-avatar {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #6d28d9, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
        }
        .sa-user-name {
          font-size: 12.5px; color: #7c3aed; flex: 1;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sa-logout {
          background: none; border: none; cursor: pointer;
          color: #475569; padding: 4px; border-radius: 5px;
          display: flex; transition: color 0.15s; flex-shrink: 0;
        }
        .sa-logout:hover { color: #ef4444; }

        /* Main */
        .sa-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: auto; }
        .sa-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 28px;
          border-bottom: 1px solid rgba(139,92,246,0.08);
          background: rgba(10,14,24,0.7);
          backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 10;
        }
        .sa-topbar-left { display: flex; align-items: center; gap: 10px; }
        .sa-topbar-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(124,58,237,0.25);
          color: #a78bfa; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .sa-topbar-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #7c3aed;
          box-shadow: 0 0 6px rgba(124,58,237,0.8);
        }
        .sa-topbar-title { font-size: 13.5px; color: #64748b; }
        .sa-content { flex: 1; padding: 28px; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className={`sa-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="sa-logo">
          <div className="sa-logo-icon">SA</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div className="sa-logo-text">Lab2Hand</div>
              <div className="sa-logo-badge">Superadmin</div>
            </div>
          )}
          <button className="sa-toggle" onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expandir' : 'Colapsar'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {collapsed
                ? <path d="M9 18l6-6-6-6"/>
                : <path d="M15 18l-6-6 6-6"/>
              }
            </svg>
          </button>
        </div>

        <nav className="sa-nav">
          {!collapsed && <span className="sa-nav-section">Sistema global</span>}
          {NAV_ITEMS.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `sa-nav-link${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}>
              {item.icon}
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sa-footer">
          <div className="sa-user-row">
            <div className="sa-avatar">
              {user?.firstName?.[0]?.toUpperCase() || 'S'}
            </div>
            {!collapsed && (
              <span className="sa-user-name">
                {user?.firstName || user?.email || 'Superadmin'}
              </span>
            )}
            <button className="sa-logout" onClick={handleLogout} title="Cerrar sesión">
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
      <div className="sa-main">
        <div className="sa-topbar">
          <div className="sa-topbar-left">
            <span className="sa-topbar-chip">
              <span className="sa-topbar-dot"/>
              Superadmin
            </span>
            <span className="sa-topbar-title">Vista global del sistema</span>
          </div>
          <span style={{ fontSize: 12, color: '#334155' }}>{user?.email}</span>
        </div>
        <div className="sa-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}