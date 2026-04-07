// client/src/pages/admin/InstitutionsPage.jsx

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext.jsx';
import {
  listInstitutions,
  updateInstitution,
} from '../../lib/api/institutions.js';

export default function InstitutionsPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal edición
  const [editModal, setEditModal] = useState(null); // { id, name, isActive }
  const [editName, setEditName] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await listInstitutions();
      setInstitutions(data.institutions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openEdit(inst) {
    setEditModal(inst);
    setEditName(inst.name);
    setEditActive(inst.isActive);
    setEditError('');
  }

  function closeEdit() {
    setEditModal(null);
    setEditError('');
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editName.trim()) { setEditError('El nombre no puede estar vacío'); return; }
    setEditSaving(true);
    setEditError('');
    try {
      await updateInstitution(editModal.id, { name: editName.trim(), isActive: editActive });
      closeEdit();
      load();
    } catch (e) {
      setEditError(e.message);
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div>
      <style>{`
        .inst-page-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .inst-page-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }
        .inst-page-sub {
          font-size: 13px;
          color: #475569;
          margin: 0;
        }

        /* Card */
        .inst-card {
          background: rgba(13,20,33,0.75);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
        }

        /* Tabla */
        .inst-table { width: 100%; border-collapse: collapse; }
        .inst-table th {
          padding: 11px 18px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.01);
        }
        .inst-table td {
          padding: 14px 18px;
          font-size: 13.5px;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .inst-table tr:last-child td { border-bottom: none; }
        .inst-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }

        /* Badge */
        .inst-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 500;
        }
        .inst-badge.active {
          background: rgba(16,185,129,0.1);
          color: #34d399;
          border: 1px solid rgba(16,185,129,0.2);
        }
        .inst-badge.inactive {
          background: rgba(239,68,68,0.08);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.15);
        }
        .inst-badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Contador */
        .inst-count-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 12px;
          background: rgba(255,255,255,0.05);
          color: #64748b;
          margin-right: 6px;
        }

        /* Botones */
        .inst-btn-edit {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 7px;
          padding: 6px 14px;
          font-size: 12.5px;
          color: #94a3b8;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .inst-btn-edit:hover {
          background: rgba(255,255,255,0.09);
          color: #e2e8f0;
        }

        /* Estado vacío / error / carga */
        .inst-state {
          padding: 48px 0;
          text-align: center;
          color: #475569;
          font-size: 13px;
        }
        .inst-error {
          padding: 14px 18px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 10px;
          color: #f87171;
          font-size: 13px;
          margin-bottom: 16px;
        }

        /* ── Modal ── */
        .inst-modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .inst-modal {
          background: #0f1520;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          width: 100%;
          max-width: 440px;
          padding: 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .inst-modal h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 20px;
        }
        .inst-field { margin-bottom: 16px; }
        .inst-field label {
          display: block;
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 7px;
        }
        .inst-field input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 10px 12px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .inst-field input:focus {
          border-color: rgba(37,99,235,0.5);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .inst-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
        }
        .inst-toggle-label { font-size: 13px; color: #94a3b8; }
        .inst-toggle {
          position: relative;
          width: 40px; height: 22px;
          cursor: pointer;
        }
        .inst-toggle input { opacity: 0; width: 0; height: 0; }
        .inst-toggle-slider {
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.1);
          border-radius: 22px;
          transition: background 0.2s;
        }
        .inst-toggle-slider::before {
          content: '';
          position: absolute;
          width: 16px; height: 16px;
          left: 3px; top: 3px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .inst-toggle input:checked + .inst-toggle-slider {
          background: #2563eb;
        }
        .inst-toggle input:checked + .inst-toggle-slider::before {
          transform: translateX(18px);
        }
        .inst-modal-err {
          padding: 10px 12px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 8px;
          color: #f87171;
          font-size: 12.5px;
          margin-bottom: 16px;
        }
        .inst-modal-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .inst-btn-cancel {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 9px 18px;
          color: #94a3b8;
          font-size: 13.5px;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .inst-btn-cancel:hover { background: rgba(255,255,255,0.09); }
        .inst-btn-save {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: opacity 0.15s;
          box-shadow: 0 3px 10px rgba(37,99,235,0.3);
        }
        .inst-btn-save:hover:not(:disabled) { opacity: 0.88; }
        .inst-btn-save:disabled { opacity: 0.45; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div className="inst-page-head">
        <div>
          <h1 className="inst-page-title">Instituciones</h1>
          <p className="inst-page-sub">
            Gestiona los datos de tu institución educativa.
          </p>
        </div>
      </div>

      {error && <div className="inst-error">{error}</div>}

      <div className="inst-card">
        {loading ? (
          <div className="inst-state">Cargando...</div>
        ) : institutions.length === 0 ? (
          <div className="inst-state">No se encontraron instituciones.</div>
        ) : (
          <table className="inst-table">
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
                    <span className={`inst-badge ${inst.isActive ? 'active' : 'inactive'}`}>
                      <span className="inst-badge-dot" />
                      {inst.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <span className="inst-count-pill">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                      </svg>
                      {inst._count?.users ?? 0}
                    </span>
                  </td>
                  <td>
                    <span className="inst-count-pill">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <path d="M8 21h8M12 17v4"/>
                      </svg>
                      {inst._count?.courses ?? 0}
                    </span>
                  </td>
                  <td style={{ color: '#475569', fontSize: 12 }}>
                    {new Date(inst.createdAt).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    <button className="inst-btn-edit" onClick={() => openEdit(inst)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal edición */}
      {editModal && (
        <div className="inst-modal-backdrop" onClick={closeEdit}>
          <div className="inst-modal" onClick={e => e.stopPropagation()}>
            <h3>Editar institución</h3>

            {editError && <div className="inst-modal-err">{editError}</div>}

            <form onSubmit={handleSaveEdit}>
              <div className="inst-field">
                <label>Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Nombre de la institución"
                  autoFocus
                />
              </div>

              <div className="inst-field">
                <div className="inst-toggle-row">
                  <span className="inst-toggle-label">Institución activa</span>
                  <label className="inst-toggle">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={e => setEditActive(e.target.checked)}
                    />
                    <span className="inst-toggle-slider" />
                  </label>
                </div>
              </div>

              <div className="inst-modal-actions">
                <button type="button" className="inst-btn-cancel" onClick={closeEdit}>
                  Cancelar
                </button>
                <button type="submit" className="inst-btn-save" disabled={editSaving}>
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
