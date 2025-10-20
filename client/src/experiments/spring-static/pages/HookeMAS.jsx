// client/src/experiments/spring-static/pages/HookeMAS.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import useDampedOscillator from "../logic/useDampedOscillator";
import "../styles/hooke.css";

/*
# MAS dinámico con:
# - Rebote físico y tope elástico suave desde el integrador.
# - Amortiguamiento leve (zeta=0.03) para decaimiento natural.
# - Gráfica cartesiana x_rel(t) centrada en 0 con:
#     • Trazo más fuerte de la señal.
#     • Rejilla y línea de cero más tenues.
#     • Zoom Ctrl+rueda (capturado con passive:false) y paneo por arrastre.
#     • Doble clic: restablecer vista y auto-follow (ventana 30 s).
# - Botón Reiniciar: reinicia gráfica y sistema (borra línea roja inferior).
# - Exportar:
#     • PNG de la gráfica (habilitado solo cuando la oscilación se detuvo).
#     • Datos x–t como HTML estilizado y como CSV.
*/

export default function HookeMAS({ open, onClose, onEditParams, params }) {
  if (!open) return null;

  const [showFx, setShowFx] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowFx(false), 520);
    return () => clearTimeout(t);
  }, []);

  const [view, setView] = useState("params");

  // Semillas desde Spring static
  const seedMassUnit = params?.massUnit === "kg" || params?.massUnit === "g" ? params.massUnit : "g";
  const seedLenUnit = params?.lenUnit === "m" || params?.lenUnit === "cm" ? params.lenUnit : "cm";

  // Parámetros MAS (independientes)
  const [masMassUnit, setMasMassUnit] = useState(seedMassUnit);
  const [masLenUnit, setMasLenUnit] = useState(seedLenUnit);
  const [masMValue, setMasMValue] = useState(typeof params?.massValue === "number" ? params.massValue : 200);
  const [masK, setMasK] = useState(typeof params?.k === "number" ? params.k : 50);
  const [masG, setMasG] = useState(typeof params?.g === "number" ? params.g : 9.81);
  const [masL0, setMasL0] = useState(typeof params?.L0 === "number" ? params.L0 : 30);

  const isNum = (v) => Number.isFinite(Number(v));
  const toNumOr = (v, d = 0) => (isNum(v) ? Number(v) : d);

  // Conversión a SI
  const masMkg = useMemo(
    () => (masMassUnit === "g" ? Math.max(0, toNumOr(masMValue, 0)) / 1000 : Math.max(0, toNumOr(masMValue, 0))),
    [masMValue, masMassUnit]
  );
  const masL0_m = useMemo(
    () => (masLenUnit === "cm" ? Math.max(0, toNumOr(masL0, 0)) / 100 : Math.max(0, toNumOr(masL0, 0))),
    [masL0, masLenUnit]
  );

  const safeK = useMemo(() => Math.max(1e-9, toNumOr(masK, 0)), [masK]);
  const safeM = useMemo(() => Math.max(1e-6, masMkg), [masMkg]);
  const safeG = useMemo(() => Math.max(0, toNumOr(masG, 0)), [masG]);

  // Equilibrio
  const xEq_m = useMemo(() => (safeM * safeG) / safeK, [safeM, safeG, safeK]);

  // Geometría visual del sistema
  const viz = useMemo(
    () => ({
      w: 560,
      h: 720,
      topPadding: 30,
      left: 280,
      coils: 12,
      amp: 22,
      ceilingH: 14,
      hookLen: 12,
      blockW: 112,
      blockH: 78,
      pxPerUIBase: 8,
    }),
    []
  );
  const springTopY = viz.topPadding + viz.ceilingH + viz.hookLen;

  // Amortiguamiento leve
  const zeta = 0.03;
  const c_visc = useMemo(() => 2 * zeta * Math.sqrt(safeK * safeM), [zeta, safeK, safeM]);

  // Integrador físico con tope elástico suave
  const { x: x_m, running, startImpulse } = useDampedOscillator({
    m: safeM,
    k: safeK,
    c: c_visc,
    xEq: xEq_m,
    x0: xEq_m,
    v0: 0,
    dt: 1 / 60,
    autoStopThreshold: 1e-5,
    autoStopVel: 1e-5,
    autoStopFrames: 36,
    autoStopTime: 0,
  });

  // Elongación actual en UI y relativa
  const elong_UI = useMemo(() => {
    const xNow = running ? x_m : xEq_m;
    return masLenUnit === "cm" ? xNow * 100 : xNow;
  }, [running, x_m, xEq_m, masLenUnit]);

  const xEq_UI = useMemo(() => (masLenUnit === "cm" ? xEq_m * 100 : xEq_m), [xEq_m, masLenUnit]);
  const xRel_UI = elong_UI - xEq_UI;

  // Zoom del sistema
  const maxForceN_est = useMemo(() => Math.max(8, 6 * safeM * safeG), [safeM, safeG]);
  const [lastV0, setLastV0] = useState(0);
  const omega = useMemo(() => Math.sqrt(safeK / safeM), [safeK, safeM]);

  const expectedMaxX_m = useMemo(() => {
    const dtPulse = 0.28;
    const v0_fallback = (maxForceN_est * dtPulse) / safeM;
    const predLast = xEq_m + Math.max(0, lastV0) / Math.max(1e-6, omega);
    const predFallback = xEq_m + v0_fallback / Math.max(1e-6, omega);
    const est = Math.max(predLast, predFallback);
    const padAbs = 0.02 * Math.max(0.05, est);
    const padRel = 0.12 * est;
    return est + Math.max(padAbs, padRel);
  }, [xEq_m, lastV0, omega, maxForceN_est, safeM]);

  // Escala del sistema
  const L0_ui = useMemo(() => Math.max(0, toNumOr(masL0, 0)), [masL0]);
  const pxPerUI = useMemo(() => {
    const bottomPadPx = viz.blockH + 64;
    const availH = viz.h - (viz.topPadding + viz.ceilingH + viz.hookLen) - bottomPadPx;
    const xMax_ui = masLenUnit === "cm" ? expectedMaxX_m * 100 : expectedMaxX_m;
    const neededUI = Math.max(10, L0_ui + xMax_ui);
    const scale = Math.min(viz.pxPerUIBase, Math.max(1.2, availH / neededUI));
    return scale;
  }, [viz, L0_ui, expectedMaxX_m, masLenUnit]);

  // Longitudes y posiciones
  const totalLenUI_raw = useMemo(() => L0_ui + elong_UI, [L0_ui, elong_UI]);
  const minSpringLenPx = 28;
  const springLenPxRaw = totalLenUI_raw * pxPerUI;
  const springLenPx = Math.max(minSpringLenPx, springLenPxRaw);
  const springBottomY = springTopY + springLenPx;

  // Path del resorte
  const springPath = useMemo(() => {
    const points = [];
    const dx = viz.amp;
    const x0 = viz.left;
    const y0 = springTopY;
    const y1 = springBottomY;
    points.push([x0, y0 - viz.hookLen / 2]);
    points.push([x0, y0]);
    const usableLen = Math.max(10, y1 - y0 - 6);
    const step = usableLen / (viz.coils * 2);
    let x = x0, y = y0;
    for (let i = 0; i < viz.coils * 2; i++) {
      x = i % 2 === 0 ? x0 - dx : x0 + dx;
      y += step;
      points.push([x, y]);
    }
    points.push([x0, y1]);
    return "M " + points.map(([px, py]) => `${px},${py}`).join(" L ");
  }, [viz, springTopY, springBottomY]);

  // Bloque
  const blockTopY = springBottomY + 6;
  const blockX = viz.left - viz.blockW / 2;
  const blockY = blockTopY;

  // Líneas guía
  const systemX1 = 50;
  const systemX2 = viz.w - 50;
  const elongLenUI_eq = useMemo(() => (masLenUnit === "cm" ? xEq_m * 100 : xEq_m), [xEq_m, masLenUnit]);
  const yReposo = springTopY + (L0_ui + elongLenUI_eq) * pxPerUI;

  const [maxX_m, setMaxX_m] = useState(null);
  useEffect(() => {
    if (running) {
      setMaxX_m((prev) => {
        const cur = x_m;
        const onlyExtension = Math.max(0, cur);
        if (prev == null) return onlyExtension;
        return onlyExtension > prev ? onlyExtension : prev;
      });
    }
  }, [running, x_m]);

  const yMaxExt = useMemo(() => {
    if (maxX_m == null) return null;
    const x_ui = masLenUnit === "cm" ? maxX_m * 100 : maxX_m;
    const L_ui = L0_ui + x_ui;
    return springTopY + L_ui * pxPerUI;
  }, [maxX_m, masLenUnit, L0_ui, springTopY, pxPerUI]);

  // Panel de fuerza
  const [appliedForceN, setAppliedForceN] = useState(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const holdRef = useRef(false);
  const lastTsRef = useRef(0);
  const fillRatePerSec = 0.24;

  // Gráfica
  const WINDOW_SEC = 30;
  const [series, setSeries] = useState([]); // {t, xr}
  const t0Ref = useRef(null);
  const rafPlotRef = useRef(null);
  const [plotActive, setPlotActive] = useState(false);

  // Ref del SVG de la gráfica para exportar imagen
  const graphSvgRef = useRef(null);

  const stepHold = (ts) => {
    if (!holdRef.current) return;
    const last = lastTsRef.current || ts;
    const dt = Math.max(0, (ts - last) / 1000);
    lastTsRef.current = ts;
    setProgress((p) => Math.min(1, p + dt * fillRatePerSec));
    rafRef.current = requestAnimationFrame(stepHold);
  };

  const startHold = () => {
    setAppliedForceN(null);
    holdRef.current = true;
    lastTsRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(stepHold);
  };

  const endHold = () => {
    if (!holdRef.current) return;
    holdRef.current = false;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    const F = round(progress * maxForceN_est, 3);
    setAppliedForceN(F);

    if (F > 0.02 * maxForceN_est) {
      const dtPulse = 0.28;
      const v0 = (F * dtPulse) / safeM;

      setLastV0(v0);
      setMaxX_m(null);

      startImpulse({ x0: xEq_m, v0 });

      resetGraph();
      setPlotActive(true);
      setUserAdjusted(false);
    }

    setTimeout(() => setProgress(0), 60);
  };

  useEffect(() => {
    if (view !== "experiment" || !plotActive) return;
    let mounted = true;
    const loop = (ts) => {
      if (!mounted) return;
      if (t0Ref.current == null) t0Ref.current = ts;
      const t = (ts - t0Ref.current) / 1000;
      const xr = xRel_UI;

      setSeries((prev) => {
        const next = [...prev, { t, xr: Number.isFinite(xr) ? xr : 0 }];
        const cutoff = t - WINDOW_SEC;
        while (next.length && next[0].t < cutoff) next.shift();
        return next;
      });

      rafPlotRef.current = requestAnimationFrame(loop);
    };
    rafPlotRef.current = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      if (rafPlotRef.current) cancelAnimationFrame(rafPlotRef.current);
      rafPlotRef.current = null;
    };
  }, [view, plotActive, xRel_UI]);

  useEffect(() => {
    if (!plotActive) return;
    if (!running) setPlotActive(false);
  }, [running, plotActive]);

  const resetGraph = () => {
    setSeries([]);
    t0Ref.current = null;
  };

  // Reinicio completo: gráfica + sistema + líneas
  const handleFullReset = () => {
    resetGraph();
    setPlotActive(false);
    setUserAdjusted(false);
    setAppliedForceN(null);
    setProgress(0);
    setLastV0(0);
    setMaxX_m(null);
    startImpulse({ x0: xEq_m, v0: 0 });
  };

  // Área de gráfica
  const gW = 1100;
  const gH = 420;
  const gPadL = 90, gPadR = 50, gPadT = 40, gPadB = 60;

  // Dominio temporal
  const nowT = series.length ? series[series.length - 1].t : 0;
  const autoMin = Math.max(0, nowT - WINDOW_SEC);
  const autoMax = autoMin + WINDOW_SEC;

  const [userAdjusted, setUserAdjusted] = useState(false);
  const [tMinView, setTMinView] = useState(autoMin);
  const [tMaxView, setTMaxView] = useState(autoMax);

  useEffect(() => {
    if (!userAdjusted) {
      setTMinView(autoMin);
      setTMaxView(autoMax);
    }
  }, [autoMin, autoMax, userAdjusted]);

  // Exportar CSV y HTML
  const exportCSV = () => {
    if (!series.length) return;
    const rows = [["t (s)", `x_rel (${masLenUnit})`]];
    for (const p of series) {
      if (p.t >= tMinView && p.t <= tMaxView) rows.push([round(p.t, 6), round(p.xr, 6)]);
    }
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mas_xt_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportHTML = () => {
    if (!series.length) return;
    const visible = series.filter((p) => p.t >= tMinView && p.t <= tMaxView);
    const rows = visible.map((p) => `<tr><td>${round(p.t,6)}</td><td>${round(p.xr,6)}</td></tr>`).join("");
    const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<title>Datos MAS x_rel(t)</title>
<style>
  body{font-family:Inter,system-ui,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;background:#0b0e13;color:#e5e7eb;margin:0;padding:24px;}
  .card{background:#0f1318;border:1px solid #263040;border-radius:12px;max-width:900px;margin:0 auto;padding:20px;}
  h1{margin:0 0 6px;font-size:20px;}
  p{margin:0 0 12px;opacity:.9}
  table{width:100%;border-collapse:collapse;margin-top:10px;}
  th,td{border:1px solid #2a3546;padding:10px 12px;text-align:right;}
  th{text-align:center;background:#141a23;}
  caption{caption-side:top;text-align:left;margin-bottom:8px;font-weight:600;}
  .legend{border-left:3px solid #60a5fa;padding-left:10px;margin-bottom:10px;}
  .mono{font-family:ui-monospace,Menlo,Consolas,'Liberation Mono','Courier New',monospace;}
</style>
</head>
<body>
  <div class="card">
    <h1>Datos del experimento: x_rel(t)</h1>
    <div class="legend">
      <p>Tabla de desplazamiento relativo respecto al equilibrio (<span class="mono">x_rel = x - x_eq</span>), en la ventana visible de tiempo.</p>
      <p>Unidad de longitud: <strong>${masLenUnit}</strong>. Intervalo: <span class="mono">[${round(tMinView,3)}, ${round(tMaxView,3)}] s</span>.</p>
    </div>
    <table>
      <caption>Serie temporal</caption>
      <thead>
        <tr><th>t (s)</th><th>x_rel (${masLenUnit})</th></tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mas_xt_tabla_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Exportar PNG del SVG de la gráfica
  const exportPNG = async () => {
    const svgEl = graphSvgRef.current;
    if (!svgEl) return;
    const xml = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    const scale = 2;
    const width = svgEl.viewBox.baseVal.width || svgEl.clientWidth || 1100;
    const height = svgEl.viewBox.baseVal.height || svgEl.clientHeight || 420;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");

    await new Promise((resolve) => {
      img.onload = () => {
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.src = url;
    });

    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      const durl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = durl;
      a.download = `grafica_mas_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(durl);
    }, "image/png");
  };

  // Estado exportación de imagen
  const canExportPng = !running && series.length >= 2;

  // Escape para cerrar
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.08), rgba(59,130,246,0)) , #0b0e13",
        zIndex: 1000,
        overflow: "auto",
      }}
    >
      {showFx && <div className="screenFx" aria-hidden="true" />}

      <div className="container container-wide container-wider">
        <header className="page-header" style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1>Spring (dynamic) — Simple Harmonic Motion</h1>
            <p className="subtitle">
              Mantener para cargar; soltar para aplicar. Doble clic en la gráfica: reset vista. Ctrl+rueda: zoom · Arrastre: paneo.
            </p>
          </div>
          <div className="btn-row">
            {view === "experiment" ? (
              <button className="ghost" onClick={() => setView("params")} title="Editar parámetros de MAS">
                Editar parámetros
              </button>
            ) : null}
            <button className="ghost" onClick={onClose} title="Volver a Spring (static)">
              Volver a Spring (static)
            </button>
          </div>
        </header>

        {view === "params" ? (
          <section className="card card-spacious">
            <div className="card-header" style={{ justifyContent: "space-between" }}>
              <h2>Parámetros (MAS)</h2>
              <div className="btn-row">
                <button className="primary" onClick={() => setView("experiment")}>
                  Ver experimento
                </button>
              </div>
            </div>

            <div className="grid-1">
              <div className="controls-row">
                <label className="label-inline">Unidad de masa</label>
                <select value={masMassUnit} onChange={(e) => setMasMassUnit(e.target.value)} className="input-inline">
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>

                <label className="label-inline">Unidad de longitud</label>
                <select value={masLenUnit} onChange={(e) => setMasLenUnit(e.target.value)} className="input-inline">
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                </select>
              </div>

              <div className="controls-row">
                <label className="label-inline">Masa m</label>
                <input type="number" value={masMValue} onChange={(e) => setMasMValue(Number(e.target.value))} step="any" min="0" className="input-inline" />
                <span className="small mono">{masMassUnit}</span>
              </div>

              <div className="controls-row">
                <label className="label-inline">Constante k</label>
                <input type="number" value={masK} onChange={(e) => setMasK(Number(e.target.value))} step="any" min="0" className="input-inline" />
                <span className="small mono">N/m</span>
              </div>

              <div className="controls-row">
                <label className="label-inline">Gravedad g</label>
                <input type="number" value={masG} onChange={(e) => setMasG(Number(e.target.value))} step="any" min="0" className="input-inline" />
                <span className="small mono">m/s²</span>
              </div>

              <div className="controls-row">
                <label className="label-inline">Longitud en reposo L₀</label>
                <input type="number" value={masL0} onChange={(e) => setMasL0(Number(e.target.value))} step="any" min="0" className="input-inline" />
                <span className="small mono">{masLenUnit}</span>
              </div>

              <p className="small mono">
                m = {round(masMkg)} kg · k = {round(safeK)} N/m · g = {round(safeG)} m/s² · L₀ = {round(masLenUnit === "cm" ? masL0 : masL0)} {masLenUnit}
              </p>
              <p className="small mono">xₑq = {round(xEq_UI)} {masLenUnit}</p>
            </div>
          </section>
        ) : (
          <>
            <section className="card card-spacious">
              <div className="card-header" style={{ gap: 8, justifyContent: "space-between" }}>
                <div className="btn-row">
                  <button className="ghost" onClick={() => setView("params")}>Editar parámetros</button>
                  <button className="ghost" title="Reiniciar sistema y gráfica" onClick={handleFullReset}>Reiniciar</button>
                </div>
              </div>

              <div className="view-box" style={{ position: "relative", overflow: "visible" }}>
                <svg width="100%" height={viz.h} viewBox={`0 0 ${viz.w} ${viz.h}`}>
                  <defs>
                    <linearGradient id="redLineGrad" x1={systemX1} x2={systemX2} y1="0" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="rgba(239,68,68,0)" />
                      <stop offset="50%" stopColor="rgba(239,68,68,0.9)" />
                      <stop offset="100%" stopColor="rgba(239,68,68,0)" />
                    </linearGradient>
                  </defs>

                  <rect x={40} y={viz.topPadding} width={viz.w - 80} height={viz.ceilingH} fill="#1f2937" stroke="#2a3546" />
                  <line x1={viz.left} y1={viz.topPadding + viz.ceilingH} x2={viz.left} y2={viz.topPadding + viz.ceilingH + viz.hookLen} stroke="#aab4c3" strokeWidth="2" />

                  <line x1={systemX1} y1={yReposo} x2={systemX2} y2={yReposo} stroke="url(#redLineGrad)" strokeWidth="6" />
                  {yMaxExt != null && (
                    <line x1={systemX1} y1={yMaxExt} x2={systemX2} y2={yMaxExt} stroke="url(#redLineGrad)" strokeWidth="6" opacity="0.9" />
                  )}

                  <path d={springPath} stroke="#9ec5ff" strokeWidth="2" fill="none" />

                  <line x1={viz.left} y1={springBottomY} x2={viz.left} y2={springBottomY + 6} stroke="#aab4c3" strokeWidth="2" />

                  <g transform={`translate(${blockX}, ${blockY})`}>
                    <rect x="0" y="20" width={viz.blockW} height={viz.blockH - 20} rx="8" fill="#364152" stroke="#2a3546" />
                    <rect x={viz.blockW * 0.2} y="0" width={viz.blockW * 0.6} height="28" rx="4" fill="#4b5b70" stroke="#2a3546" />
                    <rect x={viz.blockW * 0.38} y={viz.blockH - 2} width={viz.blockW * 0.24} height="6" fill="#2a3546" />
                  </g>

                  <g>
                    <line x1={80} y1={springTopY} x2={80} y2={springBottomY} stroke="#415169" />
                    {Array.from({ length: 6 }).map((_, i) => {
                      const y = springTopY + (springLenPx * i) / 5;
                      return <line key={i} x1={76} y={y} x2={84} y2={y} stroke="#415169" />;
                    })}
                    <text x={70} y={springTopY - 10} fill="#9aa4b2" fontSize="12" textAnchor="end">{masLenUnit}</text>
                  </g>
                </svg>

                <div className="forceDock" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="forcePanel slim">
                    <div className="forceTitle">Aplicar fuerza</div>
                    <div className="forceBar">
                      <div
                        className="forceFill"
                        style={{
                          width: `${Math.round(progress * 100)}%`,
                          background:
                            progress < 0.5
                              ? "linear-gradient(90deg, #16a34a, #22c55e)"
                              : progress < 0.85
                              ? "linear-gradient(90deg, #facc15, #f59e0b)"
                              : "linear-gradient(90deg, #f43f5e, #ef4444)",
                        }}
                      />
                      <div className="forceLimitMarker" />
                    </div>

                    <div className="forceButtons">
                      <button
                        className="forceHoldBtn"
                        onMouseDown={startHold}
                        onMouseUp={endHold}
                        onMouseLeave={() => { if (holdRef.current) endHold(); }}
                        onTouchStart={startHold}
                        onTouchEnd={endHold}
                      >
                        Mantener
                      </button>
                    </div>

                    <div className="forceRead">
                      {appliedForceN == null ? (
                        <span>F = {round(progress * maxForceN_est)} N</span>
                      ) : (
                        <span>F aplicada: <b>{appliedForceN}</b> N</span>
                      )}
                    </div>
                    <div className="forceHint">Mantener para cargar; soltar para aplicar.</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="card card-spacious">
              <div className="card-header" style={{ justifyContent: "space-between" }}>
                <h2>Gráfica en tiempo real: x<sub>rel</sub>(t)</h2>
                <div className="btn-row">
                  <span className="small mono">
                    Ventana: 30 s · Unidad: {masLenUnit} · {plotActive ? "Grabando" : "Detenida"}
                  </span>
                  <button className="ghost" onClick={exportCSV}>Exportar CSV</button>
                  <button className="ghost" onClick={exportHTML}>Exportar tabla (HTML)</button>
                  <button className="ghost" onClick={exportPNG} disabled={!canExportPng} title={canExportPng ? "Exportar PNG" : "Disponible cuando la oscilación se detenga"}>
                    Exportar imagen
                  </button>
                </div>
              </div>

              <div className="view-box" style={{ overflow: "hidden" }}>
                <InteractiveGraph
                  series={series}
                  unit={masLenUnit}
                  tMinView={tMinView}
                  tMaxView={tMaxView}
                  setTMinView={setTMinView}
                  setTMaxView={setTMaxView}
                  userAdjusted={userAdjusted}
                  setUserAdjusted={setUserAdjusted}
                  gW={gW}
                  gH={gH}
                  gPadL={gPadL}
                  gPadR={gPadR}
                  gPadT={gPadT}
                  gPadB={gPadB}
                  svgRefExternal={graphSvgRef}
                />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// Gráfica interactiva con estilos reforzados de señal y rejilla tenue
function InteractiveGraph({
  series, unit,
  tMinView, tMaxView, setTMinView, setTMaxView,
  userAdjusted, setUserAdjusted,
  gW, gH, gPadL, gPadR, gPadT, gPadB,
  svgRefExternal
}) {
  const gInnerW = gW - gPadL - gPadR;
  const gInnerH = gH - gPadT - gPadB;

  // Dominio vertical simétrico
  let absMax = 1;
  if (series.length) {
    absMax = series.reduce((m, p) => {
      if (p.t < tMinView || p.t > tMaxView) return m;
      const a = Math.abs(p.xr);
      return a > m ? a : m;
    }, 0.5);
    absMax = Math.max(0.5, absMax * 1.15);
  }
  const yMin = -absMax, yMax = absMax;

  const sx = (t) => gPadL + ((t - tMinView) / (tMaxView - tMinView)) * gInnerW;
  const sy = (xr) => gPadT + (1 - (xr - yMin) / (yMax - yMin)) * gInnerH;

  // Suavizado
  const smoothed = useMemo(() => {
    if (series.length < 3) return series;
    const N = 5;
    const out = [];
    for (let i = 0; i < series.length; i++) {
      let s = 0, c = 0;
      for (let j = i - Math.floor(N / 2); j <= i + Math.floor(N / 2); j++) {
        if (j >= 0 && j < series.length) { s += series[j].xr; c++; }
      }
      out.push({ t: series[i].t, xr: s / (c || 1) });
    }
    return out;
  }, [series]);

  const pathGraph = useMemo(() => {
    const filtered = smoothed.filter(p => p.t >= tMinView && p.t <= tMaxView);
    if (filtered.length < 2) return "";
    let d = `M ${sx(filtered[0].t)},${sy(filtered[0].xr)}`;
    for (let i = 1; i < filtered.length; i++) d += ` L ${sx(filtered[i].t)},${sy(filtered[i].xr)}`;
    return d;
  }, [smoothed, tMinView, tMaxView, yMin, yMax]);

  // Interacción
  const svgRef = svgRefExternal || useRef(null);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);

  const doZoomAt = (clientX, deltaY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const xPix = clientX - rect.left;
    const tAtCursor = tMinView + ((xPix - gPadL) / gInnerW) * (tMaxView - tMinView);
    const clampT = Math.max(tMinView, Math.min(tMaxView, tAtCursor));

    const zoomFactor = deltaY < 0 ? 0.9 : 1.1;
    const newSpan = Math.max(0.5, (tMaxView - tMinView) * zoomFactor);

    const ratio = (clampT - tMinView) / (tMaxView - tMinView);
    const newMin = clampT - ratio * newSpan;
    const newMax = newMin + newSpan;

    setTMinView(newMin);
    setTMaxView(newMax);
    setUserAdjusted(true);
  };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const wheelHandler = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      doZoomAt(e.clientX, e.deltaY);
    };
    el.addEventListener("wheel", wheelHandler, { passive: false });
    return () => el.removeEventListener("wheel", wheelHandler, { passive: false });
  }, [tMinView, tMaxView, gInnerW, gPadL]);

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    draggingRef.current = true;
    lastXRef.current = e.clientX;
  };
  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    const span = tMaxView - tMinView;
    const dt = -dx * (span / gInnerW);
    setTMinView(tMinView + dt);
    setTMaxView(tMaxView + dt);
    setUserAdjusted(true);
  };
  const onMouseUp = () => { draggingRef.current = false; };
  const onDblClick = () => { setUserAdjusted(false); };

  // Ticks y rejilla tenues
  const tickEvery = 5;
  const tStart = Math.ceil(tMinView / tickEvery) * tickEvery;
  const tTicks = [];
  for (let t = tStart; t <= tMaxView + 1e-6; t += tickEvery) tTicks.push(t);
  const yTicks = [-1, -0.5, 0, 0.5, 1].map((k) => k * (absMax || 1));

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={gH}
      viewBox={`0 0 ${gW} ${gH}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onDoubleClick={onDblClick}
      style={{ cursor: draggingRef.current ? "grabbing" : "default" }}
    >
      <rect x="0" y="0" width={gW} height={gH} fill="#0c0f12" />

      <g>
        <rect x={gPadL} y={gPadT} width={gInnerW} height={gInnerH} fill="none" stroke="#202a36" />

        {tTicks.map((tt, i) => (
          <g key={`tx-${i}`}>
            <line x1={sx(tt)} y1={gPadT} x2={sx(tt)} y2={gPadT + gInnerH} stroke="#17202b" />
            <text x={sx(tt)} y={gPadT + gInnerH + 18} fill="#a7b0bc" fontSize="13" textAnchor="middle">
              {round(tt, 0)}
            </text>
          </g>
        ))}

        {yTicks.map((yv, i) => (
          <g key={`ty-${i}`}>
            <line x1={gPadL} y1={sy(yv)} x2={gPadL + gInnerW} y2={sy(yv)} stroke="#17202b" />
            <text x={gPadL - 10} y={sy(yv) + 4} fill="#a7b0bc" fontSize="13" textAnchor="end">
              {round(yv)}
            </text>
          </g>
        ))}

        <line x1={gPadL} y1={sy(0)} x2={gPadL + gInnerW} y2={sy(0)} stroke="#7b8794" strokeWidth="1.5" />

        <text x={gPadL + gInnerW / 2} y={gH - 10} fill="#d1d8e1" fontSize="14" textAnchor="middle">t (s)</text>
        <text
          x={20}
          y={gPadT + gInnerH / 2}
          fill="#d1d8e1"
          fontSize="14"
          textAnchor="middle"
          transform={`rotate(-90, 20, ${gPadT + gInnerH / 2})`}
        >
          x_rel ({unit})
        </text>
      </g>

      {smoothed.length >= 2 ? (
        <path d={pathGraph} fill="none" stroke="#6fb0ff" strokeWidth="2.6" />
      ) : (
        <text x={gW / 2} y={gH / 2} textAnchor="middle" fill="#94a3b8" fontSize="12">
          La gráfica inicia al aplicar la fuerza
        </text>
      )}

      {smoothed.length ? (
        <>
          <text x={gPadL + 8} y={22} fill="#a7b0bc" fontSize="12">
            |x_rel|≈ {round(Math.max(...smoothed.map((p) => Math.abs(p.xr))))} {unit}
          </text>
          <text x={gW - gPadR} y={22} fill="#a7b0bc" fontSize="12" textAnchor="end">
            t: {round(smoothed[smoothed.length - 1].t)} s
          </text>
        </>
      ) : null}
    </svg>
  );
}

function round(x, d = 3) {
  const k = Math.pow(10, d);
  return Math.round(Number(x) * k) / k;
}
