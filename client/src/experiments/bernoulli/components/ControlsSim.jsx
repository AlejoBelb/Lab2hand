import React, { useMemo, useState } from "react";

/* Controles de simulación (Bernoulli/Torricelli)
   - Factor de velocidad como slider (range 0–200, step 1)
   - Validación: autoIntervalSec numérico y no negativo
   - Botones de captura automática con textos actualizados
   - Estado y toggles conservados
*/
export default function ControlsSim({
  canFill,
  canStartDrain,
  canCapture,
  onFill,
  onStartDrain,
  onCapture,
  onReset,

  speedFactor,
  onSpeedChange,

  showRuler,
  onToggleRuler,

  paused,
  onTogglePause,
  canTogglePause,

  autoCaptureActive,
  autoIntervalSec,
  onChangeAutoInterval,
  onStartAutoCapture,
  onStopAutoCapture,

  isDraining,
}) {
  // Estado de avisos
  const [errInterval, setErrInterval] = useState("");

  // Utilidades
  const isNum = (v) => Number.isFinite(Number(v));
  const toNumOr = (v, def = 0) => (isNum(v) ? Number(v) : def);

  // onBlur: fuerza no-negativos y numérico para el intervalo
  const blurNonNegative = (value, setExternal, setErr, label) => {
    if (!isNum(value)) {
      setErr(`Entrada no válida: se requiere un número para ${label}`);
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

  // Reglas UI derivadas
  const autoCanStart = useMemo(() => {
    const t = toNumOr(autoIntervalSec, 0);
    return !autoCaptureActive && isDraining && !paused && t > 0;
  }, [autoCaptureActive, isDraining, paused, autoIntervalSec]);

  const autoCanStop = useMemo(() => autoCaptureActive, [autoCaptureActive]);

  // Valor numérico seguro para el slider
  const speedVal = useMemo(() => {
    const v = toNumOr(speedFactor, 0);
    if (v < 0) return 0;
    if (v > 200) return 200;
    return Math.round(v);
  }, [speedFactor]);

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-header">
        <h2 style={{ margin: 0 }}>Controles de simulación</h2>
      </div>

      <div className="card-body">
        <div className="controls-row">
          <button className="primary" disabled={!canFill} onClick={onFill} title="Llenar">
            Llenar
          </button>

          <button className="primary" disabled={!canStartDrain} onClick={onStartDrain} title="Iniciar vaciado">
            Iniciar
          </button>

          <button disabled={!canCapture} onClick={onCapture} title="Capturar estado instantáneo">
            Capturar
          </button>

          <button className="ghost" onClick={onReset} title="Reiniciar simulación">
            Reiniciar
          </button>

          <button
            className={canTogglePause ? "" : "ghost"}
            disabled={!canTogglePause}
            onClick={onTogglePause}
            title="Pausar/Reanudar"
          >
            {paused ? "Reanudar" : "Pausar"}
          </button>

          <button className="ghost" onClick={onToggleRuler}>
            {showRuler ? "Ocultar regla" : "Mostrar regla"}
          </button>
        </div>

        <hr className="sep" />

        <div className="controls-row" style={{ alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label className="label-inline" htmlFor="speed-slider">Factor de velocidad</label>
          <input
            id="speed-slider"
            type="range"
            min={0}
            max={200}
            step={1}
            value={speedVal}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="input-inline"
            aria-label="Factor de velocidad"
            style={{ width: 240 }}
          />
          <span className="small mono">{speedVal}×</span>
        </div>

        <div className="controls-row">
          <label className="label-inline">Captura automática cada</label>
          <input
            type="number"
            value={autoIntervalSec}
            onChange={(e) => onChangeAutoInterval(e.target.value)}
            onBlur={() =>
              blurNonNegative(
                autoIntervalSec,
                (v) => onChangeAutoInterval(v),
                setErrInterval,
                "Intervalo (s)"
              )
            }
            step="any"
            min="0"
            className="input-inline"
          />
          <span className="small mono">s</span>

          <button disabled={!autoCanStart} onClick={onStartAutoCapture}>
            Iniciar captura automática
          </button>
          <button disabled={!autoCanStop} onClick={onStopAutoCapture}>
            Detener captura automática
          </button>
        </div>
        {errInterval && <div className="small" style={{ color: "#f59e0b" }}>{errInterval}</div>}

        <p className="small mono" style={{ marginTop: 8 }}>
          {autoIntervalSec === 0 || autoIntervalSec === "0"
            ? "La captura automática requiere un intervalo > 0 s."
            : "Atajos: C = Capturar, P = Pausar/Reanudar, R = Reiniciar."}
        </p>
      </div>
    </div>
  );
}
