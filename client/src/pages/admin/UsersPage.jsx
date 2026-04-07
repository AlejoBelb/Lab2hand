// client/src/pages/admin/UsersPage.jsx
// Página unificada de usuarios — reemplaza SAUsersPage y la anterior UsersPage

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../lib/auth/AuthContext.jsx';
import { listInstitutions } from '../../lib/api/institutions.js';
import {
  listUsers,
  createUser,
  updateUser,
  assignAdmin,
} from '../../lib/api/users.js';

const ALL_ROLES     = ['ADMIN', 'TEACHER', 'STUDENT'];
const CREATABLE_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'];
const ROLE_LABELS   = { ADMIN: 'Admin', TEACHER: 'Docente', STUDENT: 'Estudiante' };
const ROLE_COLORS   = {
  ADMIN:   { bg: 'rgba(37,99,235,0.1)',   color: '#60a5fa', border: 'rgba(37,99,235,0.2)' },
  TEACHER: { bg: 'rgba(139,92,246,0.1)',  color: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  STUDENT: { bg: 'rgba(16,185,129,0.08)', color: '#34d399', border: 'rgba(16,185,129,0.18)' },
};

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
  const color  = pendingApproval ? '#fbbf24' : isActive ? '#34d399' : '#f87171';
  const bg     = pendingApproval ? 'rgba(245,158,11,0.1)' : isActive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)';
  const border = pendingApproval ? 'rgba(245,158,11,0.2)' : isActive ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.15)';
  const label  = pendingApproval ? 'Pendiente' : isActive ? 'Activo' : 'Inactivo';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
      background: bg, color, border: `1px solid ${border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>
      {label}
    </span>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [institutions, setInstitutions] = useState([]);

  // Filtros
  const [search, setSearch]                   = useState('');
  const [filterRole, setFilterRole]           = useState('');
  const [filterActive, setFilterActive]       = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');
  const [page, setPage]                       = useState(1);

  // Modal crear
  const [showCreate, setShowCreate]   = useState(false);
  const [createForm, setCreateForm]   = useState({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT', institutionId: '' });
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  // Modal editar
  const [editModal, setEditModal]   = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError]   = useState('');

  // Modal hacer admin
  const [assignModal, setAssignModal]           = useState(null);
  const [assignInstitution, setAssignInstitution] = useState('');
  const [assignSaving, setAssignSaving]         = useState(false);
  const [assignError, setAssignError]           = useState('');

  // ── Carga ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const isActive = filterActive === 'true' ? true : filterActive === 'false' ? false : undefined;
      const data = await listUsers({
        page, pageSize: 15,
        role: filterRole || undefined,
        isActive,
        search: search || undefined,
        institutionId: filterInstitution || undefined,
      });
      setUsers(data.items || []);
      setPagination({ page: data.page, total: data.total, totalPages: data.totalPages });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, filterRole, filterActive, search, filterInstitution]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    listInstitutions().then(d => setInstitutions(d.institutions || [])).catch(() => {});
  }, []);

  function resetPage(fn) { return (...args) => { fn(...args); setPage(1); }; }

  // ── Crear ──────────────────────────────────────────────────────────────────

  function openCreate() {
    setCreateForm({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT', institutionId: '' });
    setCreateError(''); setShowCreate(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!createForm.email || !createForm.password) { setCreateError('Email y contraseña son obligatorios'); return; }
    setCreateSaving(true); setCreateError('');
    try {
      await createUser({ ...createForm, institutionId: createForm.institutionId || undefined });
      setShowCreate(false); setPage(1); load();
    } catch (e) { setCreateError(e.message); }
    finally { setCreateSaving(false); }
  }

  // ── Editar ─────────────────────────────────────────────────────────────────

  function openEdit(u) {
    setEditModal(u);
    setEditForm({ firstName: u.firstName || '', lastName: u.lastName || '', role: u.role, isActive: u.isActive, institutionId: u.institutionId || '' });
    setEditError('');
  }

  async function handleEdit(e) {
    e.preventDefault();
    setEditSaving(true); setEditError('');
    try {
      await updateUser(editModal.id, { ...editForm, institutionId: editForm.institutionId || null });
      window.dispatchEvent(new Event('pending-users-updated'));
      setEditModal(null); load();
    } catch (e) { setEditError(e.message); }
    finally { setEditSaving(false); }
  }

  // ── Hacer admin ────────────────────────────────────────────────────────────

  function openAssign(u) {
    setAssignModal(u); setAssignInstitution(u.institutionId || ''); setAssignError('');
  }

  async function handleAssign(e) {
    e.preventDefault();
    setAssignSaving(true); setAssignError('');
    try {
      await assignAdmin({ userId: assignModal.id, institutionId: assignInstitution || null });
      setAssignModal(null); load();
    } catch (e) { setAssignError(e.message); }
    finally { setAssignSaving(false); }
  }

  async function handleToggleActive(u) {
    try {
      await updateUser(u.id, { isActive: !u.isActive });
      window.dispatchEvent(new Event('pending-users-updated'));
      load();
    } catch (e) { alert(e.message); }
  }

  // ── Estilos ────────────────────────────────────────────────────────────────

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8, padding: '9px 12px', color: '#e2e8f0',
    fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };
  const selectStyle  = { ...inputStyle, cursor: 'pointer', background: '#0f1829', colorScheme: 'dark' };
  const labelStyle   = { display: 'block', fontSize: 11.5, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 };
  const backdropStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
  const modalStyle   = { background: '#0d1120', border: '1px solid rgba(37,99,235,0.18)', borderRadius: 16, width: '100%', maxWidth: 480, padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' };
  const btnPrimary   = { background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: 'none', borderRadius: 9, padding: '9px 18px', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 3px 12px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: 7 };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <style>{`
        .up-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
        .up-title { font-size:1.4rem; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
        .up-sub { font-size:13px; color:#475569; margin:0; }
        .up-filters { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .up-search-wrap { position:relative; flex:1; min-width:180px; max-width:280px; }
        .up-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#475569; pointer-events:none; }
        .up-search { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px 8px 32px; color:#e2e8f0; font-size:13.5px; font-family:inherit; outline:none; }
        .up-select { background:#0f1829; border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px; color:#e2e8f0; font-size:13px; font-family:inherit; outline:none; cursor:pointer; color-scheme:dark; }
        .up-card { background:rgba(13,18,30,0.8); border:1px solid rgba(37,99,235,0.1); border-radius:14px; overflow:hidden; }
        .up-table { width:100%; border-collapse:collapse; }
        .up-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(37,99,235,0.08); background:rgba(255,255,255,0.01); }
        .up-table td { padding:12px 16px; font-size:13.5px; color:#cbd5e1; border-bottom:1px solid rgba(255,255,255,0.03); vertical-align:middle; }
        .up-table tr:last-child td { border-bottom:none; }
        .up-table tr:hover td { background:rgba(37,99,235,0.02); }
        .up-name { font-weight:500; color:#f1f5f9; }
        .up-email { font-size:12px; color:#475569; margin-top:2px; }
        .up-inst { font-size:12px; color:#3b82f6; }
        .up-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .up-btn-sm { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 10px; font-size:11.5px; color:#94a3b8; font-family:inherit; cursor:pointer; transition:background 0.15s,color 0.15s; white-space:nowrap; }
        .up-btn-sm:hover { background:rgba(255,255,255,0.09); color:#e2e8f0; }
        .up-btn-sm.blue:hover { background:rgba(37,99,235,0.12); color:#93c5fd; border-color:rgba(37,99,235,0.25); }
        .up-btn-sm.danger { background:rgba(239,68,68,0.07); border-color:rgba(239,68,68,0.15); color:#f87171; }
        .up-btn-sm.danger:hover { background:rgba(239,68,68,0.14); }
        .up-btn-sm.success:hover { background:rgba(16,185,129,0.1); color:#34d399; border-color:rgba(16,185,129,0.2); }
        .up-pagination { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid rgba(37,99,235,0.08); font-size:12.5px; color:#475569; }
        .up-page-btns { display:flex; gap:4px; }
        .up-page-btn { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 11px; font-size:12.5px; color:#64748b; font-family:inherit; cursor:pointer; }
        .up-page-btn:hover:not(:disabled) { background:rgba(255,255,255,0.09); color:#e2e8f0; }
        .up-page-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .up-page-btn.cur { background:rgba(37,99,235,0.15); color:#93c5fd; border-color:rgba(37,99,235,0.3); }
        .up-state { padding:48px 0; text-align:center; color:#475569; font-size:13px; }
        .up-error { padding:12px 16px; margin-bottom:16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:10px; color:#f87171; font-size:13px; }
        .up-modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .up-modal-full { grid-column:1/-1; }
        .up-modal-err { padding:9px 12px; margin-bottom:14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:8px; color:#f87171; font-size:12.5px; }
        .up-modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }
        .up-btn-cancel { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:9px 18px; color:#94a3b8; font-size:13.5px; font-family:inherit; cursor:pointer; }
        .up-btn-cancel:hover { background:rgba(255,255,255,0.09); }
        .up-btn-save { background:linear-gradient(135deg,#2563eb,#1d4ed8); border:none; border-radius:8px; padding:9px 20px; color:#fff; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:0 3px 10px rgba(37,99,235,0.3); }
        .up-btn-save:disabled { opacity:0.45; cursor:not-allowed; }
      `}</style>

      {/* Header */}
      <div className="up-head">
        <div>
          <h1 className="up-title">Usuarios</h1>
          <p className="up-sub">Todos los usuarios del sistema. Filtra por institución, rol o estado.</p>
        </div>
        <button style={btnPrimary} onClick={openCreate}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="up-filters">
        <div className="up-search-wrap">
          <span className="up-search-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input className="up-search" type="text"
            placeholder="Buscar nombre o email..."
            value={search} onChange={e => resetPage(setSearch)(e.target.value)}
          />
        </div>
        <select className="up-select" value={filterRole} onChange={e => resetPage(setFilterRole)(e.target.value)}>
          <option value="">Todos los roles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select className="up-select" value={filterActive} onChange={e => resetPage(setFilterActive)(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <select className="up-select" value={filterInstitution} onChange={e => resetPage(setFilterInstitution)(e.target.value)}>
          <option value="">Todas las instituciones</option>
          {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>

      {error && <div className="up-error">{error}</div>}

      {/* Tabla */}
      <div className="up-card">
        {loading ? (
          <div className="up-state">Cargando...</div>
        ) : users.length === 0 ? (
          <div className="up-state">No se encontraron usuarios.</div>
        ) : (
          <>
            <table className="up-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Institución</th>
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
                    <td>
                      {u.institution
                        ? <div className="up-inst">{u.institution.name}</div>
                        : <span style={{ color: '#334155', fontSize: 12 }}>—</span>
                      }
                    </td>
                    <td><RoleBadge role={u.role}/></td>
                    <td><StatusBadge isActive={u.isActive} pendingApproval={u.pendingApproval}/></td>
                    <td style={{ fontSize: 12, color: '#475569' }}>
                      {new Date(u.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="up-actions">
                        <button className="up-btn-sm" onClick={() => openEdit(u)}>Editar</button>
                        {u.role !== 'ADMIN' && (
                          <button className="up-btn-sm blue" onClick={() => openAssign(u)}>
                            Hacer admin
                          </button>
                        )}
                        <button
                          className={`up-btn-sm ${u.isActive ? 'danger' : 'success'}`}
                          onClick={() => handleToggleActive(u)}
                          disabled={u.id === currentUser?.id && u.isActive}
                          title={u.id === currentUser?.id && u.isActive ? 'No puedes desactivar tu propia cuenta' : undefined}
                        >
                          {u.isActive ? 'Desactivar' : 'Activar'}
                        </button>
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
                <button className="up-page-btn cur" disabled>{page} / {pagination.totalPages}</button>
                <button className="up-page-btn" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Siguiente ›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modal Crear ── */}
      {showCreate && (
        <div style={backdropStyle} onClick={() => setShowCreate(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>Nuevo usuario</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#475569' }}>El usuario se creará activo sin pasar por aprobación.</p>
            {createError && <div className="up-modal-err">{createError}</div>}
            <form onSubmit={handleCreate}>
              <div className="up-modal-grid">
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input style={inputStyle} value={createForm.firstName}
                    onChange={e => setCreateForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="Nombre" />
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <input style={inputStyle} value={createForm.lastName}
                    onChange={e => setCreateForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Apellido" />
                </div>
                <div className="up-modal-full">
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="correo@ejemplo.com" required />
                </div>
                <div className="up-modal-full">
                  <label style={labelStyle}>Contraseña *</label>
                  <input style={inputStyle} type="password" value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres" required />
                </div>
                <div>
                  <label style={labelStyle}>Rol *</label>
                  <select style={selectStyle} value={createForm.role}
                    onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                    {CREATABLE_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Institución</label>
                  <select style={selectStyle} value={createForm.institutionId}
                    onChange={e => setCreateForm(f => ({ ...f, institutionId: e.target.value }))}>
                    <option value="">Sin institución</option>
                    {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
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

      {/* ── Modal Editar ── */}
      {editModal && (
        <div style={backdropStyle} onClick={() => setEditModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>Editar usuario</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#475569' }}>{editModal.email}</p>
            {editError && <div className="up-modal-err">{editError}</div>}
            <form onSubmit={handleEdit}>
              <div className="up-modal-grid">
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input style={inputStyle} value={editForm.firstName}
                    onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <input style={inputStyle} value={editForm.lastName}
                    onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Rol</label>
                  <select style={selectStyle} value={editForm.role}
                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                    {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Institución</label>
                  <select style={selectStyle} value={editForm.institutionId}
                    onChange={e => setEditForm(f => ({ ...f, institutionId: e.target.value }))}>
                    <option value="">Sin institución</option>
                    {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div className="up-modal-full">
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8,
                    opacity: editModal?.id === currentUser?.id ? 0.4 : 1 }}>
                    <input type="checkbox" checked={editForm.isActive}
                      disabled={editModal?.id === currentUser?.id}
                      onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))} />
                    Usuario activo
                    {editModal?.id === currentUser?.id && (
                      <span style={{ fontSize: 11, color: '#475569', fontWeight: 400 }}>
                        (no puedes desactivar tu propia cuenta)
                      </span>
                    )}
                  </label>
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

      {/* ── Modal Hacer Admin ── */}
      {assignModal && (
        <div style={backdropStyle} onClick={() => setAssignModal(null)}>
          <div style={{ ...modalStyle, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>Asignar como Admin</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#475569' }}>
              <strong style={{ color: '#e2e8f0' }}>
                {assignModal.firstName ? `${assignModal.firstName} ${assignModal.lastName || ''}`.trim() : assignModal.email}
              </strong>{' '}
              pasará a tener rol Admin. Opcionalmente asígnale una institución.
            </p>
            {assignError && <div className="up-modal-err">{assignError}</div>}
            <form onSubmit={handleAssign}>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Institución (opcional)</label>
                <select style={selectStyle} value={assignInstitution}
                  onChange={e => setAssignInstitution(e.target.value)}>
                  <option value="">Sin institución (Admin global)</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="up-modal-actions">
                <button type="button" className="up-btn-cancel" onClick={() => setAssignModal(null)}>Cancelar</button>
                <button type="submit" className="up-btn-save" disabled={assignSaving}>
                  {assignSaving ? 'Asignando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
