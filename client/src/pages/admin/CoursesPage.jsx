// client/src/pages/admin/CoursesPage.jsx

import { useEffect, useState, useCallback } from 'react';
import { listCourses, createCourse, updateCourse } from '../../lib/api/courses.js';
import { listInstitutions } from '../../lib/api/institutions.js';
import CourseDetailPanel from './CourseDetailPanel.jsx';

const STATUS_LABELS = { ACTIVE: 'Activo', EXPIRED: 'Vencido', ARCHIVED: 'Archivado' };
const STATUS_COLORS = {
  ACTIVE:   { bg: 'rgba(16,185,129,0.08)',  color: '#34d399', border: 'rgba(16,185,129,0.18)' },
  EXPIRED:  { bg: 'rgba(245,158,11,0.08)',  color: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
  ARCHIVED: { bg: 'rgba(100,116,139,0.1)',  color: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.ARCHIVED;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Modal crear / editar curso ────────────────────────────────────────────────

function CourseModal({ mode, initial, institutions, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:         initial?.name         || '',
    grade:        initial?.grade        || '',
    group:        initial?.group        || '',
    academicYear: initial?.academicYear || '',
    startsAt:     initial?.startsAt ? initial.startsAt.slice(0, 10) : '',
    endsAt:       initial?.endsAt   ? initial.endsAt.slice(0, 10)   : '',
    status:       initial?.status       || 'ACTIVE',
    institutionId: initial?.institution?.id || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === 'create' && !form.institutionId) {
      setError('Debes seleccionar una institución');
      return;
    }
    setSaving(true); setError('');
    try {
      if (mode === 'create') {
        await createCourse(form);
      } else {
        await updateCourse(initial.id, form);
      }
      onSaved();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  const inputS = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8, padding: '9px 12px',
    color: '#e2e8f0', fontSize: 13.5, fontFamily: 'inherit',
    outline: 'none',
  };
  const labelS = {
    display: 'block', fontSize: 11.5, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
  };
  const selectS = { ...inputS, cursor: 'pointer', background: '#0f1829', colorScheme: 'dark' };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#0f1520',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, width: '100%', maxWidth: 520, padding: 28,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#f1f5f9', margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700 }}>
          {mode === 'create' ? 'Nuevo curso' : 'Editar curso'}
        </h3>

        {error && (
          <div style={{
            padding: '9px 12px', marginBottom: 14,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 8, color: '#f87171', fontSize: 12.5,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Institución — solo en creación, full width */}
            {mode === 'create' && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelS}>Institución *</label>
                <select style={selectS} value={form.institutionId}
                  onChange={set('institutionId')} required>
                  <option value="">Seleccionar institución...</option>
                  {institutions.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Nombre — full width */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelS}>Nombre del curso *</label>
              <input style={inputS} type="text" required autoFocus
                placeholder="Ej: Física Mecánica"
                value={form.name} onChange={set('name')}/>
            </div>

            <div>
              <label style={labelS}>Grado *</label>
              <input style={inputS} type="text" required
                placeholder="Ej: 10°"
                value={form.grade} onChange={set('grade')}/>
            </div>

            <div>
              <label style={labelS}>Grupo *</label>
              <input style={inputS} type="text" required
                placeholder="Ej: A"
                value={form.group} onChange={set('group')}/>
            </div>

            <div>
              <label style={labelS}>Año académico *</label>
              <input style={inputS} type="text" required
                placeholder="Ej: 2025"
                value={form.academicYear} onChange={set('academicYear')}/>
            </div>

            <div>
              <label style={labelS}>Estado</label>
              <select style={selectS} value={form.status} onChange={set('status')}>
                <option value="ACTIVE">Activo</option>
                <option value="EXPIRED">Vencido</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>

            <div>
              <label style={labelS}>Fecha inicio *</label>
              <input style={inputS} type="date" required
                value={form.startsAt} onChange={set('startsAt')}/>
            </div>

            <div>
              <label style={labelS}>Fecha fin *</label>
              <input style={inputS} type="date" required
                value={form.endsAt} onChange={set('endsAt')}/>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 22 }}>
            <button type="button" onClick={onClose} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 8, padding: '9px 18px', color: '#94a3b8',
              fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
            }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{
              background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', border: 'none',
              borderRadius: 8, padding: '9px 20px', color: '#fff',
              fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
              opacity: saving ? 0.5 : 1,
            }}>
              {saving ? 'Guardando...' : mode === 'create' ? 'Crear curso' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function CoursesPage() {
  const [courses, setCourses]       = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [institutions, setInstitutions]         = useState([]);
  const [filterInstitution, setFilterInstitution] = useState('');
  const [search, setSearch]                     = useState('');
  const [filterStatus, setFilterStatus]         = useState('');
  const [page, setPage]                         = useState(1);

  const [modal, setModal]               = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Cargar instituciones una sola vez para el selector
  useEffect(() => {
    listInstitutions()
      .then(data => setInstitutions(data.institutions || []))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await listCourses({
        page, pageSize: 12,
        status:        filterStatus       || undefined,
        search:        search             || undefined,
        institutionId: filterInstitution  || undefined,
      });
      setCourses(data.items || []);
      setPagination({ page: data.page, total: data.total, totalPages: data.totalPages });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, filterStatus, search, filterInstitution]);

  useEffect(() => { load(); }, [load]);

  function resetPage(fn) { return (...args) => { fn(...args); setPage(1); }; }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <style>{`
        .cp-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
        .cp-title { font-size:1.4rem; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
        .cp-sub { font-size:13px; color:#475569; margin:0; }
        .cp-filters { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .cp-search-wrap { position:relative; flex:1; min-width:180px; max-width:280px; }
        .cp-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#475569; pointer-events:none; }
        .cp-search { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px 8px 32px; color:#e2e8f0; font-size:13.5px; font-family:inherit; outline:none; }
        .cp-select { background:#0f1829; border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px; color:#e2e8f0; font-size:13px; font-family:inherit; outline:none; cursor:pointer; color-scheme:dark; }
        .cp-btn-create { background:linear-gradient(135deg,#2563eb,#1d4ed8); border:none; border-radius:9px; padding:9px 18px; color:#fff; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:0 3px 10px rgba(37,99,235,0.3); display:flex; align-items:center; gap:7px; transition:opacity 0.15s; }
        .cp-btn-create:hover { opacity:0.88; }
        .cp-card { background:rgba(13,20,33,0.75); border:1px solid rgba(255,255,255,0.08); border-radius:14px; overflow:hidden; }
        .cp-table { width:100%; border-collapse:collapse; }
        .cp-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.01); }
        .cp-table td { padding:12px 16px; font-size:13.5px; color:#cbd5e1; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
        .cp-table tr:last-child td { border-bottom:none; }
        .cp-table tr.selected td { background:rgba(37,99,235,0.06); }
        .cp-table tr:not(.selected):hover td { background:rgba(255,255,255,0.015); cursor:pointer; }
        .cp-course-name { font-weight:500; color:#f1f5f9; }
        .cp-course-meta { font-size:12px; color:#475569; margin-top:2px; }
        .cp-inst-tag { font-size:11px; color:#60a5fa; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.15); border-radius:4px; padding:1px 6px; display:inline-block; margin-top:3px; }
        .cp-count-pill { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:6px; font-size:12px; background:rgba(255,255,255,0.04); color:#64748b; margin-right:4px; }
        .cp-actions { display:flex; gap:6px; }
        .cp-btn-sm { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 11px; font-size:12px; color:#94a3b8; font-family:inherit; cursor:pointer; transition:background 0.15s,color 0.15s; white-space:nowrap; }
        .cp-btn-sm:hover { background:rgba(255,255,255,0.09); color:#e2e8f0; }
        .cp-btn-sm.active { background:rgba(37,99,235,0.12); color:#60a5fa; border-color:rgba(37,99,235,0.25); }
        .cp-pagination { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid rgba(255,255,255,0.06); font-size:12.5px; color:#475569; }
        .cp-page-btns { display:flex; gap:4px; }
        .cp-page-btn { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 11px; font-size:12.5px; color:#64748b; font-family:inherit; cursor:pointer; }
        .cp-page-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .cp-page-btn.cur { background:rgba(37,99,235,0.15); color:#60a5fa; border-color:rgba(37,99,235,0.3); }
        .cp-state { padding:48px 0; text-align:center; color:#475569; font-size:13px; }
        .cp-error { padding:12px 16px; margin-bottom:16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:10px; color:#f87171; font-size:13px; }
      `}</style>

      {/* ── Lista de cursos ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cp-head">
          <div>
            <h1 className="cp-title">Cursos</h1>
            <p className="cp-sub">Gestiona los cursos de todas las instituciones.</p>
          </div>
          <button className="cp-btn-create" onClick={() => setModal({ mode: 'create' })}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo curso
          </button>
        </div>

        {/* Filtros */}
        <div className="cp-filters">
          <div className="cp-search-wrap">
            <span className="cp-search-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input className="cp-search" type="text"
              placeholder="Buscar por nombre, grado..."
              value={search} onChange={e => resetPage(setSearch)(e.target.value)}/>
          </div>
          <select className="cp-select" value={filterInstitution}
            onChange={e => resetPage(setFilterInstitution)(e.target.value)}>
            <option value="">Todas las instituciones</option>
            {institutions.map(i => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
          <select className="cp-select" value={filterStatus}
            onChange={e => resetPage(setFilterStatus)(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="EXPIRED">Vencidos</option>
            <option value="ARCHIVED">Archivados</option>
          </select>
        </div>

        {error && <div className="cp-error">{error}</div>}

        <div className="cp-card">
          {loading ? (
            <div className="cp-state">Cargando...</div>
          ) : courses.length === 0 ? (
            <div className="cp-state">No hay cursos. Crea el primero.</div>
          ) : (
            <>
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Estado</th>
                    <th>Miembros</th>
                    <th>Vigencia</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}
                      className={selectedCourse === c.id ? 'selected' : ''}
                      onClick={() => setSelectedCourse(id => id === c.id ? null : c.id)}>
                      <td>
                        <div className="cp-course-name">{c.name}</div>
                        <div className="cp-course-meta">
                          {c.grade} · Grupo {c.group} · {c.academicYear}
                        </div>
                        {c.institution && (
                          <span className="cp-inst-tag">{c.institution.name}</span>
                        )}
                      </td>
                      <td><StatusBadge status={c.status}/></td>
                      <td>
                        <span className="cp-count-pill" title="Docentes">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                          </svg>
                          {c._count?.teachers ?? 0}
                        </span>
                        <span className="cp-count-pill" title="Estudiantes">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                          {c._count?.students ?? 0}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#475569' }}>
                        {formatDate(c.startsAt)} – {formatDate(c.endsAt)}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="cp-actions">
                          <button className="cp-btn-sm" onClick={() => setModal({ mode: 'edit', initial: c })}>
                            Editar
                          </button>
                          <button
                            className={`cp-btn-sm${selectedCourse === c.id ? ' active' : ''}`}
                            onClick={() => setSelectedCourse(id => id === c.id ? null : c.id)}>
                            {selectedCourse === c.id ? 'Cerrar' : 'Gestionar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cp-pagination">
                <span>{pagination.total} curso{pagination.total !== 1 ? 's' : ''}</span>
                <div className="cp-page-btns">
                  <button className="cp-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Anterior</button>
                  <button className="cp-page-btn cur" disabled>{page} / {pagination.totalPages}</button>
                  <button className="cp-page-btn" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Siguiente ›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Panel lateral de gestión ── */}
      {selectedCourse && (
        <CourseDetailPanel
          courseId={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onUpdated={load}
        />
      )}

      {/* ── Modal crear/editar ── */}
      {modal && (
        <CourseModal
          mode={modal.mode}
          initial={modal.initial}
          institutions={institutions}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
