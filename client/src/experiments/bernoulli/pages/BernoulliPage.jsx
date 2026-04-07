// client/src/experiments/bernoulli/pages/BernoulliPage.jsx
// Changes: page-enter/exit animation, handleGoHome with fade-out, row highlight on capture

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Controls from "../components/Controls.jsx";
import SimulationTank from "../components/SimulationTank.jsx";
import ControlsSim from "../components/ControlsSim.jsx";
import CaptureTable from "../components/CaptureTable.jsx";
import ChartHXSection from "../components/ChartHXSection.jsx";
import FinishOverlay from "../../../shared/components/FinishOverlay.jsx";
import { exportToExcel } from '../../../shared/utils/exportExcel.js';

export default function BernoulliPage() {
  const navigate = useNavigate();
  const [unit, setUnit] = useState("cm");
  const [height, setHeight] = useState(50);
  const [diameter, setDiameter] = useState(40);
  const [holeDiameter, setHoleDiameter] = useState(0.5);

  const [level, setLevel] = useState(0);
  const [isFilled, setIsFilled] = useState(false);
  const [isDraining, setIsDraining] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tankVisible, setTankVisible] = useState(true);
  const [captures, setCaptures] = useState([]);

  const [ended, setEnded] = useState(false);
  const [showFinishOverlay, setShowFinishOverlay] = useState(false);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [speedFactor, setSpeedFactor] = useState(50);

  const [autoCaptureActive, setAutoCaptureActive] = useState(false);
  const [autoIntervalSec, setAutoIntervalSec] = useState(1.0);
  const autoTimerRef = useRef(null);

  const rafRef = useRef(null);
  const lastTSRef = useRef(0);
  const drainStartTimeRef = useRef(null);
  const hRef_m = useRef(0);
  const simParamsRef = useRef({ A: 0, ao: 0, k: 1 });

  const g = 9.81;
  const y0 = 0.05;

  const uiToMeters = (val) => (unit === "cm" ? Number(val) / 100 : Number(val));
  const metersToUi = (val) => (unit === "cm" ? val * 100 : val);
  const stopRAF = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };

  // ── Microinteracciones ──
  const [exiting, setExiting] = useState(false);
  const [lastCaptureIdx, setLastCaptureIdx] = useState(-1);

  const handleGoHome = () => {
    setExiting(true);
    setTimeout(() => navigate("/"), 250);
  };

  useEffect(() => { if (ended) setShowFinishOverlay(true); }, [ended]);

  const startLoop = () => {
    lastTSRef.current = performance.now();
    const step = (ts) => {
      const prev = lastTSRef.current;
      lastTSRef.current = ts;
      const dtReal = Math.min(0.05, (ts - prev) / 1000);
      const dt = dtReal * (simParamsRef.current.k || 1);
      let h = hRef_m.current;
      if (h > 0) {
        const { A, ao } = simParamsRef.current;
        const dhdt = -(ao / A) * Math.sqrt(2 * g * h);
        h = Math.max(0, h + dhdt * dt);
        hRef_m.current = h;
        setLevel(metersToUi(h));
        rafRef.current = requestAnimationFrame(step);
      } else {
        setIsDraining(false); setPaused(false); setEnded(true);
        rafRef.current = null; clearAutoCapture();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const handleFill = () => {
    if (ended) return;
    stopRAF(); clearAutoCapture(); setTankVisible(true);
    setIsDraining(false); setPaused(false); setIsFilled(true);
    setLevel(Number(height) || 0);
    hRef_m.current = uiToMeters(Number(height) || 0);
    drainStartTimeRef.current = null;
  };

  const handleStartDrain = () => {
    if (ended || !isFilled) return;
    stopRAF(); setIsDraining(true); setPaused(false); setTankVisible(true);
    drainStartTimeRef.current = performance.now();
    const Dm = uiToMeters(diameter), do_m = uiToMeters(holeDiameter);
    const A = Math.PI * Math.pow(Dm / 2, 2), ao = Math.PI * Math.pow(do_m / 2, 2);
    simParamsRef.current = { A, ao, k: Number(speedFactor) || 1 };
    hRef_m.current = Math.max(0, uiToMeters(level));
    startLoop();
    if (autoCaptureActive) {
      const intervalMs = Math.max(0.1, Number(autoIntervalSec) || 1) * 1000;
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = setInterval(() => { handleCapture(); }, intervalMs);
    }
  };

  const handleTogglePause = () => {
    if (ended) return;
    if (paused) { setPaused(false); setIsDraining(true); startLoop(); if (autoCaptureActive) restartAutoCapture(); }
    else { stopRAF(); setPaused(true); setIsDraining(false); if (autoCaptureActive) pauseAutoCapture(); }
  };

  const handleCapture = () => {
    const now = performance.now(), t0 = drainStartTimeRef.current;
    const secs = t0 ? (now - t0) / 1000 : 0;
    const h_m = Math.max(0, hRef_m.current);
    const x_m = 2 * Math.sqrt(h_m * y0), x_ui = metersToUi(x_m);
    setCaptures((prev) => [...prev, {
      time: Number(secs.toFixed(2)), h: Number(metersToUi(h_m).toFixed(3)), x: Number(x_ui.toFixed(3)),
    }]);
    setLastCaptureIdx(captures.length);
    setTimeout(() => setLastCaptureIdx(-1), 900);
  };

  const handleReset = () => {
    stopRAF(); clearAutoCapture(); setLevel(0); setIsFilled(false);
    setIsDraining(false); setPaused(false); setTankVisible(true);
    setCaptures([]); setEnded(false); setShowFinishOverlay(false);
    drainStartTimeRef.current = null; hRef_m.current = 0;
  };

  const handleEditRow = (index, newRow) => {
    const h_ui = Math.max(0, Number(newRow.h) || 0), h_m = uiToMeters(h_ui);
    const x_m = 2 * Math.sqrt(Math.max(0, h_m) * y0), x_ui = metersToUi(x_m);
    setCaptures((prev) => prev.map((r, i) => (i === index ? { ...newRow, h: h_ui, x: Number(x_ui.toFixed(3)) } : r)));
  };

  const handleExportCSV = () => {
    const unitLabel = unit === "cm" ? "cm" : "m";
    exportToExcel({
      title: 'Principio de Bernoulli (Torricelli)',
      subtitle: 'Simulación de vaciado de recipiente — Lab2Hand',
      params: [`h = ${height} ${unitLabel}`, `D = ${diameter} ${unitLabel}`, `dₒ = ${holeDiameter} ${unitLabel}`],
      headers: ['Tiempo (s)', `Altura h (${unitLabel})`, `Distancia x (${unitLabel})`],
      data: captures.map((r) => [r.time, r.h, r.x]),
      filename: `bernoulli_lab2hand_${new Date().toISOString().slice(0,10)}`,
      sheetName: 'Bernoulli',
    });
  };

  const startAutoCapture = () => {
    if (paused) return;
    setAutoCaptureActive(true);
    if (isDraining) {
      const intervalMs = Math.max(0.1, Number(autoIntervalSec) || 1) * 1000;
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      autoTimerRef.current = setInterval(() => { handleCapture(); }, intervalMs);
    }
  };
  const clearAutoCapture = () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current); autoTimerRef.current = null; setAutoCaptureActive(false); };
  const pauseAutoCapture = () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current); autoTimerRef.current = null; };
  const restartAutoCapture = () => { if (!autoCaptureActive || !isDraining || paused) return; startAutoCapture(); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (k === "c") { if (isFilled && tankVisible && !paused) handleCapture(); }
      else if (k === "p") handleTogglePause();
      else if (k === "r") handleReset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFilled, tankVisible, paused, ended]);

  useEffect(() => () => { stopRAF(); clearAutoCapture(); }, []);

  const layoutClass = `layout-shell ${leftCollapsed ? "is-collapsed" : ""}`;

  return (
    <div className={`container container-wide page-enter${exiting ? " page-exit" : ""}`}>
      <FinishOverlay visible={showFinishOverlay} title="Finalizado" subtitle="Bernoulli — Torricelli" onDone={() => setShowFinishOverlay(false)} />

      <div className="app-title" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1>Lab2hand</h1>
          <span className="badge">Simulación</span>
        </div>
        <button onClick={handleGoHome} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "9px 16px", color: "#94a3b8", fontSize: "13.5px", fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.2s, color 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#e2e8f0"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#94a3b8"; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Volver al inicio
        </button>
      </div>

      <div className={layoutClass}>
        <div className="card sidebar-card">
          <div className="sidebar-handle" onClick={() => setLeftCollapsed((v) => !v)} title={leftCollapsed ? "Mostrar parámetros" : "Ocultar parámetros"} aria-label="Toggle sidebar">
            <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" /></svg>
          </div>
          <div className="card-header"><h2 style={{ margin: 0 }}>Parámetros del recipiente</h2></div>
          {!leftCollapsed && (
            <div className="card-body">
              <Controls unit={unit} height={height} diameter={diameter} holeDiameter={holeDiameter}
                onUnitChange={setUnit} onHeightChange={setHeight} onDiameterChange={setDiameter} onHoleDiameterChange={setHoleDiameter} />
            </div>
          )}
        </div>

        <div className="card right-card">
          <div className="right-split">
            <div className="tank-wrap">
              <h2>Vista del recipiente</h2>
              <SimulationTank unit={unit} height={height} diameter={diameter} holeDiameter={holeDiameter}
                level={level} isDraining={isDraining} visible={tankVisible} showRuler={showRuler} />
              <ControlsSim canFill={!isDraining && !paused && !ended} canStartDrain={isFilled && !isDraining && tankVisible && !paused && !ended}
                canCapture={isFilled && tankVisible && !paused} onFill={handleFill} onStartDrain={handleStartDrain} onCapture={handleCapture}
                onReset={handleReset} speedFactor={speedFactor} onSpeedChange={setSpeedFactor} showRuler={showRuler}
                onToggleRuler={() => setShowRuler((v) => !v)} paused={paused} onTogglePause={handleTogglePause}
                canTogglePause={(isDraining || paused) && tankVisible && !ended} autoCaptureActive={autoCaptureActive}
                autoIntervalSec={autoIntervalSec} onChangeAutoInterval={setAutoIntervalSec}
                onStartAutoCapture={startAutoCapture} onStopAutoCapture={clearAutoCapture} isDraining={isDraining} isFilled={isFilled} />
              <div className="chart-card"><ChartHXSection rows={captures} unit={unit} /></div>
            </div>
            <div className="captures-card">
              <CaptureTable unit={unit} rows={captures} editable={!tankVisible} maxHeight={Number(height) || 0}
                onEditRow={handleEditRow} onExport={handleExportCSV} canExport={ended && captures.length > 0} highlightIndex={lastCaptureIdx} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
