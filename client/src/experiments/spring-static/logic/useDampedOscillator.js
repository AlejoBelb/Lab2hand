// client/src/experiments/spring-static/logic/useDampedOscillator.js
import { useEffect, useRef, useState } from "react";

/*
# Integrador masa–resorte con amortiguamiento + tope elástico suave (compresión)
# Ecuación base (x hacia abajo, 0 en longitud "sin carga"):
#     m*x'' = -k*(x - xEq) - c*x' + F_stop(x, x')
#
# Donde:
#   - xEq = (m*g)/k es la extensión de equilibrio (hacia abajo).
#   - F_stop actúa SOLO cuando x_rel = (x - xEq) < xRelMin (compresión excesiva).
#   - F_stop = kStop * softPlus(xRelMin - x_rel) - cStop * min(0, x')   [empuja hacia abajo y amortigua la subida]
#
# softPlus(z) ≈ relu(z) pero suave y derivable:
#     softPlus(z) = 0.5 * (z + sqrt(z*z + eps*eps))
#
# Notas:
#   - El tope es "elástico": no un clamp duro; genera una fuerza creciente.
#   - Relación por defecto: xRelMin = relMin * xEq (relMin < 0), p.ej. relMin = -0.5 → permite comprimir hasta ~50% de xEq.
#   - kStop y cStop son múltiplos de k y c para que el tope sea firme pero estable numéricamente.
#   - Integración semi-implícita (symplectic Euler) con sub-pasos a 60 Hz aprox.
*/

export default function useDampedOscillator({
  m,
  k,
  c,
  xEq,
  x0,
  v0,
  dt = 1 / 60,
  autoStopThreshold = 1e-6,
  autoStopVel = 1e-6,
  autoStopFrames = 36,
  autoStopTime = 0,
  hardStop = {
    enabled: true,   // activar tope elástico
    relMin: -0.5,    // xRelMin = relMin * xEq (negativo → compresión máxima permitida)
    kMult: 12,       // kStop = kMult * k
    cMult: 2,        // cStop = cMult * c
    eps: 1e-6,       // suavizado de softPlus
  },
}) {
  const mass = Math.max(1e-9, Number(m) || 0);
  const stiff = Math.max(1e-9, Number(k) || 0);
  const damp = Math.max(0, Number(c) || 0);
  const xEq_val = Number(xEq) || 0;

  const xRef = useRef(Number.isFinite(x0) ? x0 : xEq_val);
  const vRef = useRef(Number.isFinite(v0) ? v0 : 0);
  const tRef = useRef(0);

  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const accRef = useRef(0);

  const [stateX, setStateX] = useState(xRef.current);
  const [running, setRunning] = useState(false);

  const framesNearEqRef = useRef(0);

  // Utilidad: softPlus suave tipo ReLU para penetración positiva
  const softPlus = (z, eps) => {
    // 0.5*(z + sqrt(z^2 + eps^2))  → ~max(z,0) pero suave
    const zz = z * z + eps * eps;
    return 0.5 * (z + Math.sqrt(zz));
  };

  // Paso de integración (semi-implícito)
  const step = (h) => {
    const x = xRef.current;
    const v = vRef.current;

    // Fuerza del resorte lineal + amortiguamiento viscoso
    // F_spring = -k*(x - xEq) - c*v
    let F = -stiff * (x - xEq_val) - damp * v;

    // Tope elástico (solo compresión excesiva)
    if (hardStop?.enabled) {
      const relMin = Number(hardStop.relMin ?? -0.5);
      const xRel = x - xEq_val;
      const xRelMin = relMin * xEq_val; // negativo

      if (xRel < xRelMin) {
        const kStop = (hardStop.kMult ?? 12) * stiff;
        const cStop = (hardStop.cMult ?? 2) * (damp > 0 ? damp : Math.sqrt(stiff * mass));
        const eps = Math.max(1e-12, hardStop.eps ?? 1e-6);

        // Penetración (positiva) medida respecto al umbral
        const pen = xRelMin - xRel; // > 0
        const penSoft = softPlus(pen, eps);

        // Empuje hacia abajo + disipación cuando la velocidad es ascendente (v<0)
        // Signos: x hacia abajo. Si xRel<xRelMin (demasiada compresión), se quiere F positiva (hacia abajo).
        const vUp = Math.min(0, v); // solo amortiguar cuando sube
        F += kStop * penSoft - cStop * vUp;
      }
    }

    // Aceleración y actualización (semi-implícito)
    const a = F / mass;
    const vNext = v + a * h;
    const xNext = x + vNext * h;

    xRef.current = xNext;
    vRef.current = vNext;
    tRef.current += h;

    // Auto-parada cuando se estabiliza
    const nearEq =
      Math.abs(xNext - xEq_val) < autoStopThreshold &&
      Math.abs(vNext) < autoStopVel &&
      tRef.current > autoStopTime;

    framesNearEqRef.current = nearEq ? framesNearEqRef.current + 1 : 0;

    if (framesNearEqRef.current >= autoStopFrames) {
      runningRef.current = false;
    }
  };

  const loop = (ts) => {
    if (!runningRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setRunning(false);
      return;
    }
    if (!accRef.current) accRef.current = 0;
    const now = ts / 1000;
    const last = accRef.current || now;
    const dtReal = Math.min(0.05, Math.max(0, now - last));
    accRef.current = now;

    // Sub-pasos fijos ~dt
    let acc = dtReal;
    const h = dt;
    const Nmax = 5;
    let n = 0;
    while (acc > 0 && n < Nmax) {
      const stepH = Math.min(h, acc);
      step(stepH);
      acc -= stepH;
      n++;
    }

    setStateX(xRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  // Comenzar un impulso en el equilibrio (o en x0 dado)
  const startImpulse = ({ x0: x0in, v0: v0in }) => {
    xRef.current = Number.isFinite(x0in) ? x0in : xEq_val;
    vRef.current = Number.isFinite(v0in) ? v0in : 0;
    tRef.current = 0;
    framesNearEqRef.current = 0;
    if (!runningRef.current) {
      runningRef.current = true;
      setRunning(true);
      accRef.current = 0;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  // Limpieza
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return {
    x: stateX,
    running,
    startImpulse,
  };
}
