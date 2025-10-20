// Tabla de capturas con edición post-vaciado, scroll vertical y contador de filas.
import React, { useMemo, useState } from 'react'

function formatNum(v, unit, kind) {
  const dp = kind === 'time' ? 2 : unit === 'cm' ? 3 : 4
  if (typeof v !== 'number' || Number.isNaN(v)) return ''
  return v.toFixed(dp)
}

function parseDecimal(str) {
  if (typeof str !== 'string') return NaN
  const s = str.replace(',', '.').trim()
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

export default function CaptureTable({
  unit = 'cm',
  rows = [],
  editable = false,
  maxHeight = 100,
  onEditRow,
  onExport
}) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [draftH, setDraftH] = useState('')

  const headers = useMemo(
    () => ([
      { key: 'time', label: 'Tiempo (s)' },
      { key: 'h', label: `Altura h (${unit})` },
      { key: 'x', label: `Distancia x (${unit})` },
    ]),
    [unit]
  )

  const startEdit = (idx) => {
    if (!editable) return
    setEditingIndex(idx)
    setDraftH(String(rows[idx]?.h ?? ''))
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setDraftH('')
  }

  const saveEdit = () => {
    if (editingIndex == null) return
    const parsed = parseDecimal(draftH)
    if (!Number.isFinite(parsed)) {
      alert('Valor inválido. Usa números con coma o punto.')
      return
    }
    if (parsed < 0 || parsed > Number(maxHeight)) {
      alert(`La altura debe estar entre 0 y ${maxHeight} ${unit}.`)
      return
    }
    const row = rows[editingIndex]
    if (!row) return
    onEditRow?.(editingIndex, { ...row, h: parsed })
    setEditingIndex(null)
    setDraftH('')
  }

  const onKeyDownInput = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); saveEdit() }
    if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
  }

  const count = rows.length

  return (
    <div className="table-card">
      <div className="table-head">
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          Tabla de capturas
          <span className="counter-badge" title="Cantidad de capturas">{count}</span>
        </h2>
        <div className="export-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={onExport} disabled={rows.length === 0}>Exportar CSV</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="captures-table">
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h.key} className="left">{h.label}</th>
              ))}
              {editable && <th className="left" style={{ width: 120 }}>Acciones</th>}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="left" colSpan={editable ? 4 : 3}>
                  Sin capturas. Usa “Capturar” durante el vaciado.
                </td>
              </tr>
            )}

            {rows.map((r, i) => {
              const isEditing = editingIndex === i
              return (
                <tr key={i} className={isEditing ? 'editing' : ''}>
                  <td className="left">{formatNum(r.time, unit, 'time')}</td>

                  <td className="left">
                    {isEditing ? (
                      <input
                        className="table-edit-input"
                        type="text"
                        inputMode="decimal"
                        value={draftH}
                        onChange={(e) => setDraftH(e.target.value)}
                        onKeyDown={onKeyDownInput}
                        placeholder={`0–${maxHeight}`}
                        aria-label="Editar altura h"
                      />
                    ) : (
                      formatNum(r.h, unit, 'h')
                    )}
                  </td>

                  <td className="left">{formatNum(r.x, unit, 'x')}</td>

                  {editable && (
                    <td className="left">
                      {isEditing ? (
                        <div className="row-actions">
                          <button className="btn btn-primary btn-sm" onClick={saveEdit}>Guardar</button>
                          <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancelar</button>
                        </div>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(i)}>Editar</button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="table-footnote">
        Atajos: C capturar, P pausar/reanudar, R reiniciar.
      </div>
    </div>
  )
}
