// client/src/pages/admin/UsersPage.jsx

import { useEffect, useState, useCallback } from 'react';
import {
  listUsers,
  createUser,
  updateUser,
  approveUser,
} from '../../lib/api/users.js';

const ROLES = ['TEACHER', 'STUDENT', 'ADMIN'];
const ROLE_LABELS = { TEACHER: 'Docente', STUDENT: 'Estudiante', ADMIN: 'Admin' };
const ROLE_COLORS = {
  TEACHER:  { bg: 'rgba(139,92,246,0.1)',  color: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  STUDENT:  { bg: 'rgba(16,185,129,0.08)', color: '#34d399', border: 'rgba(16,185,129,0.18)' },
  ADMIN:    { bg: 'rgba(37,99,235,0.1)',   color: '#60a5fa', border: 'rgba(37,99,235,0.2)' },
};

// ── Sub-componentes ────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.STUDENT;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function StatusBadge({ isActive, pendingApproval }) {
  if (pendingApproval) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
      background: 'rgba(245,158,11,0.1)', color: '#fbbf24',
      border: '1px solid rgba(245,158,11,0.2)',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
      Pendiente
    </span>
  );
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
      background: isActive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
      color: isActive ? '#34d399' : '#f87171',
      border: `1px solid ${isActive ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.15)'}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

// ── Página principal ───────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Filtros
  const [search, setSearch]           = useState('');
  const [filterRole, setFilterRole]   = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [page, setPage]               = useState(1);

  // Aprobación
  const [approvingId, setApprovingId] = useState(null);

  // Modal crear
  const [showCreate, setShowCreate]   = useState(false);
  const [createForm, setCreateForm]   = useState({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT' });
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  // Modal editar
  const [editModal, setEditModal]   = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError]   = useState('');

  // ── Carga ──────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const isActive = filterActive === 'true' ? true : filterActive === 'false' ? false : undefined;
      const data = await listUsers({
        page, pageSize: 15,
        role: filterRole || undefined,
        isActive,
        search: search || undefined,
      });
      setUsers(data.items || []);
      setPagination({ page: data.page, total: data.total, totalPages: data.totalPages });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, filterRole, filterActive, search]);

  useEffect(() => { load(); }, [load]);

  // Pendientes — extraídos de la lista principal
  const pendingUsers = users.filter(u => u.pendingApproval);

  // ── Filtros ────────────────────────────────────────────────────────────

  function handleSearch(val)       { setSearch(val);      setPage(1); }
  function handleFilterRole(val)   { setFilterRole(val);  setPage(1); }
  function handleFilterActive(val) { setFilterActive(val); setPage(1); }

  // ── Aprobar usuario (estudiante o docente) ─────────────────────────────

  async function handleApprove(userId, role) {
    setApprovingId(`${userId}-${role}`);
    try {
      await approveUser(userId, role);
      await load();
    } catch (e) { alert(e.message); }
    finally { setApprovingId(null); }
  }

  // ── Crear usuario ──────────────────────────────────────────────────────

  function openCreate() {
    setCreateForm({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT' });
    setCreateError('');
    setShowCreate(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!createForm.email || !createForm.password) { setCreateError('Email y contraseña son obligatorios'); return; }
    setCreateSaving(true); setCreateError('');
    try {
      await createUser(createForm);
      setShowCreate(false); setPage(1); load();
    } catch (e) { setCreateError(e.message); }
    finally { setCreateSaving(false); }
  }

  // ── Editar usuario ─────────────────────────────────────────────────────

  function openEdit(u) {
    setEditModal(u);
    setEditForm({ firstName: u.firstName || '', lastName: u.lastName || '', role: u.role, isActive: u.isActive });
    setEditError('');
  }

  async function handleEdit(e) {
    e.preventDefault();
    setEditSaving(true); setEditError('');
    try {
      await updateUser(editModal.id, editForm);
      setEditModal(null); load();
    } catch (e) { setEditError(e.message); }
    finally { setEditSaving(false); }
  }

  // ── Activar / Desactivar ───────────────────────────────────────────────

  async function handleToggleActive(u) {
    try { await updateUser(u.id, { isActive: !u.isActive }); load(); }
    catch (e) { alert(e.message); }
  }

  // ─────────────────────────────────────────────────────────────────────

  return (
    <div>
      <style>{`
        .up-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
        .up-title { font-size:1.4rem; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
        .up-sub { font-size:13px; color:#475569; margin:0; }
        .up-pending-banner { margin-bottom:20px; background:rgba(245,158,11,0.07); border:1px solid rgba(245,158,11,0.2); border-radius:12px; overflow:hidden; }
        .up-pending-head { display:flex; align-items:center; gap:8px; padding:12px 18px; border-bottom:1px solid rgba(245,158,11,0.12); }
        .up-pending-title { font-size:13px; font-weight:600; color:#fbbf24; }
        .up-pending-count { font-size:11px; background:rgba(245,158,11,0.2); color:#fbbf24; padding:1px 7px; border-radius:10px; }
        .up-pending-row { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; gap:12px; border-bottom:1px solid rgba(245,158,11,0.08); flex-wrap:wrap; }
        .up-pending-row:last-child { border-bottom:none; }
        .up-pending-info { font-size:13px; color:#e2e8f0; }
        .up-pending-email { font-size:11.5px; color:#64748b; margin-top:1px; }
        .up-pending-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .up-filters { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .up-search-wrap { position:relative; flex:1; min-width:180px; max-width:300px; }
        .up-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#475569; pointer-events:none; }
        .up-search { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px 8px 32px; color:#e2e8f0; font-size:13.5px; font-family:inherit; outline:none; }
        .up-select { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px; color:#e2e8f0; font-size:13px; font-family:inherit; outline:none; cursor:pointer; }
        .up-card { background:rgba(13,20,33,0.75); border:1px solid rgba(255,255,255,0.08); border-radius:14px; overflow:hidden; }
        .up-table { width:100%; border-collapse:collapse; }
        .up-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.01); }
        .up-table td { padding:12px 16px; font-size:13.5px; color:#cbd5e1; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
        .up-table tr:last-child td { border-bottom:none; }
        .up-table tr:hover td { background:rgba(255,255,255,0.015); }
        .up-name { font-weight:500; color:#f1f5f9; }
        .up-email { font-size:12px; color:#475569; margin-top:2px; }
        .up-row-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .up-btn-sm { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 11px; font-size:12px; color:#94a3b8; font-family:inherit; cursor:pointer; transition:background 0.15s,color 0.15s; white-space:nowrap; }
        .up-btn-sm:hover { background:rgba(255,255,255,0.09); color:#e2e8f0; }
        .up-btn-sm:disabled { opacity:0.4; cursor:not-allowed; }
        .up-btn-sm.danger:hover { background:rgba(239,68,68,0.1); color:#f87171; border-color:rgba(239,68,68,0.2); }
        .up-btn-sm.success { color:#34d399; border-color:rgba(16,185,129,0.2); }
        .up-btn-sm.success:hover { background:rgba(16,185,129,0.1); }
        .up-btn-sm.purple { color:#a78bfa; border-color:rgba(139,92,246,0.2); }
        .up-btn-sm.purple:hover { background:rgba(139,92,246,0.1); }
        .up-pagination { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid rgba(255,255,255,0.06); font-size:12.5px; color:#475569; }
        .up-page-btns { display:flex; gap:4px; }
        .up-page-btn { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 11px; font-size:12.5px; color:#64748b; font-family:inherit; cursor:pointer; transition:background 0.15s,color 0.15s; }
        .up-page-btn:hover:not(:disabled) { background:rgba(255,255,255,0.09); color:#e2e8f0; }
        .up-page-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .up-page-btn.active { background:rgba(37,99,235,0.15); color:#60a5fa; border-color:rgba(37,99,235,0.3); }
        .up-state { padding:48px 0; text-align:center; color:#475569; font-size:13px; }
        .up-error { padding:12px 16px; margin-bottom:16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:10px; color:#f87171; font-size:13px; }
        .up-btn-create { background:linear-gradient(135deg,#2563eb,#1d4ed8); border:none; border-radius:9px; padding:9px 18px; color:#fff; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:0 3px 10px rgba(37,99,235,0.3); display:flex; align-items:center; gap:7px; transition:opacity 0.15s; }
        .up-btn-create:hover { opacity:0.88; }
        .up-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; }
        .up-modal { background:#0f1520; border:1px solid rgba(255,255,255,0.1); border-radius:16px; width:100%; max-width:460px; padding:28px; box-shadow:0 24px 60px rgba(0,0,0,0.5); max-height:90vh; overflow-y:auto; }
        .up-modal h3 { font-size:1.1rem; font-weight:700; color:#f1f5f9; margin:0 0 20px; }
        .up-modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .up-modal-field { display:flex; flex-direction:column; gap:6px; }
        .up-modal-field.full { grid-column:1/-1; }
        .up-modal-label { font-size:11.5px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; }
        .up-modal-input { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:9px 12px; color:#e2e8f0; font-size:13.5px; font-family:inherit; outline:none; }
        .up-modal-select { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:9px 12px; color:#e2e8f0; font-size:13.5px; font-family:inherit; outline:none; cursor:pointer; }
        .up-modal-err { padding:10px 12px; margin-bottom:14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:8px; color:#f87171; font-size:12.5px; }
        .up-modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }
        .up-btn-cancel { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:9px 18px; color:#94a3b8; font-size:13.5px; font-family:inherit; cursor:pointer; }
        .up-btn-cancel:hover { background:rgba(255,255,255,0.09); }
        .up-btn-save { background:linear-gradient(135deg,#2563eb,#1d4ed8); border:none; border-radius:8px; padding:9px 20px; color:#fff; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:0 3px 10px rgba(37,99,235,0.3); }
        .up-btn-save:hover:not(:disabled) { opacity:0.88; }
        .up-btn-save:disabled { opacity:0.45; cursor:not-allowed; }
        .up-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:9px 12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:8px; }
        .up-toggle-lbl { font-size:13px; color:#94a3b8; }
        .up-toggle { position:relative; width:38px; height:21px; cursor:pointer; }
        .up-toggle input { opacity:0; width:0; height:0; }
        .up-toggle-sl { position:absolute; inset:0; background:rgba(255,255,255,0.1); border-radius:21px; transition:background 0.2s; }
        .up-toggle-sl::before { content:''; position:absolute; width:15px; height:15px; left:3px; top:3px; background:#fff; border-radius:50%; transition:transform 0.2s; }
        .up-toggle input:checked + .up-toggle-sl { background:#2563eb; }
        .up-toggle input:checked + .up-toggle-sl::before { transform:translateX(17px); }
      `}</style>

      {/* ── Header ── */}
      <div className="up-head">
        <div>
          <h1 className="up-title">Usuarios</h1>
          <p className="up-sub">Gestiona y aprueba los usuarios de tu institución.</p>
        </div>
        <button className="up-btn-create" onClick={openCreate}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* ── Banner usuarios pendientes ── */}
      {pendingUsers.length > 0 && (
        <div className="up-pending-banner">
          <div className="up-pending-head">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="up-pending-title">Usuarios pendientes de aprobación</span>
            <span className="up-pending-count">{pendingUsers.length}</span>
          </div>
          {pendingUsers.map(p => (
            <div key={p.id} className="up-pending-row">
              <div>
                <div className="up-pending-info">
                  {p.firstName || p.lastName
                    ? `${p.firstName || ''} ${p.lastName || ''}`.trim()
                    : <em style={{ color: '#475569' }}>Sin nombre</em>
                  }
                </div>
                <div className="up-pending-email">{p.email}</div>
              </div>
              <div className="up-pending-actions">
                <button
                  className="up-btn-sm success"
                  disabled={!!approvingId}
                  onClick={() => handleApprove(p.id, 'STUDENT')}
                >
                  {approvingId === `${p.id}-STUDENT` ? 'Aprobando...' : '✓ Estudiante'}
                </button>
                <button
                  className="up-btn-sm purple"
                  disabled={!!approvingId}
                  onClick={() => handleApprove(p.id, 'TEACHER')}
                >
                  {approvingId === `${p.id}-TEACHER` ? 'Aprobando...' : '✓ Docente'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="up-filters">
        <div className="up-search-wrap">
          <span className="up-search-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input className="up-search" type="text" placeholder="Buscar por nombre o email..."
            value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <select className="up-select" value={filterRole} onChange={e => handleFilterRole(e.target.value)}>
          <option value="">Todos los roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select className="up-select" value={filterActive} onChange={e => handleFilterActive(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos / Pendientes</option>
        </select>
      </div>

      {error && <div className="up-error">{error}</div>}

      {/* ── Tabla ── */}
      <div className="up-card">
        {loading ? (
          <div className="up-state">Cargando...</div>
        ) : users.length === 0 ? (
          <div className="up-state">No se encontraron usuarios con estos filtros.</div>
        ) : (
          <>
            <table className="up-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="up-name">
                        {u.firstName || u.lastName
                          ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                          : <em style={{ color: '#475569', fontStyle: 'normal' }}>Sin nombre</em>
                        }
                      </div>
                      <div className="up-email">{u.email}</div>
                    </td>
                    <td><RoleBadge role={u.role} /></td>
                    <td>
                      <StatusBadge isActive={u.isActive} pendingApproval={u.pendingApproval} />
                    </td>
                    <td style={{ fontSize: 12, color: '#475569' }}>
                      {new Date(u.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="up-row-actions">
                        {u.pendingApproval ? (
                          <>
                            <button className="up-btn-sm success" disabled={!!approvingId}
                              onClick={() => handleApprove(u.id, 'STUDENT')}>
                              {approvingId === `${u.id}-STUDENT` ? '...' : '✓ Estudiante'}
                            </button>
                            <button className="up-btn-sm purple" disabled={!!approvingId}
                              onClick={() => handleApprove(u.id, 'TEACHER')}>
                              {approvingId === `${u.id}-TEACHER` ? '...' : '✓ Docente'}
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="up-btn-sm" onClick={() => openEdit(u)}>Editar</button>
                            <button
                              className={`up-btn-sm ${u.isActive ? 'danger' : 'success'}`}
                              onClick={() => handleToggleActive(u)}>
                              {u.isActive ? 'Desactivar' : 'Activar'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="up-pagination">
              <span>{pagination.total} usuario{pagination.total !== 1 ? 's' : ''}</span>
              <div className="up-page-btns">
                <button className="up-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Anterior</button>
                <button className="up-page-btn active" disabled>{page} / {pagination.totalPages}</button>
                <button className="up-page-btn" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Siguiente ›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modal crear usuario ── */}
      {showCreate && (
        <div className="up-modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="up-modal" onClick={e => e.stopPropagation()}>
            <h3>Nuevo usuario</h3>
            {createError && <div className="up-modal-err">{createError}</div>}
            <form onSubmit={handleCreate}>
              <div className="up-modal-grid">
                <div className="up-modal-field">
                  <label className="up-modal-label">Nombre</label>
                  <input className="up-modal-input" type="text" placeholder="Nombre"
                    value={createForm.firstName}
                    onChange={e => setCreateForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div className="up-modal-field">
                  <label className="up-modal-label">Apellido</label>
                  <input className="up-modal-input" type="text" placeholder="Apellido"
                    value={createForm.lastName}
                    onChange={e => setCreateForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
                <div className="up-modal-field full">
                  <label className="up-modal-label">Email *</label>
                  <input className="up-modal-input" type="email" placeholder="correo@ejemplo.com"
                    value={createForm.email} required
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="up-modal-field full">
                  <label className="up-modal-label">Contraseña *</label>
                  <input className="up-modal-input" type="password" placeholder="Mínimo 8 caracteres"
                    value={createForm.password} required
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div className="up-modal-field full">
                  <label className="up-modal-label">Rol *</label>
                  <select className="up-modal-select" value={createForm.role}
                    onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="STUDENT">Estudiante</option>
                    <option value="TEACHER">Docente</option>
                  </select>
                </div>
              </div>
              <div className="up-modal-actions">
                <button type="button" className="up-btn-cancel" onClick={() => setShowCreate(false)}>Cancelar</button>
                <button type="submit" className="up-btn-save" disabled={createSaving}>
                  {createSaving ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal editar usuario ── */}
      {editModal && (
        <div className="up-modal-backdrop" onClick={() => setEditModal(null)}>
          <div className="up-modal" onClick={e => e.stopPropagation()}>
            <h3>Editar usuario</h3>
            <p style={{ fontSize: 12, color: '#475569', margin: '-12px 0 18px' }}>{editModal.email}</p>
            {editError && <div className="up-modal-err">{editError}</div>}
            <form onSubmit={handleEdit}>
              <div className="up-modal-grid">
                <div className="up-modal-field">
                  <label className="up-modal-label">Nombre</label>
                  <input className="up-modal-input" type="text"
                    value={editForm.firstName}
                    onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div className="up-modal-field">
                  <label className="up-modal-label">Apellido</label>
                  <input className="up-modal-input" type="text"
                    value={editForm.lastName}
                    onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
                <div className="up-modal-field full">
                  <label className="up-modal-label">Rol</label>
                  <select className="up-modal-select" value={editForm.role}
                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div className="up-modal-field full">
                  <div className="up-toggle-row">
                    <span className="up-toggle-lbl">Cuenta activa</span>
                    <label className="up-toggle">
                      <input type="checkbox" checked={editForm.isActive}
                        onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))} />
                      <span className="up-toggle-sl" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="up-modal-actions">
                <button type="button" className="up-btn-cancel" onClick={() => setEditModal(null)}>Cancelar</button>
                <button type="submit" className="up-btn-save" disabled={editSaving}>
                  {editSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}