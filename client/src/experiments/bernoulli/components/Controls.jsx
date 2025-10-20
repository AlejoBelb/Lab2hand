import React, { useState } from "react";

/* Controles de parámetros del recipiente (Bernoulli/Torricelli)
   - Valida tipo numérico y prohíbe negativos en height, diameter y holeDiameter
   - Ajusta a 0 en onBlur si el valor es negativo o no numérico
   - Muestra mensajes de aviso consistentes con el resto de la app
*/
export default function Controls({
  unit,
  height,
  diameter,
  holeDiameter,
  onUnitChange,
  onHeightChange,
  onDiameterChange,
  onHoleDiameterChange,
}) {
  // Estado de avisos por campo
  const [errH, setErrH] = useState("");
  const [errD, setErrD] = useState("");
  const [errDo, setErrDo] = useState("");

  // Utilidades de validación de tipo
  const isNum = (v) => Number.isFinite(Number(v));

  // onBlur genérico: fuerza no-negativos y numérico
  const blurNonNegative = (value, setExternal, setErr, label) => {
    if (!isNum(value)) {
      setErr(`Entrada no válida: se requiere un número para ${label}`);
      // No cambia el valor aquí; el usuario verá el aviso hasta corregir
      return;
    }
    const num = Number(value);
    if (num < 0) {
      setExternal(0);
      setErr(`${label} no puede ser negativo; se ajustó a 0`);
    } else {
      setErr("");
    }
  };

  // Etiqueta de unidad de longitud según selección
  const lenLabel = unit === "cm" ? "cm" : "m";

  return (
    <div className="grid-1">
      <div className="controls-row">
        <label className="label-inline">Unidad</label>
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="input-inline"
        >
          <option value="cm">cm</option>
          <option value="m">m</option>
        </select>
      </div>

      <div className="controls-row">
        <label className="label-inline">Altura inicial h</label>
        <input
          type="number"
          value={height}
          onChange={(e) => onHeightChange(e.target.value)}
          onBlur={() => blurNonNegative(height, (v) => onHeightChange(v), setErrH, "h")}
          step="any"
          min="0"
          className="input-inline"
        />
        <span className="small mono">{lenLabel}</span>
      </div>
      {errH && <div className="small" style={{ color: "#f59e0b" }}>{errH}</div>}

      <div className="controls-row">
        <label className="label-inline">Diámetro del tanque D</label>
        <input
          type="number"
          value={diameter}
          onChange={(e) => onDiameterChange(e.target.value)}
          onBlur={() => blurNonNegative(diameter, (v) => onDiameterChange(v), setErrD, "D")}
          step="any"
          min="0"
          className="input-inline"
        />
        <span className="small mono">{lenLabel}</span>
      </div>
      {errD && <div className="small" style={{ color: "#f59e0b" }}>{errD}</div>}

      <div className="controls-row">
        <label className="label-inline">Diámetro del orificio d₀</label>
        <input
          type="number"
          value={holeDiameter}
          onChange={(e) => onHoleDiameterChange(e.target.value)}
          onBlur={() => blurNonNegative(holeDiameter, (v) => onHoleDiameterChange(v), setErrDo, "d₀")}
          step="any"
          min="0"
          className="input-inline"
        />
        <span className="small mono">{lenLabel}</span>
      </div>
      {errDo && <div className="small" style={{ color: "#f59e0b" }}>{errDo}</div>}

      <p className="small mono">
        h = {height || 0} {lenLabel} · D = {diameter || 0} {lenLabel} · d₀ = {holeDiameter || 0} {lenLabel}
      </p>
    </div>
  );
}
