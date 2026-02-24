// client/src/pages/superadmin/SAInstitutionsPage.jsx

import { useEffect, useState } from 'react';
import {
  listInstitutions,
  createInstitution,
  updateInstitution,
} from '../../lib/api/superadmin.js';

// ── Estilos compartidos (prefijo sai-) ────────────────────────────────────
const S = `
  .sai-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
  .sai-title { font-size:1.4rem; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
  .sai-sub { font-size:13px; color:#475569; margin:0; }

  .sai-card { background:rgba(13,18,30,0.8); border:1px solid rgba(139,92,246,0.1); border-radius:14px; overflow:hidden; }

  .sai-table { width:100%; border-collapse:collapse; }
  .sai-table th {
    padding:11px 18px; text-align:left;
    font-size:11px; font-weight:600; color:#64748b;
    text-transform:uppercase; letter-spacing:0.05em;
    border-bottom:1px solid rgba(139,92,246,0.08);
    background:rgba(255,255,255,0.01);
  }
  .sai-table td {
    padding:14px 18px; font-size:13.5px; color:#cbd5e1;
    border-bottom:1px solid rgba(255,255,255,0.03);
    vertical-align:middle;
  }
  .sai-table tr:last-child td { border-bottom:none; }
  .sai-table tr:hover td { background:rgba(139,92,246,0.03); }

  .sai-badge { display:inline-flex; align-items:center; gap:5px; padding:2px 10px; border-radius:20px; font-size:11.5px; font-weight:500; }
  .sai-badge.on { background:rgba(16,185,129,0.08); color:#34d399; border:1px solid rgba(16,185,129,0.18); }
  .sai-badge.off { background:rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.15); }
  .sai-badge-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }

  .sai-count { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:6px; font-size:12px; background:rgba(255,255,255,0.04); color:#64748b; margin-right:5px; }

  .sai-btn { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:7px; padding:6px 13px; font-size:12.5px; color:#94a3b8; font-family:inherit; cursor:pointer; transition:background 0.15s,color 0.15s; }
  .sai-btn:hover { background:rgba(255,255,255,0.09); color:#e2e8f0; }

  .sai-btn-primary { background:linear-gradient(135deg,#7c3aed,#6d28d9); border:none; border-radius:9px; padding:9px 18px; color:#fff; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:0 3px 12px rgba(124,58,237,0.3); transition:opacity 0.15s,transform 0.15s; display:flex; align-items:center; gap:7px; }
  .sai-btn-primary:hover { opacity:0.88; transform:translateY(-1px); }
  .sai-btn-primary:disabled { opacity:0.4; cursor:not-allowed; transform:none; }

  .sai-state { padding:48px 0; text-align:center; color:#475569; font-size:13px; }
  .sai-error { padding:12px 16px; margin-bottom:16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:10px; color:#f87171; font-size:13px; }

  /* Modal */
  .sai-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.65); backdrop-filter:blur(5px); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .sai-modal { background:#0d1120; border:1px solid rgba(139,92,246,0.18); border-radius:16px; width:100%; max-width:440px; padding:28px; box-shadow:0 24px 60px rgba(0,0,0,0.6); }
  .sai-modal h3 { font-size:1.1rem; font-weight:700; color:#f1f5f9; margin:0 0 20px; }
  .sai-field { margin-bottom:16px; }
  .sai-field label { display:block; font-size:11.5px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:7px; }
  .sai-input { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:10px 12px; color:#e2e8f0; font-size:14px; font-family:inherit; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
  .sai-input:focus { border-color:rgba(139,92,246,0.5); box-shadow:0 0 0 3px rgba(139,92,246,0.1); }
  .sai-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:10px 13px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:8px; }
  .sai-toggle-lbl { font-size:13px; color:#94a3b8; }
  .sai-toggle { position:relative; width:38px; height:21px; cursor:pointer; }
  .sai-toggle input { opacity:0; width:0; height:0; }
  .sai-toggle-sl { position:absolute; inset:0; background:rgba(255,255,255,0.1); border-radius:21px; transition:background 0.2s; }
  .sai-toggle-sl::before { content:''; position:absolute; width:15px; height:15px; left:3px; top:3px; background:#fff; border-radius:50%; transition:transform 0.2s; }
  .sai-toggle input:checked + .sai-toggle-sl { background:#7c3aed; }
  .sai-toggle input:checked + .sai-toggle-sl::before { transform:translateX(17px); }
  .sai-modal-err { padding:9px 12px; margin-bottom:14px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:8px; color:#f87171; font-size:12.5px; }
  .sai-modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }
  .sai-btn-cancel { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:9px 18px; color:#94a3b8; font-size:13.5px; font-family:inherit; cursor:pointer; transition:background 0.15s; }
  .sai-btn-cancel:hover { background:rgba(255,255,255,0.09); }
  .sai-btn-save { background:linear-gradient(135deg,#7c3aed,#6d28d9); border:none; border-radius:8px; padding:9px 20px; color:#fff; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; transition:opacity 0.15s; box-shadow:0 3px 10px rgba(124,58,237,0.3); }
  .sai-btn-save:hover:not(:disabled) { opacity:0.88; }
  .sai-btn-save:disabled { opacity:0.45; cursor:not-allowed; }
`;

export default function SAInstitutionsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [modal, setModal] = useState(null); // null | { mode: 'create' | 'edit', data? }
  const [form, setForm] = useState({ name: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const data = await listInstitutions();
      setInstitutions(data.institutions || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm({ name: '', isActive: true });
    setFormError('');
    setModal({ mode: 'create' });
  }

  function openEdit(inst) {
    setForm({ name: inst.name, isActive: inst.isActive });
    setFormError('');
    setModal({ mode: 'edit', data: inst });
  }

  function closeModal() { setModal(null); setFormError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('El nombre es obligatorio'); return; }
    setSaving(true); setFormError('');
    try {
      if (modal.mode === 'create') {
        await createInstitution({ name: form.name });
      } else {
        await updateInstitution(modal.data.id, { name: form.name, isActive: form.isActive });
      }
      closeModal();
      load();
    } catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <style>{S}</style>

      <div className="sai-head">
        <div>
          <h1 className="sai-title">Instituciones</h1>
          <p className="sai-sub">Gestiona todas las instituciones del sistema.</p>
        </div>
        <button className="sai-btn-primary" onClick={openCreate}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva institución
        </button>
      </div>

      {error && <div className="sai-error">{error}</div>}

      <div className="sai-card">
        {loading ? (
          <div className="sai-state">Cargando...</div>
        ) : institutions.length === 0 ? (
          <div className="sai-state">No hay instituciones. Crea la primera.</div>
        ) : (
          <table className="sai-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Usuarios</th>
                <th>Cursos</th>
                <th>Creada</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {institutions.map(inst => (
                <tr key={inst.id}>
                  <td style={{ fontWeight: 500, color: '#f1f5f9' }}>{inst.name}</td>
                  <td>
                    <span className={`sai-badge ${inst.isActive ? 'on' : 'off'}`}>
                      <span className="sai-badge-dot"/>
                      {inst.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <span className="sai-count">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                      </svg>
                      {inst._count?.users ?? 0}
                    </span>
                  </td>
                  <td>
                    <span className="sai-count">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <path d="M8 21h8M12 17v4"/>
                      </svg>
                      {inst._count?.courses ?? 0}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#475569' }}>
                    {new Date(inst.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <button className="sai-btn" onClick={() => openEdit(inst)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="sai-backdrop" onClick={closeModal}>
          <div className="sai-modal" onClick={e => e.stopPropagation()}>
            <h3>{modal.mode === 'create' ? 'Nueva institución' : 'Editar institución'}</h3>

            {formError && <div className="sai-modal-err">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="sai-field">
                <label>Nombre *</label>
                <input className="sai-input" type="text" autoFocus
                  placeholder="Ej: Universidad Nacional"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              {modal.mode === 'edit' && (
                <div className="sai-field">
                  <div className="sai-toggle-row">
                    <span className="sai-toggle-lbl">Institución activa</span>
                    <label className="sai-toggle">
                      <input type="checkbox" checked={form.isActive}
                        onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      />
                      <span className="sai-toggle-sl"/>
                    </label>
                  </div>
                </div>
              )}

              <div className="sai-modal-actions">
                <button type="button" className="sai-btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="sai-btn-save" disabled={saving}>
                  {saving ? 'Guardando...' : modal.mode === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}