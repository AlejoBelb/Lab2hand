// client/src/experiments/spring-static/pages/HookeMAS.jsx

import { exportToExcel } from '../../../shared/utils/exportExcel.js';
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDampedOscillator from "../logic/useDampedOscillator";
import FinishOverlay from "../../../shared/components/FinishOverlay.jsx";
import "../styles/hooke.css";

export default function HookeMAS({ open, onClose, onEditParams, params }) {
  if (!open) return null;

  const navigate = useNavigate();

  // ── Microinteracciones ──
  const [exiting, setExiting] = useState(false);

  const handleGoHome = () => {
    setExiting(true);
    setTimeout(() => navigate("/"), 250);
  };

  const [showFx, setShowFx] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowFx(false), 520);
    return () => clearTimeout(t);
  }, []);

  const [view, setView] = useState("params");

  const seedMassUnit = params?.massUnit === "kg" || params?.massUnit === "g" ? params.massUnit : "g";
  const seedLenUnit = params?.lenUnit === "m" || params?.lenUnit === "cm" ? params.lenUnit : "cm";

  const [masMassUnit, setMasMassUnit] = useState(seedMassUnit);
  const [masLenUnit, setMasLenUnit] = useState(seedLenUnit);
  const [masMValue, setMasMValue] = useState(typeof params?.massValue === "number" ? params.massValue : 200);
  const [masK, setMasK] = useState(typeof params?.k === "number" ? params.k : 50);
  const [masG, setMasG] = useState(typeof params?.g === "number" ? params.g : 9.81);
  const [masL0, setMasL0] = useState(typeof params?.L0 === "number" ? params.L0 : 30);
  const [masZeta, setMasZeta] = useState(typeof params?.zeta === "number" ? params.zeta : 0.1);

  const isNum = (v) => Number.isFinite(Number(v));
  const toNumOr = (v, d = 0) => (isNum(v) ? Number(v) : d);

  const dampingLabel = (z) => {
    if (z === 0)  return { text: "Sin amortiguamiento",       color: "#22d3ee" };
    if (z < 1)    return { text: "Subamortiguado",            color: "#34d399" };
    if (z === 1)  return { text: "Críticamente amortiguado",  color: "#facc15" };
    return          { text: "Sobreamortiguado",               color: "#f87171" };
  };

  const dampingPresets = [
    { label: "Sin amort.",   zeta: 0,    icon: "〰️" },
    { label: "Subamort.",    zeta: 0.1,  icon: "↕️" },
    { label: "Crítico",      zeta: 1.0,  icon: "⏸️" },
    { label: "Sobreamort.",  zeta: 2.0,  icon: "⏬" },
  ];

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
  const safeZeta = useMemo(() => Math.max(0, toNumOr(masZeta, 0)), [masZeta]);

  const xEq_m = useMemo(() => (safeM * safeG) / safeK, [safeM, safeG, safeK]);

  const viz = useMemo(() => ({
    w: 560, h: 720, topPadding: 30, left: 280,
    coils: 12, amp: 22, ceilingH: 14, hookLen: 12,
    blockW: 112, blockH: 78, pxPerUIBase: 8,
  }), []);

  const springTopY = viz.topPadding + viz.ceilingH + viz.hookLen;
  const c_visc = useMemo(() => 2 * safeZeta * Math.sqrt(safeK * safeM), [safeZeta, safeK, safeM]);

  const { x: x_m, running, startImpulse, stop: stopOscillator } = useDampedOscillator({
    m: safeM, k: safeK, c: c_visc, xEq: xEq_m,
    x0: xEq_m, v0: 0, dt: 1 / 60,
    autoStopThreshold: 1e-5, autoStopVel: 1e-5,
    autoStopFrames: safeZeta >= 1 ? 120 : 36,
    autoStopTime: 0,
  });

  const xEq_UI = useMemo(() => (masLenUnit === "cm" ? xEq_m * 100 : xEq_m), [xEq_m, masLenUnit]);

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

  const L0_ui = useMemo(() => Math.max(0, toNumOr(masL0, 0)), [masL0]);

  const [appliedForceN, setAppliedForceN] = useState(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const holdRef = useRef(false);
  const lastTsRef = useRef(0);
  const fillRatePerSec = 0.24;

  const WINDOW_SEC = 10;
  const MAX_RECORD_SEC = 10;
  const t0Ref = useRef(null);
  const rafPlotRef = useRef(null);
  const [plotActive, setPlotActive] = useState(false);
  const [showFinishOverlay, setShowFinishOverlay] = useState(false);
  const graphSvgRef = useRef(null);

  // Parámetros de la oscilación capturados al momento del impulso (state para reactividad)
  const [impulseParams, setImpulseParams] = useState(null);

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
      const v0 = (F * 0.28) / safeM;
      setLastV0(v0);
      setMaxX_m(null);
      startImpulse({ x0: xEq_m, v0 });
      resetGraph();
      // Capturar parámetros DESPUÉS del reset para que no se anulen
      setImpulseParams({
        v0, omega, zeta: safeZeta, k: safeK, m: safeM,
        lenUnit: masLenUnit, xEq: xEq_m,
      });
      setPlotActive(true);
      setUserAdjusted(false);
    }
    setTimeout(() => setProgress(0), 60);
  };

  // ── Función analítica x_rel(t) para la gráfica ──
  const xRelAnalytic = (t, ip) => {
    const { v0, omega: w0, zeta: z } = ip;
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return (v0 / wd) * Math.exp(-z * w0 * t) * Math.sin(wd * t);
    } else if (z === 1) {
      return v0 * t * Math.exp(-w0 * t);
    } else {
      const sqrtTerm = w0 * Math.sqrt(z * z - 1);
      const s1 = -z * w0 + sqrtTerm;
      const s2 = -z * w0 - sqrtTerm;
      return (v0 / (2 * sqrtTerm)) * (Math.exp(s1 * t) - Math.exp(s2 * t));
    }
  };

  // Convertir x_rel en metros a unidad de display
  const xRelToUI = (xr_m, lenUnit) => lenUnit === "cm" ? xr_m * 100 : xr_m;

  // ── Animación visual del resorte usando solución analítica ──
  const [visualT, setVisualT] = useState(0);
  const visualRafRef = useRef(null);
  const visualT0Ref = useRef(null);

  useEffect(() => {
    if (!plotActive || !impulseParams) {
      visualT0Ref.current = null;
      return;
    }
    const loop = (ts) => {
      if (visualT0Ref.current == null) visualT0Ref.current = ts;
      const t = (ts - visualT0Ref.current) / 1000;
      setVisualT(t);
      visualRafRef.current = requestAnimationFrame(loop);
    };
    visualRafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(visualRafRef.current);
      visualRafRef.current = null;
    };
  }, [plotActive, impulseParams]);

  const elong_UI = useMemo(() => {
    if (plotActive && impulseParams) {
      const xRel_m = xRelAnalytic(visualT, impulseParams);
      const xNow = xEq_m + xRel_m;
      return masLenUnit === "cm" ? xNow * 100 : xNow;
    }
    return masLenUnit === "cm" ? xEq_m * 100 : xEq_m;
  }, [plotActive, impulseParams, visualT, xEq_m, masLenUnit]);

  const xRel_UI = elong_UI - xEq_UI;

  // ── Escala visual del resorte ──
  const pxPerUI = useMemo(() => {
    const bottomPadPx = viz.blockH + 64;
    const availH = viz.h - (viz.topPadding + viz.ceilingH + viz.hookLen) - bottomPadPx;
    const xMax_ui = masLenUnit === "cm" ? expectedMaxX_m * 100 : expectedMaxX_m;
    const neededUI = Math.max(10, L0_ui + xMax_ui);
    return Math.min(viz.pxPerUIBase, Math.max(1.2, availH / neededUI));
  }, [viz, L0_ui, expectedMaxX_m, masLenUnit]);

  const totalLenUI_raw = useMemo(() => L0_ui + elong_UI, [L0_ui, elong_UI]);
  const minSpringLenPx = 28;
  const springLenPx = Math.max(minSpringLenPx, totalLenUI_raw * pxPerUI);
  const springBottomY = springTopY + springLenPx;

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

  const blockTopY = springBottomY + 6;
  const blockX = viz.left - viz.blockW / 2;
  const blockY = blockTopY;

  const systemX1 = 50;
  const systemX2 = viz.w - 50;
  const elongLenUI_eq = useMemo(() => (masLenUnit === "cm" ? xEq_m * 100 : xEq_m), [xEq_m, masLenUnit]);
  const yReposo = springTopY + (L0_ui + elongLenUI_eq) * pxPerUI;

  const [maxX_m, setMaxX_m] = useState(null);
  useEffect(() => {
    if (plotActive && impulseParams) {
      const xRel_m = xRelAnalytic(visualT, impulseParams);
      const xNow = xEq_m + xRel_m;
      setMaxX_m((prev) => {
        const onlyExtension = Math.max(0, xNow);
        if (prev == null) return onlyExtension;
        return onlyExtension > prev ? onlyExtension : prev;
      });
    }
  }, [plotActive, impulseParams, visualT, xEq_m]);

  const yMaxExt = useMemo(() => {
    if (maxX_m == null) return null;
    const x_ui = masLenUnit === "cm" ? maxX_m * 100 : maxX_m;
    return springTopY + (L0_ui + x_ui) * pxPerUI;
  }, [maxX_m, masLenUnit, L0_ui, springTopY, pxPerUI]);

  // Loop: actualiza elapsedT cada ~100ms
  const [elapsedT, setElapsedT] = useState(0);

  useEffect(() => {
    if (view !== "experiment" || !plotActive) return;
    let mounted = true;
    let lastUpdate = 0;
    const loop = (ts) => {
      if (!mounted) return;
      if (t0Ref.current == null) t0Ref.current = ts;
      const t = (ts - t0Ref.current) / 1000;

      if (t >= MAX_RECORD_SEC) {
        setPlotActive(false);
        setElapsedT(MAX_RECORD_SEC);
        setShowFinishOverlay(true);
        return;
      }

      if (ts - lastUpdate > 100) {
        lastUpdate = ts;
        setElapsedT(t);
      }
      rafPlotRef.current = requestAnimationFrame(loop);
    };
    rafPlotRef.current = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      if (rafPlotRef.current) cancelAnimationFrame(rafPlotRef.current);
      rafPlotRef.current = null;
    };
  }, [view, plotActive]);

  // Generar puntos analíticos
  const analyticSeries = useMemo(() => {
    if (!impulseParams || elapsedT <= 0) return [];
    const ip = impulseParams;
    const tMax = Math.min(elapsedT, MAX_RECORD_SEC);
    const freqHz = ip.omega / (2 * Math.PI);
    const ptsPerSec = Math.max(30, Math.min(200, freqHz * 40));
    const totalPts = Math.round(tMax * ptsPerSec);
    const dt = tMax / Math.max(1, totalPts);
    const pts = [];
    for (let i = 0; i <= totalPts; i++) {
      const t = i * dt;
      const xr_m = xRelAnalytic(t, ip);
      pts.push({ t, xr: xRelToUI(xr_m, ip.lenUnit) });
    }
    return pts;
  }, [elapsedT, impulseParams]);

  const wasRunningRef = useRef(false);

  useEffect(() => {
    if (running) wasRunningRef.current = true;
    if (!plotActive && wasRunningRef.current && running) {
      stopOscillator();
      wasRunningRef.current = false;
      return;
    }
    if (!plotActive) return;
    if (wasRunningRef.current && !running) {
      setPlotActive(false);
      setShowFinishOverlay(true);
      wasRunningRef.current = false;
    }
  }, [running, plotActive]);

  const resetGraph = () => { t0Ref.current = null; setElapsedT(0); setImpulseParams(null); };

  const handleFullReset = () => {
    resetGraph();
    setPlotActive(false);
    setShowFinishOverlay(false);
    setUserAdjusted(false);
    setAppliedForceN(null);
    setProgress(0);
    setLastV0(0);
    setMaxX_m(null);
    startImpulse({ x0: xEq_m, v0: 0 });
  };

  const gW = 1100, gH = 420;
  const gPadL = 90, gPadR = 50, gPadT = 40, gPadB = 60;

  const nowT = elapsedT;
  const autoMin = Math.max(0, nowT - WINDOW_SEC);
  const autoMax = autoMin + WINDOW_SEC;

  const [userAdjusted, setUserAdjusted] = useState(false);
  const [tMinView, setTMinView] = useState(autoMin);
  const [tMaxView, setTMaxView] = useState(autoMax);

  useEffect(() => {
    if (!userAdjusted) { setTMinView(autoMin); setTMaxView(autoMax); }
  }, [autoMin, autoMax, userAdjusted]);

  const exportCSV = () => {
    if (!analyticSeries.length) return;
    const filteredData = analyticSeries
      .filter((p) => p.t >= tMinView && p.t <= tMaxView)
      .map((p) => [round(p.t, 6), round(p.xr, 6)]);
    exportToExcel({
      title: 'Movimiento Armónico Simple (subamortiguado)',
      subtitle: 'Oscilación masa-resorte con amortiguamiento — Lab2Hand',
      params: [`m = ${safeM} kg`, `k = ${safeK} N/m`, `ζ = ${safeZeta}`],
      headers: ['Tiempo (s)', `Desplazamiento x_rel (${masLenUnit})`],
      data: filteredData,
      filename: `mas_lab2hand_${new Date().toISOString().slice(0,10)}`,
      sheetName: 'MAS',
    });
  };

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
      img.onload = () => { ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.drawImage(img, 0, 0); resolve(); };
      img.src = url;
    });
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      const durl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = durl;
      a.download = `grafica_mas_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(durl);
    }, "image/png");
  };

  const canExportPng = !plotActive && analyticSeries.length >= 2;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className={`page-enter${exiting ? " page-exit" : ""}`} style={{
      position: "fixed", inset: 0,
      background: "radial-gradient(1200px 600px at 50% -10%, rgba(59,130,246,0.08), rgba(59,130,246,0)), #080c14",
      zIndex: 1000, overflow: "auto",
    }}>
      {showFx && <div className="screenFx" aria-hidden="true" />}

      <FinishOverlay
        visible={showFinishOverlay}
        title="Completado"
        subtitle="MAS — Movimiento Armónico Simple"
        onDone={() => setShowFinishOverlay(false)}
      />

      <style>{`
        .mas-page {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 24px 48px;
        }
        .mas-header {
          padding: 28px 0 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }
        .mas-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
          line-height: 1.3;
        }
        .mas-header p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          line-height: 1.6;
          max-width: 620px;
        }
        .mas-card {
          background: rgba(13, 20, 33, 0.75);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .mas-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 12px;
        }
        .mas-card-head h2 {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          margin: 0;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .mas-card-body { padding: 24px; }
        .mas-btn-home {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px; padding: 9px 16px; color: #94a3b8;
          font-size: 13.5px; font-family: inherit; cursor: pointer;
          white-space: nowrap; flex-shrink: 0; transition: background 0.2s, color 0.2s;
        }
        .mas-btn-home:hover { background: rgba(255,255,255,0.09); color: #e2e8f0; }
        .mas-btn-ghost {
          background: rgba(255,255,255,0.05); color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.09); border-radius: 9px;
          padding: 7px 14px; font-size: 13px; font-family: inherit;
          cursor: pointer; transition: background 0.2s, color 0.2s;
        }
        .mas-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #e2e8f0; }
        .mas-btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }
        .mas-params-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 680px) { .mas-params-grid { grid-template-columns: 1fr; } }
        .mas-units-row {
          grid-column: 1 / -1; display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; flex-wrap: wrap;
        }
        .mas-unit-label { font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
        .mas-select {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 7px; padding: 7px 10px; color: #e2e8f0; font-size: 13px; outline: none; cursor: pointer;
        }
        .mas-param-field { display: flex; flex-direction: column; gap: 7px; }
        .mas-param-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; }
        .mas-param-input-row { display: flex; align-items: center; gap: 8px; }
        .mas-input {
          flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px; padding: 10px 12px; color: #e2e8f0; font-size: 14px;
          font-family: ui-monospace, monospace; outline: none; width: 100%; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mas-input:focus { border-color: rgba(139,92,246,0.5); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
        .mas-param-unit { font-size: 12px; color: #475569; font-family: ui-monospace, monospace; white-space: nowrap; min-width: 28px; }
        .mas-calc-row {
          grid-column: 1 / -1; padding: 14px 16px; background: rgba(139,92,246,0.06);
          border: 1px solid rgba(139,92,246,0.15); border-radius: 10px;
          font-size: 12.5px; color: #94a3b8; font-family: ui-monospace, monospace; line-height: 1.8;
        }
        .mas-calc-hi { color: #a78bfa; font-weight: 600; }
        .mas-btn-start {
          grid-column: 1 / -1; background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff; border: none; border-radius: 11px; padding: 13px;
          font-size: 15px; font-weight: 600; font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .mas-btn-start:hover { opacity: 0.9; transform: translateY(-1px); }
        .mas-running-dot {
          display: inline-block; width: 7px; height: 7px; border-radius: 50%;
          background: #22c55e; margin-right: 5px;
          animation: masRunPulse 1.5s ease-in-out infinite;
        }
        @keyframes masRunPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .mas-damping-preset {
          padding: 6px 12px; font-size: 12px; font-family: inherit; border-radius: 8px;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 5px;
        }
        .mas-damping-preset:hover { filter: brightness(1.15); }
        .mas-zeta-slider { flex: 1; height: 6px; cursor: pointer; border-radius: 3px; }
        .mas-zeta-slider::-webkit-slider-thumb { width: 16px; height: 16px; }
      `}</style>

      <div className="mas-page">
        <header className="mas-header">
          <div>
            <h1>MAS — Movimiento Armónico Simple</h1>
            <p>Mantener para cargar; soltar para aplicar. Doble clic en la gráfica: reset vista. Ctrl+rueda: zoom · Arrastre: paneo.</p>
          </div>
          <button className="mas-btn-home" onClick={handleGoHome}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Volver al inicio
          </button>
        </header>

        {view === "params" ? (
          <div className="mas-card mas-view-enter" key="params">
            <div className="mas-card-head"><h2>Configurar experimento</h2></div>
            <div className="mas-card-body">
              <div className="mas-params-grid">
                <div className="mas-units-row">
                  <span className="mas-unit-label">Unidad masa</span>
                  <select className="mas-select" value={masMassUnit} onChange={(e) => setMasMassUnit(e.target.value)}>
                    <option value="g">g</option><option value="kg">kg</option>
                  </select>
                  <span className="mas-unit-label" style={{ marginLeft: 8 }}>Unidad longitud</span>
                  <select className="mas-select" value={masLenUnit} onChange={(e) => setMasLenUnit(e.target.value)}>
                    <option value="cm">cm</option><option value="m">m</option>
                  </select>
                </div>
                <div className="mas-param-field">
                  <label className="mas-param-label">Masa m</label>
                  <div className="mas-param-input-row">
                    <input className="mas-input" type="number" value={masMValue} onChange={(e) => setMasMValue(Number(e.target.value))} step="any" min="0" />
                    <span className="mas-param-unit">{masMassUnit}</span>
                  </div>
                </div>
                <div className="mas-param-field">
                  <label className="mas-param-label">Constante k</label>
                  <div className="mas-param-input-row">
                    <input className="mas-input" type="number" value={masK} onChange={(e) => setMasK(Number(e.target.value))} step="any" min="0" />
                    <span className="mas-param-unit">N/m</span>
                  </div>
                </div>
                <div className="mas-param-field">
                  <label className="mas-param-label">Gravedad g</label>
                  <div className="mas-param-input-row">
                    <input className="mas-input" type="number" value={masG} onChange={(e) => setMasG(Number(e.target.value))} step="any" min="0" />
                    <span className="mas-param-unit">m/s²</span>
                  </div>
                </div>
                <div className="mas-param-field">
                  <label className="mas-param-label">Longitud reposo L₀</label>
                  <div className="mas-param-input-row">
                    <input className="mas-input" type="number" value={masL0} onChange={(e) => setMasL0(Number(e.target.value))} step="any" min="0" />
                    <span className="mas-param-unit">{masLenUnit}</span>
                  </div>
                </div>
                <div className="mas-param-field" style={{ gridColumn: "1 / -1" }}>
                  <label className="mas-param-label" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                    Amortiguamiento ζ
                    <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                      background: `${dampingLabel(safeZeta).color}18`, color: dampingLabel(safeZeta).color,
                      letterSpacing: "0.02em", textTransform: "none" }}>
                      {dampingLabel(safeZeta).text}
                    </span>
                  </label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {dampingPresets.map((p) => {
                      const active = safeZeta === p.zeta;
                      return (
                        <button key={p.zeta} className="mas-damping-preset" onClick={() => setMasZeta(p.zeta)}
                          style={{ fontWeight: active ? 600 : 400,
                            border: `1px solid ${active ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.09)"}`,
                            background: active ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
                            color: active ? "#c4b5fd" : "#94a3b8" }}>
                          <span style={{ fontSize: 13 }}>{p.icon}</span>
                          {p.label}
                          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, opacity: 0.7 }}>(ζ={p.zeta})</span>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input type="range" className="mas-zeta-slider" min="0" max="3" step="0.01"
                      value={Math.min(3, masZeta)} onChange={(e) => setMasZeta(Number(e.target.value))}
                      style={{ accentColor: dampingLabel(safeZeta).color }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input className="mas-input" type="number" value={masZeta}
                        onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0) setMasZeta(v); }}
                        step="0.01" min="0" max="10" style={{ width: 80, textAlign: "center", flex: "none" }} />
                      <span className="mas-param-unit" style={{ minWidth: 10 }}>ζ</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 11.5, color: "#64748b", margin: "8px 0 0", lineHeight: 1.5 }}>
                    {safeZeta === 0 && "ζ = 0 → El sistema oscila indefinidamente sin perder energía (caso ideal)."}
                    {safeZeta > 0 && safeZeta < 1 && `ζ = ${round(safeZeta, 2)} → El sistema oscila con amplitud decreciente hasta detenerse.`}
                    {safeZeta === 1 && "ζ = 1 → Retorno al equilibrio en el menor tiempo posible sin oscilar (caso crítico)."}
                    {safeZeta > 1 && `ζ = ${round(safeZeta, 2)} → Retorno lento al equilibrio sin oscilaciones (sobreamortiguado).`}
                  </p>
                </div>
                <div className="mas-calc-row">
                  <div>m = {round(masMkg)} kg · k = {round(safeK)} N/m · g = {round(safeG)} m/s²</div>
                  <div>
                    x<sub>eq</sub> = <span className="mas-calc-hi">{round(xEq_UI)} {masLenUnit}</span>
                    {" · "}ζ = <span className="mas-calc-hi">{round(safeZeta, 4)}</span>
                    {" · "}c = <span className="mas-calc-hi">{round(c_visc, 4)}</span> N·s/m
                  </div>
                </div>
                <button className="mas-btn-start" onClick={() => setView("experiment")}>
                  Iniciar experimento
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mas-view-enter" key="experiment">
            <div className="mas-card">
              <div className="mas-card-head">
                <h2>Sistema en tiempo real</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="mas-btn-ghost" onClick={() => setView("params")}>Editar parámetros</button>
                  <button className="mas-btn-ghost" onClick={handleFullReset}>Reiniciar</button>
                </div>
              </div>
              <div style={{ position: "relative", overflow: "visible" }}>
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
                      return <line key={i} x1={76} y1={y} x2={84} y2={y} stroke="#415169" />;
                    })}
                    <text x={70} y={springTopY - 10} fill="#9aa4b2" fontSize="12" textAnchor="end">{masLenUnit}</text>
                  </g>
                </svg>
                <div className="forceDock" onMouseDown={(e) => e.stopPropagation()}>
                  <div className="forcePanel slim">
                    <div className="forceTitle">Aplicar fuerza</div>
                    <div className="forceBar">
                      <div className="forceFill" style={{
                        width: `${Math.round(progress * 100)}%`,
                        background: progress < 0.5 ? "linear-gradient(90deg, #16a34a, #22c55e)"
                          : progress < 0.85 ? "linear-gradient(90deg, #facc15, #f59e0b)"
                          : "linear-gradient(90deg, #f43f5e, #ef4444)",
                      }} />
                      <div className="forceLimitMarker" />
                    </div>
                    <div className="forceButtons">
                      <button className="forceHoldBtn"
                        onMouseDown={startHold} onMouseUp={endHold}
                        onMouseLeave={() => { if (holdRef.current) endHold(); }}
                        onTouchStart={startHold} onTouchEnd={endHold}>
                        Mantener
                      </button>
                    </div>
                    <div className="forceRead">
                      {appliedForceN == null
                        ? <span>F = {round(progress * maxForceN_est)} N</span>
                        : <span>F aplicada: <b>{appliedForceN}</b> N</span>}
                    </div>
                    <div className="forceHint">Mantener para cargar; soltar para aplicar.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mas-card">
              <div className="mas-card-head">
                <h2>
                  {plotActive && <span className="mas-running-dot" />}
                  Gráfica x<sub>rel</sub>(t)
                  {plotActive ? " — Ejecutando" : " — Detenida"}
                </h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, color: "#475569", fontFamily: "monospace" }}>
                    ventana {WINDOW_SEC} s · {masLenUnit}
                  </span>
                  <button className="mas-btn-ghost" onClick={exportCSV} disabled={plotActive || !analyticSeries.length}
                    title={plotActive ? "Disponible cuando la gráfica se detenga" : "Exportar Excel"}>
                    Excel
                  </button>
                  <button className="mas-btn-ghost" onClick={exportPNG} disabled={!canExportPng}
                    title={canExportPng ? "Exportar PNG" : "Disponible cuando la oscilación se detenga"}>
                    PNG
                  </button>
                </div>
              </div>
              <div style={{ padding: "4px 0 0" }}>
                <InteractiveGraph
                  series={analyticSeries} unit={masLenUnit}
                  tMinView={tMinView} tMaxView={tMaxView}
                  setTMinView={setTMinView} setTMaxView={setTMaxView}
                  userAdjusted={userAdjusted} setUserAdjusted={setUserAdjusted}
                  gW={gW} gH={gH} gPadL={gPadL} gPadR={gPadR} gPadT={gPadT} gPadB={gPadB}
                  svgRefExternal={graphSvgRef}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Gráfica interactiva ────────────────────────────────────────────────────
function InteractiveGraph({
  series, unit,
  tMinView, tMaxView, setTMinView, setTMaxView,
  userAdjusted, setUserAdjusted,
  gW, gH, gPadL, gPadR, gPadT, gPadB,
  svgRefExternal
}) {
  const gInnerW = gW - gPadL - gPadR;
  const gInnerH = gH - gPadT - gPadB;

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

  const plotData = series;

  const pathGraph = useMemo(() => {
    const filtered = plotData.filter(p => p.t >= tMinView && p.t <= tMaxView);
    if (filtered.length < 2) return "";
    let d = `M ${sx(filtered[0].t)},${sy(filtered[0].xr)}`;
    for (let i = 1; i < filtered.length; i++) d += ` L ${sx(filtered[i].t)},${sy(filtered[i].xr)}`;
    return d;
  }, [plotData, tMinView, tMaxView, yMin, yMax]);

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
    setTMinView(newMin);
    setTMaxView(newMin + newSpan);
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

  const onMouseDown = (e) => { if (e.button !== 0) return; draggingRef.current = true; lastXRef.current = e.clientX; };
  const onMouseMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    const dt = -dx * ((tMaxView - tMinView) / gInnerW);
    setTMinView(tMinView + dt);
    setTMaxView(tMaxView + dt);
    setUserAdjusted(true);
  };
  const onMouseUp = () => { draggingRef.current = false; };
  const onDblClick = () => { setUserAdjusted(false); };

  const tickEvery = 5;
  const tStart = Math.ceil(tMinView / tickEvery) * tickEvery;
  const tTicks = [];
  for (let t = tStart; t <= tMaxView + 1e-6; t += tickEvery) tTicks.push(t);
  const yTicks = [-1, -0.5, 0, 0.5, 1].map((k) => k * (absMax || 1));

  return (
    <svg
      ref={svgRef}
      width="100%" height={gH}
      viewBox={`0 0 ${gW} ${gH}`}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onDoubleClick={onDblClick}
      style={{ cursor: "default", display: "block" }}
    >
      <rect x="0" y="0" width={gW} height={gH} fill="#0c0f12" />
      <rect x={gPadL} y={gPadT} width={gInnerW} height={gInnerH} fill="none" stroke="#202a36" />
      {tTicks.map((tt, i) => (
        <g key={`tx-${i}`}>
          <line x1={sx(tt)} y1={gPadT} x2={sx(tt)} y2={gPadT + gInnerH} stroke="#17202b" />
          <text x={sx(tt)} y={gPadT + gInnerH + 18} fill="#a7b0bc" fontSize="13" textAnchor="middle">{round(tt, 0)}</text>
        </g>
      ))}
      {yTicks.map((yv, i) => (
        <g key={`ty-${i}`}>
          <line x1={gPadL} y1={sy(yv)} x2={gPadL + gInnerW} y2={sy(yv)} stroke="#17202b" />
          <text x={gPadL - 10} y={sy(yv) + 4} fill="#a7b0bc" fontSize="13" textAnchor="end">{round(yv)}</text>
        </g>
      ))}
      <line x1={gPadL} y1={sy(0)} x2={gPadL + gInnerW} y2={sy(0)} stroke="#7b8794" strokeWidth="1.5" />
      <text x={gPadL + gInnerW / 2} y={gH - 10} fill="#d1d8e1" fontSize="14" textAnchor="middle">t (s)</text>
      <text x={20} y={gPadT + gInnerH / 2} fill="#d1d8e1" fontSize="14" textAnchor="middle"
        transform={`rotate(-90, 20, ${gPadT + gInnerH / 2})`}>x_rel ({unit})</text>
      {plotData.length >= 2 ? (
        <path d={pathGraph} fill="none" stroke="#6fb0ff" strokeWidth="2.6" />
      ) : (
        <text x={gW / 2} y={gH / 2} textAnchor="middle" fill="#94a3b8" fontSize="13">
          La gráfica inicia al aplicar la fuerza
        </text>
      )}
      {plotData.length > 0 && (
        <>
          <text x={gPadL + 8} y={22} fill="#a7b0bc" fontSize="12">
            |x_rel| ≈ {round(Math.max(...plotData.map((p) => Math.abs(p.xr))))} {unit}
          </text>
          <text x={gW - gPadR} y={22} fill="#a7b0bc" fontSize="12" textAnchor="end">
            t: {round(plotData[plotData.length - 1].t)} s
          </text>
        </>
      )}
    </svg>
  );
}

function round(x, d = 3) {
  const k = Math.pow(10, d);
  return Math.round(Number(x) * k) / k;
}