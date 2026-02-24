// client/src/pages/teacher/GuidesPage.jsx

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getMyCourses,
  listMyGuides,
  createGuide,
  updateGuide,
  publishGuide,
  unpublishGuide,
  deleteGuide,
} from '../../lib/api/teacherGuides.js';

// ← Movido al nivel de módulo para que sea accesible en todo el archivo
const BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:4001';

const STATUS_STYLE = {
  PUBLISHED: { bg: 'rgba(16,185,129,0.08)', color: '#34d399', border: 'rgba(16,185,129,0.18)', label: 'Publicada' },
  DRAFT:     { bg: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: 'rgba(245,158,11,0.2)',  label: 'Borrador' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.DRAFT;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}/>
      {s.label}
    </span>
  );
}

// ── Modal subir / editar guía ─────────────────────────────────────────────

function GuideModal({ mode, initial, courses, onClose, onSaved }) {
  const [courseId, setCourseId] = useState(initial?.course?.id || '');
  const [experimentId, setExperimentId] = useState(initial?.experiment?.id || '');
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [pdfFile, setPdfFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const selectedCourse = courses.find(c => c.id === courseId);
  const experiments = selectedCourse?.experiments?.map(e => e.experiment) || [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === 'create' && !pdfFile) { setError('Selecciona un PDF'); return; }
    if (!courseId || !experimentId || !title.trim()) {
      setError('Curso, experimento y título son obligatorios'); return;
    }
    setSaving(true); setError('');
    try {
      if (mode === 'create') {
        await createGuide({ courseId, experimentId, title, description, pdfFile });
      } else {
        await updateGuide(initial.id, { title, description, pdfFile: pdfFile || undefined });
      }
      onSaved(); onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  const inputS = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8, padding: '9px 12px',
    color: '#e2e8f0', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
  };
  const labelS = { display: 'block', fontSize: 11.5, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#0f1520', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, width: '100%', maxWidth: 500, padding: 28,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#f1f5f9', margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 700 }}>
          {mode === 'create' ? 'Subir nueva guía' : 'Editar guía'}
        </h3>

        {error && (
          <div style={{ padding: '9px 12px', marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#f87171', fontSize: 12.5 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {mode === 'create' && (
            <>
              <div>
                <label style={labelS}>Curso *</label>
                <select style={{ ...inputS, cursor: 'pointer' }} value={courseId}
                  onChange={e => { setCourseId(e.target.value); setExperimentId(''); }}>
                  <option value="">Seleccionar curso...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.grade} · {c.group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelS}>Experimento *</label>
                <select style={{ ...inputS, cursor: 'pointer' }} value={experimentId}
                  onChange={e => setExperimentId(e.target.value)}
                  disabled={!courseId}>
                  <option value="">Seleccionar experimento...</option>
                  {experiments.map(exp => (
                    <option key={exp.id} value={exp.id}>{exp.name}</option>
                  ))}
                </select>
                {courseId && experiments.length === 0 && (
                  <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>
                    Este curso no tiene experimentos asignados.
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <label style={labelS}>Título *</label>
            <input style={inputS} type="text" autoFocus={mode === 'edit'}
              placeholder="Ej: Guía de Laboratorio — Ley de Hooke"
              value={title} onChange={e => setTitle(e.target.value)}/>
          </div>

          <div>
            <label style={labelS}>Descripción</label>
            <textarea style={{ ...inputS, resize: 'vertical', minHeight: 72 }}
              placeholder="Descripción breve de la guía..."
              value={description} onChange={e => setDescription(e.target.value)}/>
          </div>

          <div>
            <label style={labelS}>{mode === 'create' ? 'Archivo PDF *' : 'Reemplazar PDF (opcional)'}</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${pdfFile ? 'rgba(5,150,105,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 10, padding: '18px 16px',
                textAlign: 'center', cursor: 'pointer',
                background: pdfFile ? 'rgba(5,150,105,0.05)' : 'rgba(255,255,255,0.02)',
                transition: 'border-color 0.2s, background 0.2s',
              }}>
              {pdfFile ? (
                <div style={{ color: '#34d399', fontSize: 13.5 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: 'middle', marginRight: 7 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {pdfFile.name}
                </div>
              ) : (
                <div style={{ color: '#475569', fontSize: 13 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Haz clic para seleccionar un PDF
                  <div style={{ fontSize: 11.5, marginTop: 4, color: '#334155' }}>Máximo 20MB</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={e => setPdfFile(e.target.files?.[0] || null)}/>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" onClick={onClose} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 8, padding: '9px 18px', color: '#94a3b8',
              fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
            }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{
              background: 'linear-gradient(135deg,#059669,#047857)', border: 'none',
              borderRadius: 8, padding: '9px 20px', color: '#fff',
              fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(5,150,105,0.3)',
              opacity: saving ? 0.5 : 1,
            }}>
              {saving ? 'Guardando...' : mode === 'create' ? 'Subir guía' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [guidesData, coursesData] = await Promise.all([
        listMyGuides({ courseId: filterCourse || undefined }),
        getMyCourses(),
      ]);
      setGuides(guidesData.guides || []);
      setCourses(coursesData.courses || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filterCourse]);

  useEffect(() => { load(); }, [load]);

  const filtered = filterStatus
    ? guides.filter(g => g.status === filterStatus)
    : guides;

  async function handlePublish(guide) {
    setActionLoading(guide.id);
    try {
      if (guide.status === 'PUBLISHED') {
        await unpublishGuide(guide.id);
      } else {
        await publishGuide(guide.id);
      }
      load();
    } catch (e) { alert(e.message); }
    finally { setActionLoading(null); }
  }

  async function handleDelete(guide) {
    if (!confirm(`¿Eliminar "${guide.title}"? Esta acción no se puede deshacer.`)) return;
    setActionLoading(guide.id);
    try { await deleteGuide(guide.id); load(); }
    catch (e) { alert(e.message); }
    finally { setActionLoading(null); }
  }

  return (
    <div>
      <style>{`
        .gp-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
        .gp-title { font-size:1.4rem; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
        .gp-sub { font-size:13px; color:#475569; margin:0; }
        .gp-filters { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .gp-select { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px; color:#e2e8f0; font-size:13px; font-family:inherit; outline:none; cursor:pointer; }
        .gp-btn-create { background:linear-gradient(135deg,#059669,#047857); border:none; border-radius:9px; padding:9px 18px; color:#fff; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:0 3px 10px rgba(5,150,105,0.3); display:flex; align-items:center; gap:7px; transition:opacity 0.15s; }
        .gp-btn-create:hover { opacity:0.88; }
        .gp-card { background:rgba(13,20,33,0.75); border:1px solid rgba(255,255,255,0.08); border-radius:14px; overflow:hidden; }
        .gp-table { width:100%; border-collapse:collapse; }
        .gp-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.01); }
        .gp-table td { padding:13px 16px; font-size:13.5px; color:#cbd5e1; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
        .gp-table tr:last-child td { border-bottom:none; }
        .gp-table tr:hover td { background:rgba(255,255,255,0.015); }
        .gp-guide-title { font-weight:500; color:#f1f5f9; }
        .gp-guide-meta { font-size:12px; color:#475569; margin-top:2px; }
        .gp-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .gp-btn { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 11px; font-size:12px; color:#94a3b8; font-family:inherit; cursor:pointer; transition:background 0.15s,color 0.15s; white-space:nowrap; }
        .gp-btn:hover { background:rgba(255,255,255,0.09); color:#e2e8f0; }
        .gp-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .gp-btn.publish { color:#34d399; border-color:rgba(16,185,129,0.2); }
        .gp-btn.publish:hover { background:rgba(16,185,129,0.1); }
        .gp-btn.unpublish { color:#fbbf24; border-color:rgba(245,158,11,0.2); }
        .gp-btn.unpublish:hover { background:rgba(245,158,11,0.08); }
        .gp-btn.danger:hover { background:rgba(239,68,68,0.1); color:#f87171; border-color:rgba(239,68,68,0.2); }
        .gp-state { padding:48px 0; text-align:center; color:#475569; font-size:13px; }
        .gp-error { padding:12px 16px; margin-bottom:16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:10px; color:#f87171; font-size:13px; }
        .gp-empty-icon { width:48px; height:48px; margin:0 auto 12px; opacity:0.2; }
      `}</style>

      <div className="gp-head">
        <div>
          <h1 className="gp-title">Mis guías</h1>
          <p className="gp-sub">Sube y gestiona las guías de laboratorio de tus cursos.</p>
        </div>
        <button className="gp-btn-create" onClick={() => setModal({ mode: 'create' })}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Subir guía
        </button>
      </div>

      {/* Filtros */}
      <div className="gp-filters">
        <select className="gp-select" value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}>
          <option value="">Todos los cursos</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.grade} · {c.group}</option>
          ))}
        </select>
        <select className="gp-select" value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borradores</option>
          <option value="PUBLISHED">Publicadas</option>
        </select>
      </div>

      {error && <div className="gp-error">{error}</div>}

      <div className="gp-card">
        {loading ? (
          <div className="gp-state">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="gp-state">
            <svg className="gp-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {filterCourse || filterStatus
              ? 'No hay guías con estos filtros.'
              : 'Aún no has subido ninguna guía. ¡Sube la primera!'}
          </div>
        ) : (
          <table className="gp-table">
            <thead>
              <tr>
                <th>Guía</th>
                <th>Experimento</th>
                <th>Estado</th>
                <th>Actualizada</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id}>
                  <td>
                    <div className="gp-guide-title">{g.title}</div>
                    <div className="gp-guide-meta">
                      {g.course?.name} · {g.course?.grade} {g.course?.group}
                    </div>
                  </td>
                  <td style={{ fontSize: 12.5, color: '#7c3aed' }}>
                    {g.experiment?.name || '—'}
                  </td>
                  <td><StatusBadge status={g.status}/></td>
                  <td style={{ fontSize: 12, color: '#475569' }}>
                    {new Date(g.updatedAt).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className="gp-actions">
                      {/* Ver PDF */}
                      {g.fileUrl && (
                        <a href={`${BASE_URL}/${g.fileUrl}`} target="_blank" rel="noreferrer"
                          style={{ textDecoration: 'none' }}>
                          <button className="gp-btn">Ver PDF</button>
                        </a>
                      )}

                      {/* Editar — solo borradores */}
                      {g.status === 'DRAFT' && (
                        <button className="gp-btn"
                          onClick={() => setModal({ mode: 'edit', initial: g })}>
                          Editar
                        </button>
                      )}

                      {/* Publicar / Despublicar */}
                      <button
                        className={`gp-btn ${g.status === 'PUBLISHED' ? 'unpublish' : 'publish'}`}
                        disabled={actionLoading === g.id}
                        onClick={() => handlePublish(g)}>
                        {actionLoading === g.id
                          ? '...'
                          : g.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
                      </button>

                      {/* Eliminar — solo borradores */}
                      {g.status === 'DRAFT' && (
                        <button className="gp-btn danger"
                          disabled={actionLoading === g.id}
                          onClick={() => handleDelete(g)}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <GuideModal
          mode={modal.mode}
          initial={modal.initial}
          courses={courses}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}