// client/src/experiments/bernoulli/components/TankView.jsx
import React from "react";
import "../styles/tank.css";

/**
 * Dibuja el tanque en una vista lateral, de forma responsiva.
 * Unidades esperadas de props: cm.
 *
 * Props:
 * - H: altura interior del recipiente [cm]
 * - D: diámetro interior (ancho) del recipiente [cm]
 * - doValue: diámetro del orificio [cm]
 * - h: nivel actual del agua [cm] (0 abajo, H arriba)
 * - showRule: boolean — para mostrar/ocultar la regla
 */
export default function TankView({ H, D, doValue, h, showRule }) {
  // Márgenes en "unidades del viewBox" (usamos cm como unidad virtual)
  const margin = 5;

  // Definición del tanque (alto y ancho internos en cm)
  const tankH = Math.max(5, Number(H) || 0);
  const tankW = Math.max(5, Number(D) || 0);

  // ViewBox en función de H y D más márgenes
  const vbX = 0;
  const vbY = 0;
  const vbW = tankW + margin * 2 + 10;
  const vbH = tankH + margin * 2 + 20;

  // Paredes del tanque
  const xTank = margin + 10;
  const yTank = margin + 10;

  // Nivel actual (h no puede ser negativo ni mayor que H)
  const level = Math.max(0, Math.min(Number(h) || 0, tankH));

  // Orificio (doValue)
  const do_cm = Math.max(0, Number(doValue) || 0);
  const holeRadius = Math.max(0.2, do_cm / 2);
  const holeCx = xTank + tankW - holeRadius - 0.5;
  const holeCy = yTank + tankH - holeRadius - 0.5;

  // Regla (si se solicita)
  const ticks = [];
  if (showRule) {
    for (let v = 0; v <= tankH; v += 1) {
      const y = yTank + (tankH - v);
      ticks.push({ y, v });
    }
  }

  return (
    <div className="tankPanel">
      <div className="tankHeader">
        Vista lateral — H = {H.toFixed(2)} cm — D = {D.toFixed(2)} cm — d
        <sub>o</sub> = {doValue.toFixed(2)} cm — nivel = {h.toFixed(2)} cm
      </div>

      <svg
        className="tankSvg"
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Fondo */}
        <rect className="panelBg" x="0" y="0" width={vbW} height={vbH} rx="2" ry="2" />

        {/* Suelo */}
        <line className="ground" x1="0" y1={yTank + tankH + 8} x2={vbW} y2={yTank + tankH + 8} />

        {/* Regla lateral */}
        {showRule && (
          <g className="rule">
            <line x1={xTank - 6} y1={yTank} x2={xTank - 6} y2={yTank + tankH} />
            {ticks.map((t, i) => (
              <g key={i}>
                <line x1={xTank - 8} y1={t.y} x2={xTank - 4} y2={t.y} />
                {(i % 5 === 0) && (
                  <text x={xTank - 10} y={t.y + 1.8} textAnchor="end" className="tickLabel">
                    {ticks[i].v}
                  </text>
                )}
              </g>
            ))}
            <text x={xTank - 10} y={yTank - 4} textAnchor="end" className="axisLabel">cm</text>
          </g>
        )}

        {/* Paredes del tanque */}
        <rect
          className="tankBody"
          x={xTank}
          y={yTank}
          width={tankW}
          height={tankH}
          rx="1.5"
          ry="1.5"
        />

        {/* Agua */}
        <rect
          className="water"
          x={xTank}
          y={yTank + (tankH - level)}
          width={tankW}
          height={level}
        />

        {/* Orificio */}
        <circle className="hole" cx={holeCx} cy={holeCy} r={holeRadius} />

        {/* Chorro guía (segmento) */}
        <line
          className="jet"
          x1={holeCx}
          y1={holeCy}
          x2={holeCx + Math.max(3, do_cm * 2)}
          y2={holeCy + Math.max(2, do_cm)}
        />
      </svg>
    </div>
  );
}
