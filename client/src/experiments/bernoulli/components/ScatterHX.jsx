// Gráfica de dispersión h–x con exportación a PNG, puntos visibles y márgenes compactos.
// Usa ResponsiveContainer con height="100%" dentro de .chart-area.

import React, { useMemo, useRef } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
} from 'recharts'

function formatUnitLabel(unit) {
  return unit === 'cm' ? 'cm' : 'm'
}

function roundAuto(n, dp = 3) {
  if (typeof n !== 'number' || !isFinite(n)) return n
  return Number(n.toFixed(dp))
}

// Render de punto con mayor visibilidad en tema oscuro
function ScatterDot(props) {
  const { cx, cy } = props
  if (cx == null || cy == null) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="rgba(120,180,255,0.95)" />
      <circle cx={cx} cy={cy} r={5} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.25} />
    </g>
  )
}

export default function ScatterHX({ data = [], unit = 'cm', title = 'h vs x' }) {
  const containerRef = useRef(null)

  // Normaliza y filtra datos numéricos
  const cleaned = useMemo(() => {
    return data
      .map(d => ({
        h: Number(typeof d?.h === 'string' ? d.h.replace(',', '.') : d?.h),
        x: Number(typeof d?.x === 'string' ? d.x.replace(',', '.') : d?.x),
      }))
      .filter(d => Number.isFinite(d.h) && Number.isFinite(d.x))
  }, [data])

  const unitLabel = formatUnitLabel(unit)

  // Dominios con pequeño padding
  const domainX = useMemo(() => {
    if (cleaned.length === 0) return [0, 1]
    const xs = cleaned.map(d => d.x)
    const min = Math.min(...xs, 0)
    const max = Math.max(...xs, 1)
    const pad = (max - min) * 0.08 || 0.2
    return [Math.max(0, min - pad), max + pad]
  }, [cleaned])

  const domainY = useMemo(() => {
    if (cleaned.length === 0) return [0, 1]
    const ys = cleaned.map(d => d.h)
    const min = Math.min(...ys, 0)
    const max = Math.max(...ys, 1)
    const pad = (max - min) * 0.08 || 0.2
    return [Math.max(0, min - pad), max + pad]
  }, [cleaned])

  // Exportación a PNG a partir del SVG
  const handleExportPNG = async () => {
    try {
      const wrapper = containerRef.current
      if (!wrapper) return
      const svg = wrapper.querySelector('svg')
      if (!svg) return

      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svg)
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const bbox = svg.getBoundingClientRect()
        const ratio = window.devicePixelRatio || 1
        canvas.width = Math.max(1, Math.floor(bbox.width * ratio))
        canvas.height = Math.max(1, Math.floor(bbox.height * ratio))
        const ctx = canvas.getContext('2d')
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, bbox.width, bbox.height)

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return
          const a = document.createElement('a')
          a.href = URL.createObjectURL(pngBlob)
          a.download = `grafica_hx_${Date.now()}.png`
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(a.href)
          URL.revokeObjectURL(url)
        }, 'image/png')
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        alert('No se pudo exportar la gráfica.')
      }
      img.src = url
    } catch {
      alert('No se pudo exportar la gráfica.')
    }
  }

  return (
    <div>
      <div className="chart-title">
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div className="push-right">
          <button className="btn btn-secondary" onClick={handleExportPNG} disabled={cleaned.length === 0}>
            Exportar PNG
          </button>
        </div>
      </div>

      <div ref={containerRef} className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 12, left: 10 }}>
            <CartesianGrid strokeOpacity={0.18} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Distancia"
              domain={domainX}
              tickMargin={6}
              tickFormatter={(v) => `${roundAuto(v, unit === 'cm' ? 2 : 3)}`}
              label={{ value: `x (${unitLabel})`, position: 'insideBottom', offset: -8 }}
            />
            <YAxis
              type="number"
              dataKey="h"
              name="Altura"
              domain={domainY}
              tickMargin={6}
              tickFormatter={(v) => `${roundAuto(v, unit === 'cm' ? 2 : 3)}`}
              label={{ value: `h (${unitLabel})`, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value, name) => {
                const dp = unit === 'cm' ? 3 : 4
                return [Number(value).toFixed(dp), name === 'x' ? `x (${unitLabel})` : `h (${unitLabel})`]
              }}
              labelFormatter={() => ''}
              cursor={{ strokeOpacity: 0.12 }}
            />
            <Scatter data={cleaned} shape={<ScatterDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
