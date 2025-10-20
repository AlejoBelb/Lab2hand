// Vista del recipiente: lateral en SVG con tamaño visual constante (alto/ancho fijos),
// regla vertical, agua y chorro. La escala se calcula SOLO con H (altura).
import React, { useMemo } from 'react'

export default function SimulationTank({
  unit, height, diameter, holeDiameter, level, isDraining, visible, showRuler
}) {
  // Valores en cm para la geometría/física
  const H_cm  = unit === 'm' ? (Number(height) || 0) * 100 : Number(height) || 0
  const D_cm  = unit === 'm' ? (Number(diameter) || 0) * 100 : Number(diameter) || 0
  const do_cm = unit === 'm' ? (Number(holeDiameter) || 0) * 100 : Number(holeDiameter) || 0
  const level_cm = unit === 'm' ? (Number(level) || 0) * 100 : Number(level) || 0

  // Salvaguardas
  const SAFE_H = Math.max(5, H_cm || 0)
  const SAFE_D = Math.max(5, D_cm || 0)

  // Tamaño VISUAL constante del tanque (no cambia con H ni D)
  const FIXED_TANK_HEIGHT_PX = 420
  const FIXED_TANK_WIDTH_PX  = 420

  // Escala SOLO con H: px por cm para posiciones verticales, agua y chorro
  const PX_PER_CM = FIXED_TANK_HEIGHT_PX / SAFE_H

  // Dimensiones del tanque en px (fijas)
  const tankHeightPx = FIXED_TANK_HEIGHT_PX
  const tankWidthPx  = FIXED_TANK_WIDTH_PX

  // Soporte y margen suelo (geométricamente medidos en cm → px con la misma escala vertical)
  const supportHeightCm = 5
  const supportHeightPx = supportHeightCm * PX_PER_CM
  const groundMarginPx  = 40

  // Posición del tanque (más margen si hay regla)
  const leftMargin = showRuler ? 80 : 40
  const tankX = leftMargin
  const tankY = groundMarginPx

  // Agujero (en la pared derecha, punto más bajo)
  // OJO: el tamaño del agujero do se escala con la MISMA escala vertical
  const holeRadiusPx = Math.max(3, Math.round((do_cm / 2) * PX_PER_CM))
  const holeCx = tankX + tankWidthPx - holeRadiusPx - 2
  const holeCy = tankY + tankHeightPx - holeRadiusPx - 2

  // Nivel actual del agua (px)
  const levelPx = Math.max(0, Math.min(level_cm * PX_PER_CM, tankHeightPx))
  const waterY  = tankY + (tankHeightPx - levelPx)

  // Física del chorro (en cm; independiente del dibujo)
  const g_cm = 981
  const h_cm = Math.max(0, level_cm)
  const y0_cm = supportHeightCm
  const v_cm_s = Math.sqrt(2 * g_cm * h_cm)
  const t_fall = Math.sqrt((2 * y0_cm) / g_cm)
  const x_cm   = v_cm_s * t_fall

  // Puntos del chorro en px (usando escala vertical PX_PER_CM)
  const jetPointsAbs = useMemo(() => {
    if (!isDraining || h_cm <= 0) return []
    const N = 28
    const pts = []
    for (let i = 0; i <= N; i++) {
      const tt = (t_fall * i) / N
      const dx = (v_cm_s * tt) * PX_PER_CM       // usamos la MISMA escala para consistencia visual
      const dy = (0.5 * g_cm * tt * tt) * PX_PER_CM
      pts.push([holeCx + dx, holeCy + dy])
    }
    return pts
  }, [isDraining, h_cm, t_fall, v_cm_s, holeCx, holeCy, PX_PER_CM, g_cm])

  // Dimensiones del SVG: tanque (fijo) + espacio a la derecha para el chorro
  const rightExtra = Math.max(260, x_cm * PX_PER_CM + 60)
  const svgWidth  = tankX + tankWidthPx + rightExtra
  const svgHeight = tankY + tankHeightPx + supportHeightPx + 30

  // Etiquetas
  const labels = useMemo(() => ({
    H:  `${H_cm.toFixed(1)} cm`,
    D:  `${SAFE_D.toFixed(1)} cm`,     // se muestra pero NO cambia el ancho visual
    DO: `${do_cm.toFixed(2)} cm`,
    LV: `${level_cm.toFixed(2)} cm`
  }), [H_cm, SAFE_D, do_cm, level_cm])

  // Regla vertical (en px, misma escala PX_PER_CM)
  const rulerX = tankX - 20
  const rulerTopY = tankY
  const rulerBottomY = tankY + tankHeightPx
  const rulerTicks = useMemo(() => {
    if (!showRuler) return []
    const ticks = []
    for (let cm = 0; cm <= SAFE_H; cm += 5) {
      const y = rulerBottomY - cm * PX_PER_CM
      const len = (cm % 10 === 0) ? 12 : 8
      const label = (cm % 10 === 0) ? `${cm} cm` : null
      ticks.push({ y, len, label })
    }
    return ticks
  }, [showRuler, SAFE_H, rulerBottomY, PX_PER_CM])

  return (
    <div className={`${!visible ? 'fade-out' : ''}`}>
      <div className="view-box">
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="rgba(59,130,246,0.70)" />
              <stop offset="100%" stopColor="rgba(37,99,235,0.60)" />
            </linearGradient>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.35)" />
            </filter>
          </defs>

          {/* Regla graduada */}
          {showRuler && (
            <>
              <line x1={rulerX} y1={rulerTopY} x2={rulerX} y2={rulerBottomY} stroke="#64748b" strokeWidth="2" />
              {rulerTicks.map((t, i) => (
                <g key={i}>
                  <line x1={rulerX - t.len} y1={t.y} x2={rulerX} y2={t.y} stroke="#94a3b8" strokeWidth="2" />
                  {t.label && (
                    <text x={rulerX - t.len - 6} y={t.y + 4} textAnchor="end" fill="#cbd5e1" fontSize="12px" fontFamily="Inter, system-ui, sans-serif">
                      {t.label}
                    </text>
                  )}
                </g>
              ))}
            </>
          )}

          {/* Piso */}
          <line
            x1="0"
            y1={tankY + tankHeightPx + supportHeightPx}
            x2={svgWidth - 20}
            y2={tankY + tankHeightPx + supportHeightPx}
            stroke="var(--border)"
            strokeWidth="6"
          />

          {/* Soporte */}
          <rect
            x={tankX}
            y={tankY + tankHeightPx}
            width={tankWidthPx}
            height={supportHeightPx}
            fill="#182235"
            stroke="var(--border)"
            filter="url(#soft)"
            rx="6"
          />

          {/* Pared del tanque (ancho y alto fijos) */}
          <rect
            x={tankX}
            y={tankY}
            width={tankWidthPx}
            height={tankHeightPx}
            fill="rgba(0,0,0,0.06)"
            stroke="#3a4a63"
            strokeWidth="2"
          />

          {/* Agua (nivel escala solo con H) */}
          <rect
            x={tankX + 1}
            y={waterY}
            width={tankWidthPx - 2}
            height={levelPx}
            fill="url(#waterFill)"
            stroke="rgba(96,165,250,0.90)"
          />

          {/* Línea de nivel */}
          <line
            x1={tankX + 1}
            y1={waterY}
            x2={tankX + tankWidthPx - 1}
            y2={waterY}
            stroke="#a5b4fc"
            strokeWidth="2"
          />

          {/* Etiqueta de nivel */}
          <text
            x={tankX + tankWidthPx + 10}
            y={Math.max(tankY + 12, Math.min(waterY - 6, tankY + tankHeightPx - 6))}
            fill="#cbd5e1"
            fontSize="12px"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {`h = ${labels.LV}`}
          </text>

          {/* Agujero (tamaño en px según do y misma escala vertical) */}
          <circle
            cx={holeCx}
            cy={holeCy}
            r={holeRadiusPx}
            fill="#1e293b"
            stroke="#0ea5e9"
            strokeWidth="2"
          />

          {/* Chorro (px calculados con PX_PER_CM) */}
          {isDraining && h_cm > 0 && jetPointsAbs.length > 1 && (
            <polyline
              points={jetPointsAbs.map(p => `${p[0]},${p[1]}`).join(' ')}
              fill="none"
              stroke="#93c5fd"
              strokeWidth="3"
              strokeDasharray="6 6"
              opacity="0.95"
            />
          )}

          {/* Encabezado */}
          <text
            x={tankX}
            y={tankY - 10}
            fill="#cbd5e1"
            fontSize="12px"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {`Vista lateral — H = ${labels.H} — D = ${labels.D} — do = ${labels.DO} — nivel = ${labels.LV}`}
          </text>
        </svg>
      </div>
    </div>
  )
}
