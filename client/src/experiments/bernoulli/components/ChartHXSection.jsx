// Limpia filas de la tabla y entrega datos numéricos {h, x} a ScatterHX.
// También muestra el título y ocupa el contenedor con clase .chart-area.

import React, { useMemo } from 'react'
import ScatterHX from './ScatterHX'

/*
  rows: arreglo de filas de la tabla. Se espera que cada fila tenga:
    - h  : altura (string o number)
    - x  : distancia (string o number)
  unit: 'cm' | 'm'
*/
export default function ChartHXSection({ rows = [], unit = 'cm' }) {
  // Normaliza a números y descarta inválidos
  const chartData = useMemo(() => {
    return rows
      .map((r) => ({
        h: Number(
          typeof r.h === 'string' ? r.h.replace(',', '.') : r.h
        ),
        x: Number(
          typeof r.x === 'string' ? r.x.replace(',', '.') : r.x
        ),
      }))
      .filter((p) => Number.isFinite(p.h) && Number.isFinite(p.x))
  }, [rows])

  return (
    <div className="chart-card">
      <div className="chart-area">
        <ScatterHX data={chartData} unit={unit} title="Gráfica h vs x" />
      </div>
    </div>
  )
}
