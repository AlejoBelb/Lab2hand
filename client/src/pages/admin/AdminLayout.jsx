// client/src/pages/admin/AdminLayout.jsx

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext.jsx';
import { listPendingUsers } from '../../lib/api/pending.js';

const NAV_ITEMS = [
  {
    section: 'Administración',
    items: [
      {
        to: '/admin/institutions',
        label: 'Instituciones',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7L12 2 3 7z"/>
          </svg>
        ),
      },
      {
        to: '/admin/pending',
        label: 'Pendientes',
        badge: true,
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        ),
      },
      {
        to: '/admin/users',
        label: 'Usuarios',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
      },
      {
        to: '/admin/courses',
        label: 'Cursos',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
        ),
      },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  // Carga el contador de pendientes al montar y cuando se dispara el evento
  useEffect(() => {
    function refresh() {
      listPendingUsers()
        .then(data => setPendingCount(data.users?.length || 0))
        .catch(() => {});
    }
    refresh();
    window.addEventListener('pending-users-updated', refresh);
    return () => window.removeEventListener('pending-users-updated', refresh);
  }, []);

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#080c14', color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        .adm-sidebar {
          width: 220px; min-height: 100vh; flex-shrink: 0;
          background: rgba(13,20,33,0.95);
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          transition: width 0.2s; overflow: hidden;
        }
        .adm-sidebar.collapsed { width: 60px; }

        .adm-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .adm-logo-icon {
          width: 32px; height: 32px; flex-shrink: 0;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 13px; color: #fff;
        }
        .adm-logo-text { font-size: 14px; font-weight: 700; color: #f1f5f9; white-space: nowrap; }
        .adm-logo-sub  { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }

        .adm-collapse-btn {
          margin-left: auto; flex-shrink: 0;
          background: none; border: none; cursor: pointer;
          color: #475569; padding: 6px; border-radius: 6px;
          display: flex; align-items: center;
          transition: color 0.15s, background 0.15s;
        }
        .adm-collapse-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.06); }

        .adm-expand-btn {
          flex-shrink: 0; width: 100%;
          border: none; border-bottom: 1px solid rgba(255,255,255,0.06);
          background: none; cursor: pointer; color: #475569;
          padding: 20px 0;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s, background 0.15s;
        }
        .adm-expand-btn:hover { color: #60a5fa; background: rgba(37,99,235,0.1); }

        .adm-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
        .adm-nav-label { font-size: 10px; color: #334155; text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 8px 4px; white-space: nowrap; overflow: hidden; }
        .adm-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px;
          color: #64748b; text-decoration: none; font-size: 13.5px;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; overflow: hidden;
        }
        .adm-nav-link:hover  { background: rgba(255,255,255,0.05); color: #cbd5e1; }
        .adm-nav-link.active { background: rgba(37,99,235,0.12); color: #93c5fd; }
        .adm-nav-link svg { flex-shrink: 0; }

        .adm-badge {
          margin-left: auto; flex-shrink: 0;
          background: #ef4444; color: #fff;
          font-size: 10px; font-weight: 700;
          padding: 1px 6px; border-radius: 10px;
          min-width: 18px; text-align: center;
        }

        .adm-sidebar-footer { padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .adm-user-pill { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; overflow: hidden; }
        .adm-avatar {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
        }
        .adm-user-name { font-size: 12.5px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
        .adm-logout-btn { background: none; border: none; color: #475569; cursor: pointer; padding: 4px; border-radius: 5px; display: flex; align-items: center; transition: color 0.15s; flex-shrink: 0; }
        .adm-logout-btn:hover { color: #ef4444; }

        .adm-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: auto; }
        .adm-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(13,20,33,0.6);
          backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 10;
        }
        .adm-topbar-title { font-size: 14px; color: #64748b; font-weight: 500; }
        .adm-content { flex: 1; padding: 28px; }
      `}</style>

      <aside className={`adm-sidebar${sidebarOpen ? '' : ' collapsed'}`}>
        {sidebarOpen ? (
          <div className="adm-logo">
            <div className="adm-logo-icon">L2H</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="adm-logo-text">Lab2Hand</div>
              <div className="adm-logo-sub">Panel Admin</div>
            </div>
            <button className="adm-collapse-btn" onClick={() => setSidebarOpen(false)} title="Colapsar panel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          </div>
        ) : (
          <button className="adm-expand-btn" onClick={() => setSidebarOpen(true)} title="Expandir panel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}

        <nav className="adm-nav">
          {NAV_ITEMS.map(group => (
            <div key={group.section}>
              {sidebarOpen && <span className="adm-nav-label">{group.section}</span>}
              {group.items.map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) => `adm-nav-link${isActive ? ' active' : ''}`}
                  title={!sidebarOpen ? item.label : undefined}>
                  {item.icon}
                  {sidebarOpen && item.label}
                  {sidebarOpen && item.badge && pendingCount > 0 && (
                    <span className="adm-badge">{pendingCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-user-pill">
            <div className="adm-avatar">{user?.firstName?.[0]?.toUpperCase() || 'A'}</div>
            {sidebarOpen && (
              <span className="adm-user-name">{user?.firstName || user?.email || 'Admin'}</span>
            )}
            <button className="adm-logout-btn" onClick={handleLogout} title="Cerrar sesión">
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

      <div className="adm-main">
        <div className="adm-topbar">
          <span className="adm-topbar-title">Panel de administración</span>
          <span style={{ fontSize: 12, color: '#334155' }}>{user?.email}</span>
        </div>
        <div className="adm-content"><Outlet /></div>
      </div>
    </div>
  );
}
