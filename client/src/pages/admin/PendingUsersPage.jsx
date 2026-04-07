// client/src/pages/admin/PendingUsersPage.jsx

import { useEffect, useState, useCallback } from 'react';
import { listPendingUsers, approveUser } from '../../lib/api/pending.js';

const ROLE_COLORS = {
  TEACHER: { bg: 'rgba(139,92,246,0.1)',  color: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  STUDENT: { bg: 'rgba(16,185,129,0.08)', color: '#34d399', border: 'rgba(16,185,129,0.18)' },
  ADMIN:   { bg: 'rgba(37,99,235,0.1)',   color: '#60a5fa', border: 'rgba(37,99,235,0.2)' },
};

export default function PendingUsersPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Modal de aprobación
  const [modal, setModal]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await listPendingUsers();
      setUsers(data.users || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openModal(user) {
    setModal(user);
    setSaveError('');
  }

  function closeModal() {
    setModal(null);
    setSaveError('');
  }

  async function handleApprove(e) {
    e.preventDefault();
    setSaving(true); setSaveError('');
    try {
      const role = modal.requestedRole || 'STUDENT';
      await approveUser(modal.id, role);
      window.dispatchEvent(new Event('pending-users-updated'));
      closeModal();
      load();
    } catch (e) { setSaveError(e.message); }
    finally { setSaving(false); }
  }

  const fullName = (u) =>
    u.firstName || u.lastName
      ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
      : null;

  return (
    <div>
      <style>{`
        .pu-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; }
        .pu-title { font-size:1.4rem; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
        .pu-sub { font-size:13px; color:#475569; margin:0; }

        .pu-empty { padding:60px 0; text-align:center; color:#475569; font-size:13px; }
        .pu-empty-icon { font-size:2rem; margin-bottom:10px; }
        .pu-error { padding:12px 16px; margin-bottom:16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:10px; color:#f87171; font-size:13px; }

        .pu-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:14px; }

        .pu-card {
          background:rgba(13,18,30,0.8); border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; padding:20px;
          display:flex; flex-direction:column; gap:14px;
          transition:border-color 0.2s;
        }
        .pu-card:hover { border-color:rgba(37,99,235,0.2); }

        .pu-card-top { display:flex; align-items:center; gap:12px; }
        .pu-avatar {
          width:40px; height:40px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#1d4ed8,#2563eb);
          display:flex; align-items:center; justify-content:center;
          font-size:15px; font-weight:700; color:#fff;
        }
        .pu-name { font-weight:600; color:#f1f5f9; font-size:14px; }
        .pu-email { font-size:12px; color:#475569; margin-top:2px; }

        .pu-institution {
          display:inline-flex; align-items:center; gap:6px;
          font-size:12px; color:#64748b;
          padding:4px 10px; border-radius:6px;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
        }

        .pu-date { font-size:11.5px; color:#334155; }

        .pu-btn-approve {
          width:100%; padding:10px;
          background:linear-gradient(135deg,#2563eb,#1d4ed8);
          border:none; border-radius:9px;
          color:#fff; font-size:13.5px; font-weight:600;
          font-family:inherit; cursor:pointer;
          box-shadow:0 3px 10px rgba(37,99,235,0.25);
          transition:opacity 0.15s, transform 0.15s;
        }
        .pu-btn-approve:hover { opacity:0.88; transform:translateY(-1px); }

        /* Modal */
        .pu-backdrop {
          position:fixed; inset:0;
          background:rgba(0,0,0,0.65); backdrop-filter:blur(5px);
          z-index:200; display:flex; align-items:center; justify-content:center; padding:20px;
        }
        .pu-modal {
          background:#0d1120; border:1px solid rgba(37,99,235,0.2);
          border-radius:16px; width:100%; max-width:420px; padding:28px;
          box-shadow:0 24px 60px rgba(0,0,0,0.6);
        }
        .pu-modal-title { font-size:1.1rem; font-weight:700; color:#f1f5f9; margin:0 0 6px; }
        .pu-modal-sub { font-size:13px; color:#475569; margin:0 0 22px; }
        .pu-modal-err { padding:9px 12px; margin-bottom:14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:8px; color:#f87171; font-size:12.5px; }
        .pu-modal-actions { display:flex; gap:8px; justify-content:flex-end; }
        .pu-btn-cancel { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:9px 18px; color:#94a3b8; font-size:13.5px; font-family:inherit; cursor:pointer; }
        .pu-btn-cancel:hover { background:rgba(255,255,255,0.09); }
        .pu-btn-confirm { background:linear-gradient(135deg,#2563eb,#1d4ed8); border:none; border-radius:8px; padding:9px 22px; color:#fff; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:0 3px 10px rgba(37,99,235,0.3); }
        .pu-btn-confirm:disabled { opacity:0.45; cursor:not-allowed; }
      `}</style>

      {/* Header */}
      <div className="pu-head">
        <div>
          <h1 className="pu-title">Usuarios pendientes</h1>
          <p className="pu-sub">Aprueba el acceso y asigna el rol de cada usuario.</p>
        </div>
      </div>

      {error && <div className="pu-error">{error}</div>}

      {loading ? (
        <div className="pu-empty">Cargando...</div>
      ) : users.length === 0 ? (
        <div className="pu-empty">
          <div className="pu-empty-icon">✅</div>
          No hay usuarios pendientes de aprobación.
        </div>
      ) : (
        <div className="pu-grid">
          {users.map(u => (
            <div className="pu-card" key={u.id}>
              <div className="pu-card-top">
                <div className="pu-avatar">
                  {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                </div>
                <div>
                  <div className="pu-name">
                    {fullName(u) || <em style={{ color: '#475569', fontStyle: 'normal' }}>Sin nombre</em>}
                  </div>
                  <div className="pu-email">{u.email}</div>
                </div>
              </div>

              {u.institution && (
                <span className="pu-institution">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7L12 2 3 7z"/>
                  </svg>
                  {u.institution.name}
                </span>
              )}

              {u.requestedRole && (() => {
                const c = ROLE_COLORS[u.requestedRole] || ROLE_COLORS.STUDENT;
                const label = u.requestedRole === 'TEACHER' ? 'Docente' : 'Estudiante';
                return (
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                    fontSize: 11.5, fontWeight: 500,
                    background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                    alignSelf: 'flex-start',
                  }}>
                    Solicita ser {label}
                  </span>
                );
              })()}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="pu-date">
                  Solicitó el {new Date(u.createdAt).toLocaleDateString('es-CO', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>

              <button className="pu-btn-approve" onClick={() => openModal(u)}>
                Aprobar acceso
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de aprobación */}
      {modal && (() => {
        const roleKey = modal.requestedRole || 'STUDENT';
        const c = ROLE_COLORS[roleKey] || ROLE_COLORS.STUDENT;
        const roleLabel = roleKey === 'TEACHER' ? 'Docente' : 'Estudiante';
        return (
          <div className="pu-backdrop" onClick={closeModal}>
            <div className="pu-modal" onClick={e => e.stopPropagation()}>
              <h3 className="pu-modal-title">Aprobar usuario</h3>
              <p className="pu-modal-sub">
                <strong style={{ color: '#e2e8f0' }}>{fullName(modal) || modal.email}</strong>
                {' '}solicitó acceso como{' '}
                <span style={{ color: c.color, fontWeight: 600 }}>{roleLabel}</span>.
              </p>

              {saveError && <div className="pu-modal-err">{saveError}</div>}

              <div style={{
                padding: '16px', borderRadius: 12, marginBottom: 22, textAlign: 'center',
                background: c.bg, border: `1px solid ${c.border}`,
              }}>
                <span style={{ fontSize: 24 }}>
                  {roleKey === 'TEACHER' ? '📚' : '🎓'}
                </span>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.color, marginTop: 6 }}>
                  {roleLabel}
                </div>
              </div>

              <form onSubmit={handleApprove}>
                <div className="pu-modal-actions">
                  <button type="button" className="pu-btn-cancel" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="pu-btn-confirm" disabled={saving}>
                    {saving ? 'Aprobando...' : 'Aprobar como ' + roleLabel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
