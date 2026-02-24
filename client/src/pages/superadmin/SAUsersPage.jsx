// client/src/pages/superadmin/SAUsersPage.jsx

import { useEffect, useState, useCallback } from 'react';
import {
  listUsers,
  createUser,
  updateUser,
  assignAdmin,
  listInstitutions,
} from '../../lib/api/superadmin.js';

const ALL_ROLES = ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT'];
const CREATABLE_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'];
const ROLE_LABELS = { SUPERADMIN: 'Superadmin', ADMIN: 'Admin', TEACHER: 'Docente', STUDENT: 'Estudiante' };
const ROLE_COLORS = {
  SUPERADMIN: { bg: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: 'rgba(124,58,237,0.3)' },
  ADMIN:      { bg: 'rgba(37,99,235,0.1)',   color: '#60a5fa', border: 'rgba(37,99,235,0.2)' },
  TEACHER:    { bg: 'rgba(139,92,246,0.1)',  color: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  STUDENT:    { bg: 'rgba(16,185,129,0.08)', color: '#34d399', border: 'rgba(16,185,129,0.18)' },
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
  const color = pendingApproval ? '#fbbf24' : isActive ? '#34d399' : '#f87171';
  const bg = pendingApproval ? 'rgba(245,158,11,0.1)' : isActive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)';
  const border = pendingApproval ? 'rgba(245,158,11,0.2)' : isActive ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.15)';
  const label = pendingApproval ? 'Pendiente' : isActive ? 'Activo' : 'Inactivo';

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

export default function SAUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Instituciones para selects
  const [institutions, setInstitutions] = useState([]);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');
  const [page, setPage] = useState(1);

  // Modal crear
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    role: 'STUDENT', institutionId: '',
  });
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  // Modal editar
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Modal asignar admin
  const [assignModal, setAssignModal] = useState(null);
  const [assignInstitution, setAssignInstitution] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

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

  // ── Crear usuario ──────────────────────────────────────────────────────

  function openCreate() {
    setCreateForm({ email: '', password: '', firstName: '', lastName: '', role: 'STUDENT', institutionId: '' });
    setCreateError('');
    setShowCreate(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!createForm.email || !createForm.password) {
      setCreateError('Email y contraseña son obligatorios'); return;
    }
    setCreateSaving(true); setCreateError('');
    try {
      await createUser({
        ...createForm,
        institutionId: createForm.institutionId || undefined,
      });
      setShowCreate(false); setPage(1); load();
    } catch (e) { setCreateError(e.message); }
    finally { setCreateSaving(false); }
  }

  // ── Editar usuario ─────────────────────────────────────────────────────

  function openEdit(u) {
    setEditModal(u);
    setEditForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      role: u.role,
      isActive: u.isActive,
      institutionId: u.institutionId || '',
    });
    setEditError('');
  }

  async function handleEdit(e) {
    e.preventDefault();
    setEditSaving(true); setEditError('');
    try {
      await updateUser(editModal.id, {
        ...editForm,
        institutionId: editForm.institutionId || null,
      });
      setEditModal(null); load();
    } catch (e) { setEditError(e.message); }
    finally { setEditSaving(false); }
  }

  // ── Asignar como admin ─────────────────────────────────────────────────

  function openAssign(u) {
    setAssignModal(u);
    setAssignInstitution(u.institutionId || '');
    setAssignError('');
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!assignInstitution) { setAssignError('Selecciona una institución'); return; }
    setAssignSaving(true); setAssignError('');
    try {
      await assignAdmin({ userId: assignModal.id, institutionId: assignInstitution });
      setAssignModal(null); load();
    } catch (e) { setAssignError(e.message); }
    finally { setAssignSaving(false); }
  }

  async function handleToggleActive(u) {
    try { await updateUser(u.id, { isActive: !u.isActive }); load(); }
    catch (e) { alert(e.message); }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8, padding: '9px 12px',
    color: '#e2e8f0', fontSize: 13.5, fontFamily: 'inherit',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };
  const labelStyle = {
    display: 'block', fontSize: 11.5, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
  };
  const btnGhost = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6, padding: '5px 11px', fontSize: 12,
    color: '#94a3b8', fontFamily: 'inherit', cursor: 'pointer',
  };
  const btnPrimary = {
    background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none',
    borderRadius: 9, padding: '9px 18px', color: '#fff',
    fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
    boxShadow: '0 3px 12px rgba(124,58,237,0.3)',
    display: 'flex', alignItems: 'center', gap: 7,
  };
  const backdropStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  };
  const modalStyle = {
    background: '#0d1120', border: '1px solid rgba(139,92,246,0.18)',
    borderRadius: 16, width: '100%', maxWidth: 480, padding: 28,
    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
    maxHeight: '90vh', overflowY: 'auto',
  };

  return (
    <div>
      <style>{`
        .sau-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
        .sau-title { font-size:1.4rem; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
        .sau-sub { font-size:13px; color:#475569; margin:0; }
        .sau-filters { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .sau-search-wrap { position:relative; flex:1; min-width:180px; max-width:280px; }
        .sau-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#475569; pointer-events:none; }
        .sau-search { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px 8px 32px; color:#e2e8f0; font-size:13.5px; font-family:inherit; outline:none; }
        .sau-select { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px; color:#e2e8f0; font-size:13px; font-family:inherit; outline:none; cursor:pointer; }
        .sau-card { background:rgba(13,18,30,0.8); border:1px solid rgba(139,92,246,0.1); border-radius:14px; overflow:hidden; }
        .sau-table { width:100%; border-collapse:collapse; }
        .sau-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(139,92,246,0.08); background:rgba(255,255,255,0.01); }
        .sau-table td { padding:12px 16px; font-size:13.5px; color:#cbd5e1; border-bottom:1px solid rgba(255,255,255,0.03); vertical-align:middle; }
        .sau-table tr:last-child td { border-bottom:none; }
        .sau-table tr:hover td { background:rgba(139,92,246,0.02); }
        .sau-name { font-weight:500; color:#f1f5f9; }
        .sau-email { font-size:12px; color:#475569; margin-top:2px; }
        .sau-institution { font-size:12px; color:#7c3aed; margin-top:2px; }
        .sau-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .sau-btn-sm { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 10px; font-size:11.5px; color:#94a3b8; font-family:inherit; cursor:pointer; transition:background 0.15s,color 0.15s; white-space:nowrap; }
        .sau-btn-sm:hover { background:rgba(255,255,255,0.09); color:#e2e8f0; }
        .sau-btn-sm.purple:hover { background:rgba(124,58,237,0.12); color:#c4b5fd; border-color:rgba(124,58,237,0.25); }
        .sau-btn-sm.danger:hover { background:rgba(239,68,68,0.1); color:#f87171; border-color:rgba(239,68,68,0.2); }
        .sau-btn-sm.success:hover { background:rgba(16,185,129,0.1); color:#34d399; border-color:rgba(16,185,129,0.2); }
        .sau-pagination { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid rgba(139,92,246,0.08); font-size:12.5px; color:#475569; }
        .sau-page-btns { display:flex; gap:4px; }
        .sau-page-btn { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 11px; font-size:12.5px; color:#64748b; font-family:inherit; cursor:pointer; }
        .sau-page-btn:hover:not(:disabled) { background:rgba(255,255,255,0.09); color:#e2e8f0; }
        .sau-page-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .sau-page-btn.cur { background:rgba(124,58,237,0.15); color:#a78bfa; border-color:rgba(124,58,237,0.3); }
        .sau-state { padding:48px 0; text-align:center; color:#475569; font-size:13px; }
        .sau-error { padding:12px 16px; margin-bottom:16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:10px; color:#f87171; font-size:13px; }
        .sau-modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .sau-modal-full { grid-column:1/-1; }
        .sau-modal-err { padding:9px 12px; margin-bottom:14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:8px; color:#f87171; font-size:12.5px; }
        .sau-modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }
        .sau-btn-cancel { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:9px 18px; color:#94a3b8; font-size:13.5px; font-family:inherit; cursor:pointer; }
        .sau-btn-cancel:hover { background:rgba(255,255,255,0.09); }
        .sau-btn-save { background:linear-gradient(135deg,#7c3aed,#6d28d9); border:none; border-radius:8px; padding:9px 20px; color:#fff; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:0 3px 10px rgba(124,58,237,0.3); }
        .sau-btn-save:disabled { opacity:0.45; cursor:not-allowed; }
      `}</style>

      {/* Header */}
      <div className="sau-head">
        <div>
          <h1 className="sau-title">Usuarios globales</h1>
          <p className="sau-sub">Todos los usuarios del sistema. Filtra por institución, rol o estado.</p>
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
      <div className="sau-filters">
        <div className="sau-search-wrap">
          <span className="sau-search-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input className="sau-search" type="text"
            placeholder="Buscar nombre o email..."
            value={search} onChange={e => resetPage(setSearch)(e.target.value)}
          />
        </div>
        <select className="sau-select" value={filterRole} onChange={e => resetPage(setFilterRole)(e.target.value)}>
          <option value="">Todos los roles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select className="sau-select" value={filterActive} onChange={e => resetPage(setFilterActive)(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <select className="sau-select" value={filterInstitution} onChange={e => resetPage(setFilterInstitution)(e.target.value)}>
          <option value="">Todas las instituciones</option>
          {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>

      {error && <div className="sau-error">{error}</div>}

      {/* Tabla */}
      <div className="sau-card">
        {loading ? (
          <div className="sau-state">Cargando...</div>
        ) : users.length === 0 ? (
          <div className="sau-state">No se encontraron usuarios.</div>
        ) : (
          <>
            <table className="sau-table">
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
                      <div className="sau-name">
                        {u.firstName || u.lastName
                          ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                          : <em style={{ color: '#475569', fontStyle: 'normal' }}>Sin nombre</em>
                        }
                      </div>
                      <div className="sau-email">{u.email}</div>
                    </td>
                    <td>
                      {u.institution
                        ? <div className="sau-institution">{u.institution.name}</div>
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
                      <div className="sau-actions">
                        <button className="sau-btn-sm" onClick={() => openEdit(u)}>Editar</button>
                        {u.role !== 'SUPERADMIN' && u.role !== 'ADMIN' && (
                          <button className="sau-btn-sm purple" onClick={() => openAssign(u)}>
                            Hacer admin
                          </button>
                        )}
                        <button
                          className={`sau-btn-sm ${u.isActive ? 'danger' : 'success'}`}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="sau-pagination">
              <span>{pagination.total} usuario{pagination.total !== 1 ? 's' : ''}</span>
              <div className="sau-page-btns">
                <button className="sau-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Anterior</button>
                <button className="sau-page-btn cur" disabled>{page} / {pagination.totalPages}</button>
                <button className="sau-page-btn" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Siguiente ›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modal crear ── */}
      {showCreate && (
        <div style={backdropStyle} onClick={() => setShowCreate(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700 }}>
              Nuevo usuario
            </h3>
            {createError && <div className="sau-modal-err">{createError}</div>}
            <form onSubmit={handleCreate}>
              <div className="sau-modal-grid">
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input style={inputStyle} type="text" value={createForm.firstName}
                    onChange={e => setCreateForm(f => ({ ...f, firstName: e.target.value }))}/>
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <input style={inputStyle} type="text" value={createForm.lastName}
                    onChange={e => setCreateForm(f => ({ ...f, lastName: e.target.value }))}/>
                </div>
                <div className="sau-modal-full">
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" required value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}/>
                </div>
                <div className="sau-modal-full">
                  <label style={labelStyle}>Contraseña *</label>
                  <input style={inputStyle} type="password" required value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}/>
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
              <div className="sau-modal-actions">
                <button type="button" className="sau-btn-cancel" onClick={() => setShowCreate(false)}>Cancelar</button>
                <button type="submit" className="sau-btn-save" disabled={createSaving}>
                  {createSaving ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal editar ── */}
      {editModal && (
        <div style={backdropStyle} onClick={() => setEditModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>Editar usuario</h3>
            <p style={{ fontSize: 12, color: '#475569', margin: '0 0 18px' }}>{editModal.email}</p>
            {editError && <div className="sau-modal-err">{editError}</div>}
            <form onSubmit={handleEdit}>
              <div className="sau-modal-grid">
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input style={inputStyle} type="text" value={editForm.firstName}
                    onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}/>
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <input style={inputStyle} type="text" value={editForm.lastName}
                    onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}/>
                </div>
                <div>
                  <label style={labelStyle}>Rol</label>
                  <select style={selectStyle} value={editForm.role}
                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                    {editModal.role === 'SUPERADMIN'
                      ? <option value="SUPERADMIN">Superadmin</option>
                      : CREATABLE_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)
                    }
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
                <div className="sau-modal-full" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 13px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
                }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Cuenta activa</span>
                  <label style={{ position: 'relative', width: 38, height: 21, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }}
                      checked={editForm.isActive}
                      onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}/>
                    <span style={{
                      position: 'absolute', inset: 0, borderRadius: 21,
                      background: editForm.isActive ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.2s',
                    }}>
                      <span style={{
                        position: 'absolute', width: 15, height: 15,
                        left: editForm.isActive ? 20 : 3, top: 3,
                        background: '#fff', borderRadius: '50%', transition: 'left 0.2s',
                      }}/>
                    </span>
                  </label>
                </div>
              </div>
              <div className="sau-modal-actions">
                <button type="button" className="sau-btn-cancel" onClick={() => setEditModal(null)}>Cancelar</button>
                <button type="submit" className="sau-btn-save" disabled={editSaving}>
                  {editSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal asignar admin ── */}
      {assignModal && (
        <div style={backdropStyle} onClick={() => setAssignModal(null)}>
          <div style={{ ...modalStyle, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>
              Asignar como admin
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Esto cambiará el rol de <strong style={{ color: '#e2e8f0' }}>
                {assignModal.firstName || assignModal.email}
              </strong> a <strong style={{ color: '#a78bfa' }}>Admin</strong> y lo asignará a la institución seleccionada.
            </p>
            {assignError && <div className="sau-modal-err">{assignError}</div>}
            <form onSubmit={handleAssign}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Institución *</label>
                <select style={selectStyle} value={assignInstitution}
                  onChange={e => setAssignInstitution(e.target.value)}>
                  <option value="">Seleccionar institución...</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="sau-modal-actions">
                <button type="button" className="sau-btn-cancel" onClick={() => setAssignModal(null)}>Cancelar</button>
                <button type="submit" className="sau-btn-save" disabled={assignSaving}>
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