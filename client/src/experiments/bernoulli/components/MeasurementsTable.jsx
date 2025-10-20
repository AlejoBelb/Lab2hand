// Tabla editable de mediciones con validación mínima y acciones de fila
import React, { useMemo, useState } from 'react'

export default function MeasurementsTable({ rows, unit, onAdd, onUpdate, onDelete, onClear }) {
  const [t, setT] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)

  const isNumber = (v) => /^-?\d+(?:[.,]\d+)?$/.test(String(v).trim())

  const handleAdd = () => {
    setError(null)
    const tNorm = String(t).replace(',', '.')
    const vNorm = String(value).replace(',', '.')
    if (!isNumber(tNorm) || !isNumber(vNorm)) {
      setError('Ambos campos deben ser numéricos.')
      return
    }
    onAdd?.({ t: Number(tNorm), value: Number(vNorm), unit })
    setT('')
    setValue('')
  }

  const summary = useMemo(() => {
    if (!rows.length) return { count: 0, min: null, max: null }
    const vs = rows.map(r => Number(r.value))
    return { count: rows.length, min: Math.min(...vs), max: Math.max(...vs) }
  }, [rows])

  return (
    <div>
      <div className="grid">
        <div className="grid">
          <div className="btn-row">
            <input
              placeholder="t (s)"
              value={t}
              onChange={e => setT(e.target.value)}
              inputMode="decimal"
            />
            <input
              placeholder={`valor (${unit || 'u'})`}
              value={value}
              onChange={e => setValue(e.target.value)}
              inputMode="decimal"
            />
            <button className="primary" onClick={handleAdd}>Agregar</button>
            <button className="ghost" onClick={onClear} disabled={!rows.length}>Limpiar</button>
          </div>
          {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style={{ width: 120 }}>t (s)</th>
            <th>valor ({unit || 'u'})</th>
            <th style={{ width: 140 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="3" className="small">Sin mediciones. Agregar filas para ver la gráfica.</td>
            </tr>
          ) : rows.map((r, i) => (
            <Row
              key={i}
              index={i}
              row={r}
              unit={unit}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>

      <div className="small" style={{ marginTop: 8 }}>
        <strong>Resumen:</strong> {summary.count} puntos
        {summary.count ? ` — min: ${summary.min} ${unit || 'u'} — max: ${summary.max} ${unit || 'u'}` : ''}
      </div>
    </div>
  )
}

function Row({ index, row, unit, onUpdate, onDelete }) {
  const [t, setT] = useState(row.t)
  const [value, setValue] = useState(row.value)
  const [edit, setEdit] = useState(false)

  const isNumber = (v) => /^-?\d+(?:[.,]\d+)?$/.test(String(v).trim())

  const save = () => {
    const tNorm = String(t).replace(',', '.')
    const vNorm = String(value).replace(',', '.')
    if (!isNumber(tNorm) || !isNumber(vNorm)) return
    onUpdate?.(index, { t: Number(tNorm), value: Number(vNorm), unit })
    setEdit(false)
  }

  return (
    <tr>
      <td>
        {edit ? (
          <input value={t} onChange={e => setT(e.target.value)} inputMode="decimal" />
        ) : row.t}
      </td>
      <td>
        {edit ? (
          <input value={value} onChange={e => setValue(e.target.value)} inputMode="decimal" />
        ) : `${row.value}`}
      </td>
      <td>
        <div className="btn-row">
          {!edit ? (
            <button className="ghost" onClick={() => setEdit(true)}>Editar</button>
          ) : (
            <button className="primary" onClick={save}>Guardar</button>
          )}
          <button className="danger" onClick={() => onDelete?.(index)}>Eliminar</button>
        </div>
      </td>
    </tr>
  )
}
