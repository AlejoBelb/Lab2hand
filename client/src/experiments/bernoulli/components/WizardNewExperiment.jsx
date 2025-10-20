// Asistente de creación de experimento en 3 pasos con validaciones básicas
import React, { useState } from 'react'

const steps = ['Información', 'Parámetros', 'Confirmación']

export default function WizardNewExperiment({ onCreate }) {
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('Experimento base')
  const [description, setDescription] = useState('Medición simple de una variable en función del tiempo')
  const [unit, setUnit] = useState('u')
  const [error, setError] = useState(null)

  const next = () => {
    setError(null)
    if (step === 0 && !title.trim()) { setError('El título es obligatorio.'); return }
    if (step < steps.length - 1) setStep(step + 1)
  }

  const prev = () => {
    setError(null)
    if (step > 0) setStep(step - 1)
  }

  const finish = () => {
    setError(null)
    if (!unit.trim()) { setError('La unidad es obligatoria.'); return }
    const payload = { title: title.trim(), description: description.trim(), unit: unit.trim() }
    onCreate?.(payload)
  }

  return (
    <div>
      <div className="small">Paso {step + 1} de {steps.length} — {steps[step]}</div>
      <div style={{ marginTop: 8 }}>
        {step === 0 && (
          <div className="grid">
            <label>
              <div>Título</div>
              <input placeholder="Nombre del experimento" value={title} onChange={e => setTitle(e.target.value)} />
            </label>
            <label>
              <div>Descripción</div>
              <textarea rows={3} placeholder="Propósito y breve contexto" value={description} onChange={e => setDescription(e.target.value)} />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="grid">
            <label>
              <div>Unidad principal</div>
              <input placeholder="Ej.: m/s², °C, V" value={unit} onChange={e => setUnit(e.target.value)} />
            </label>
            <div className="small">La unidad se mostrará en la tabla y el eje Y de la gráfica.</div>
          </div>
        )}

        {step === 2 && (
          <div className="grid">
            <div className="card" style={{ background: 'transparent', border: '1px dashed var(--border)' }}>
              <strong>Revisión</strong>
              <div className="small">Confirmar los datos antes de crear.</div>
              <ul>
                <li><strong>Título:</strong> {title || '—'}</li>
                <li><strong>Descripción:</strong> {description || '—'}</li>
                <li><strong>Unidad:</strong> {unit || '—'}</li>
              </ul>
            </div>
          </div>
        )}

        {error && <div style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div>}

        <div className="btn-row" style={{ marginTop: 12 }}>
          <button className="ghost" onClick={prev} disabled={step === 0}>Atrás</button>
          {step < steps.length - 1 ? (
            <button className="primary" onClick={next}>Siguiente</button>
          ) : (
            <button className="primary" onClick={finish}>Crear experimento</button>
          )}
        </div>
      </div>
    </div>
  )
}
