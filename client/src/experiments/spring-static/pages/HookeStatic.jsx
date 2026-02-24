// client/src/experiments/spring-static/pages/HookeStatic.jsx
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import "../styles/hooke.css";
import HookeMAS from "./HookeMAS";

export default function HookeStatic({ initialShowMAS = false }) {
  const LS_KEY = "lab2hand:spring-static:v1";

  const [massValue, setMassValue] = useState(200);
  const [massUnit, setMassUnit] = useState("g");
  const [lenUnit, setLenUnit] = useState("cm");
  const [k, setK] = useState(50);
  const [g, setG] = useState(9.81);
  const [L0, setL0] = useState(30);

  const [rows, setRows] = useState([]);
  const [rightTab, setRightTab] = useState("visual");
  const [showFit, setShowFit] = useState(true);

  const [errMass, setErrMass] = useState("");
  const [errK, setErrK] = useState("");
  const [errG, setErrG] = useState("");
  const [errL0, setErrL0] = useState("");
  const [warnKZero, setWarnKZero] = useState(false);

  const [showMAS, setShowMAS] = useState(initialShowMAS);

  const isNum = (v) => Number.isFinite(Number(v));
  const toNumOr = (v, def = 0) => (isNum(v) ? Number(v) : def);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== "object") return;
      if (saved.massValue !== undefined) setMassValue(saved.massValue);
      if (saved.massUnit) setMassUnit(saved.massUnit);
      if (saved.lenUnit) setLenUnit(saved.lenUnit);
      if (saved.k !== undefined) setK(saved.k);
      if (saved.g !== undefined) setG(saved.g);
      if (saved.L0 !== undefined) setL0(saved.L0);
      if (saved.showFit !== undefined) setShowFit(saved.showFit);
    } catch {}
  }, []);

  useEffect(() => {
    const payload = { massValue, massUnit, lenUnit, k, g, L0, showFit };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch {}
  }, [massValue, massUnit, lenUnit, k, g, L0, showFit]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      const kk = e.key.toLowerCase();
      if (kk === "c") handleCapture();
      if (kk === "l") clearRows();
      if (kk === "e") exportCSV();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [massValue, massUnit, lenUnit, k, g, L0, rows]);

  const massKg = useMemo(
    () =>
      massUnit === "g"
        ? Math.max(0, toNumOr(massValue, 0)) / 1000
        : Math.max(0, toNumOr(massValue, 0)),
    [massValue, massUnit]
  );
  const L0_m = useMemo(
    () =>
      lenUnit === "cm"
        ? Math.max(0, toNumOr(L0, 0)) / 100
        : Math.max(0, toNumOr(L0, 0)),
    [L0, lenUnit]
  );

  const safeK = useMemo(() => {
    const val = Math.max(0, toNumOr(k, 0));
    const eps = 1e-9;
    const nearZero = val < eps;
    setWarnKZero(nearZero);
    return nearZero ? eps : val;
  }, [k]);

  const elong_m = useMemo(() => {
    const m = Math.max(0, massKg);
    const gg = Math.max(0, toNumOr(g, 0));
    return (m * gg) / safeK;
  }, [massKg, g, safeK]);

  const length_m = useMemo(() => L0_m + elong_m, [L0_m, elong_m]);

  const lenLabel = lenUnit === "cm" ? "cm" : "m";
  const massLabel = massUnit === "g" ? "g" : "kg";

  const elong_UI = useMemo(
    () => (lenUnit === "cm" ? elong_m * 100 : elong_m),
    [elong_m, lenUnit]
  );
  const length_UI = useMemo(
    () => (lenUnit === "cm" ? length_m * 100 : length_m),
    [length_m, lenUnit]
  );

  const blurNonNegative = (value, setValue, setErr, label) => {
    if (!isNum(value)) {
      setErr(`Entrada no válida: se requiere un número para ${label}`);
      return;
    }
    const num = Number(value);
    if (num < 0) {
      setValue(0);
      setErr(`${label} no puede ser negativo; se ajustó a 0`);
    } else {
      setErr("");
    }
  };

  const handleCapture = () => {
    const anyErr =
      errMass || errK || errG || errL0 ||
      !isNum(massValue) || !isNum(k) || !isNum(g) || !isNum(L0) ||
      Number(massValue) < 0 || Number(k) < 0 || Number(g) < 0 || Number(L0) < 0;
    if (anyErr) return;

    setRows((prev) => [
      ...prev,
      {
        m_kg: round(massKg, 5),
        m_ui: round(Math.max(0, toNumOr(massValue, 0)), 5),
        k_Npm: round(Math.max(0, toNumOr(k, 0)), 5),
        g_ms2: round(Math.max(0, toNumOr(g, 0)), 5),
        x_ui: round(Math.max(0, toNumOr(elong_UI, 0)), 5),
        L_ui: round(Math.max(0, toNumOr(length_UI, 0)), 5),
        massUnit,
        lenUnit,
      },
    ]);
  };

  const clearRows = () => setRows([]);

  const exportCSV = () => {
    if (rows.length === 0) return;
    const head = [
      `m (${massLabel})`, "m (kg)", "k (N/m)", "g (m/s^2)",
      `x (${lenLabel})`, `L (${lenLabel})`,
    ];
    const data = rows.map((r) => [r.m_ui, r.m_kg, r.k_Npm, r.g_ms2, r.x_ui, r.L_ui]);
    const csv = [head.join(","), ...data.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spring_static_captures_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viz = useMemo(() => ({
    w: 420, h: 420, topPadding: 30, left: 200,
    coils: 10, amp: 22, ceilingH: 14, hookLen: 12,
    blockW: 100, blockH: 70, pxPerUI: 6,
  }), []);

  const restLenUI = Math.max(0, toNumOr(L0, 0));
  const elongLenUI = Math.max(0, toNumOr(elong_UI, 0));
  const totalLenUI = restLenUI + elongLenUI;

  const springTopY = viz.topPadding + viz.ceilingH + viz.hookLen;
  const springLenPx = totalLenUI * viz.pxPerUI;
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

  const pointsSI = useMemo(() => {
    if (rows.length === 0) return [];
    return rows.map((r) => {
      const x_m = r.lenUnit === "cm" ? Number(r.x_ui) / 100 : Number(r.x_ui);
      return { m_kg: Number(r.m_kg), x_m };
    });
  }, [rows]);

  const regression = useMemo(() => {
    if (pointsSI.length < 2) return null;
    const n = pointsSI.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (const p of pointsSI) {
      sumX += p.m_kg; sumY += p.x_m;
      sumXY += p.m_kg * p.x_m; sumXX += p.m_kg * p.m_kg;
    }
    const denom = n * sumXX - sumX * sumX;
    if (Math.abs(denom) < 1e-12) return null;
    const a = (n * sumXY - sumX * sumY) / denom;
    const b = (sumY - a * sumX) / n;
    const kEst = a !== 0 ? Math.max(0, toNumOr(g, 0)) / a : NaN;
    const kVal = Math.max(0, toNumOr(k, 0));
    const errRel = isFinite(kEst) && kVal !== 0 ? Math.abs(kEst - kVal) / kVal : NaN;
    return { a, b, kEst, errRel };
  }, [pointsSI, g, k]);

  const massLabelLocal = massLabel;
  const lenLabelLocal = lenLabel;

  const chartData = useMemo(() => {
    const maxMkg = Math.max(massKg || 0, ...rows.map((r) => Number(r.m_kg) || 0), 1);
    const endKg = Math.max(0.5, maxMkg * 1.1);
    const steps = 24;
    const arr = [];
    for (let i = 0; i <= steps; i++) {
      const m_kg = (endKg * i) / steps;
      const m_axis = massUnit === "g" ? m_kg * 1000 : m_kg;
      let xFit_ui = null;
      if (regression) {
        const xFit_m = regression.a * m_kg + regression.b;
        xFit_ui = lenUnit === "cm" ? xFit_m * 100 : xFit_m;
      }
      arr.push({ m_axis, fit: xFit_ui });
    }
    return arr;
  }, [rows, massKg, lenUnit, regression, massUnit]);

  const pointsUI = useMemo(() => {
    return rows.map((r) => ({
      m_axis: massUnit === "g" ? Number(r.m_kg) * 1000 : Number(r.m_kg),
      x_ui: Number(r.x_ui),
    }));
  }, [rows, massUnit]);

  const yDomain = useMemo(() => {
    const maxFromFit = chartData.reduce(
      (m, d) => Math.max(m, isFinite(d.fit) ? Number(d.fit) : 0), 0
    );
    const maxFromPoints = pointsUI.reduce(
      (m, d) => Math.max(m, Number(d.x_ui) || 0), 0
    );
    const maxVal = Math.max(maxFromFit, maxFromPoints);
    const pad = maxVal > 0 ? maxVal * 0.1 : lenUnit === "cm" ? 1 : 0.01;
    return [0, maxVal + pad];
  }, [chartData, pointsUI, lenUnit]);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="hs-page">
      <style>{`
        .hs-page {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 24px 48px;
        }

        /* ── Header ── */
        .hs-header {
          padding: 28px 0 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 24px;
        }
        .hs-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
          line-height: 1.3;
        }
        .hs-header p {
          font-size: 13.5px;
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }
        .hs-header .hs-kbd {
          font-family: ui-monospace, monospace;
          background: rgba(255,255,255,0.07);
          padding: 1px 6px;
          border-radius: 4px;
          color: #94a3b8;
          font-size: 12px;
        }

        /* ── Layout 2 columnas ── */
        .hs-main-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 20px;
          align-items: start;
          margin-bottom: 20px;
        }
        @media (max-width: 900px) {
          .hs-main-grid { grid-template-columns: 1fr; }
        }

        /* ── Cards ── */
        .hs-card {
          background: rgba(13, 20, 33, 0.75);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .hs-card:last-child { margin-bottom: 0; }
        .hs-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 12px;
        }
        .hs-card-head h2 {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          margin: 0;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .hs-card-body { padding: 20px; }

        /* ── Campos ── */
        .hs-field-grid { display: grid; gap: 12px; }

        .hs-units-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          flex-wrap: wrap;
        }
        .hs-units-sep { color: #1e293b; }
        .hs-unit-label {
          font-size: 12px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .hs-select {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 7px;
          padding: 6px 10px;
          color: #e2e8f0;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }

        .hs-field-row {
          display: grid;
          grid-template-columns: 150px 1fr 36px;
          align-items: center;
          gap: 10px;
        }
        .hs-field-label {
          font-size: 13px;
          color: #94a3b8;
        }
        .hs-field-unit {
          font-size: 12px;
          color: #475569;
          font-family: ui-monospace, monospace;
        }
        .hs-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 8px;
          padding: 9px 12px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: ui-monospace, monospace;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .hs-input:focus {
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .hs-warn {
          font-size: 12px;
          color: #f59e0b;
          padding-left: 2px;
          margin-top: -4px;
        }

        /* ── Resumen calculado ── */
        .hs-calc-box {
          padding: 12px 14px;
          background: rgba(59,130,246,0.05);
          border: 1px solid rgba(59,130,246,0.12);
          border-radius: 10px;
          font-size: 12.5px;
          color: #64748b;
          font-family: ui-monospace, monospace;
          line-height: 1.7;
          margin-top: 4px;
        }
        .hs-calc-hi { color: #93c5fd; font-weight: 600; }

        /* ── Acciones ── */
        .hs-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 16px;
          margin-top: 4px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .hs-btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          border: none;
          border-radius: 9px;
          padding: 9px 18px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 3px 12px rgba(37,99,235,0.3);
          transition: opacity 0.2s, transform 0.15s;
        }
        .hs-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .hs-btn-ghost {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 9px;
          padding: 9px 14px;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .hs-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #e2e8f0; }

        /* ── Tabs panel visual ── */
        .hs-tabs { display: flex; gap: 4px; }
        .hs-tab {
          padding: 5px 14px;
          border-radius: 7px;
          border: 1px solid transparent;
          font-size: 12.5px;
          font-family: inherit;
          cursor: pointer;
          background: none;
          color: #64748b;
          transition: all 0.15s;
        }
        .hs-tab.active {
          background: rgba(37,99,235,0.12);
          border-color: rgba(37,99,235,0.3);
          color: #93c5fd;
        }

        /* ── Resultado ── */
        .hs-result-box {
          padding: 36px 20px;
          display: flex;
          gap: 32px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hs-result-item { text-align: center; }
        .hs-result-value {
          font-size: 2rem;
          font-weight: 700;
          color: #60a5fa;
          font-family: ui-monospace, monospace;
          letter-spacing: -1px;
          line-height: 1;
        }
        .hs-result-unit { font-size: 1rem; color: #475569; margin-left: 4px; }
        .hs-result-label { font-size: 12px; color: #475569; margin-top: 6px; }

        /* ── Gráfica ── */
        .hs-chart-area { height: 320px; }

        /* ── Tabla ── */
        .hs-table-wrap { overflow-x: auto; }
        .hs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .hs-table th {
          padding: 10px 16px;
          text-align: left;
          color: #64748b;
          font-weight: 500;
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .hs-table td {
          padding: 10px 16px;
          font-family: ui-monospace, monospace;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .hs-table tr:last-child td { border-bottom: none; }
        .hs-table-empty {
          padding: 24px 16px;
          text-align: center;
          color: #374151;
          font-size: 13px;
        }
      `}</style>

      {/* ── Header ── */}
      <header className="hs-header">
        <h1>Spring — Equilibrio estático · Ley de Hooke</h1>
        <p>
          Modelo: mg = k·x → x = (m·g)/k &nbsp;·&nbsp; Atajos:{" "}
          <span className="hs-kbd">C</span> Capturar &nbsp;
          <span className="hs-kbd">L</span> Limpiar &nbsp;
          <span className="hs-kbd">E</span> Exportar
        </p>
      </header>

      {/* ── Fila principal ── */}
      <div className="hs-main-grid">

        {/* Panel izquierdo: Parámetros */}
        <div className="hs-card">
          <div className="hs-card-head">
            <h2>Parámetros</h2>
            <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>
              L₀ = {round(Math.max(0, toNumOr(L0, 0)))} {lenLabel}
            </span>
          </div>
          <div className="hs-card-body">
            <div className="hs-field-grid">

              {/* Unidades */}
              <div className="hs-units-row">
                <span className="hs-unit-label">Masa</span>
                <select className="hs-select" value={massUnit}
                  onChange={(e) => { setMassUnit(e.target.value); setErrMass(""); }}>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </select>
                <span className="hs-units-sep">·</span>
                <span className="hs-unit-label">Longitud</span>
                <select className="hs-select" value={lenUnit}
                  onChange={(e) => { setLenUnit(e.target.value); setErrL0(""); }}>
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                </select>
              </div>

              {/* Masa m */}
              <div className="hs-field-row">
                <label className="hs-field-label">Masa m</label>
                <input className="hs-input" type="number" value={massValue}
                  onChange={(e) => setMassValue(e.target.value)}
                  onBlur={() => blurNonNegative(massValue, setMassValue, setErrMass, "m")}
                  step="any" min="0"
                  style={{ borderColor: errMass ? "#f59e0b" : undefined }}
                />
                <span className="hs-field-unit">{massLabel}</span>
              </div>
              {errMass && <div className="hs-warn">{errMass}</div>}

              {/* Constante k */}
              <div className="hs-field-row">
                <label className="hs-field-label">Constante k</label>
                <input className="hs-input" type="number" value={k}
                  onChange={(e) => setK(e.target.value)}
                  onBlur={() => blurNonNegative(k, setK, setErrK, "k")}
                  step="any" min="0"
                  style={{ borderColor: errK ? "#f59e0b" : undefined }}
                />
                <span className="hs-field-unit">N/m</span>
              </div>
              {errK && <div className="hs-warn">{errK}</div>}
              {warnKZero && <div className="hs-warn">Aviso: k ≈ 0; se usa valor mínimo interno.</div>}

              {/* Gravedad g */}
              <div className="hs-field-row">
                <label className="hs-field-label">Gravedad g</label>
                <input className="hs-input" type="number" value={g}
                  onChange={(e) => setG(e.target.value)}
                  onBlur={() => blurNonNegative(g, setG, setErrG, "g")}
                  step="any" min="0"
                  style={{ borderColor: errG ? "#f59e0b" : undefined }}
                />
                <span className="hs-field-unit">m/s²</span>
              </div>
              {errG && <div className="hs-warn">{errG}</div>}

              {/* Longitud reposo L₀ */}
              <div className="hs-field-row">
                <label className="hs-field-label">Longitud reposo L₀</label>
                <input className="hs-input" type="number" value={L0}
                  onChange={(e) => setL0(e.target.value)}
                  onBlur={() => blurNonNegative(L0, setL0, setErrL0, "L₀")}
                  step="any" min="0"
                  style={{ borderColor: errL0 ? "#f59e0b" : undefined }}
                />
                <span className="hs-field-unit">{lenLabel}</span>
              </div>
              {errL0 && <div className="hs-warn">{errL0}</div>}

              {/* Resumen calculado */}
              <div className="hs-calc-box">
                <div>
                  m = {round(massKg)} kg · k = {round(Math.max(0, toNumOr(k, 0)))} N/m · g = {round(Math.max(0, toNumOr(g, 0)))} m/s²
                </div>
                <div>
                  x = <span className="hs-calc-hi">{round(Math.max(0, toNumOr(elong_UI, 0)))} {lenLabel}</span>
                  &nbsp;·&nbsp;
                  L = <span className="hs-calc-hi">{round(Math.max(0, toNumOr(length_UI, 0)))} {lenLabel}</span>
                </div>
              </div>

              {/* Botones */}
              <div className="hs-actions">
                <button className="hs-btn-primary" onClick={handleCapture}>Capturar</button>
                <button className="hs-btn-ghost" onClick={clearRows}>Limpiar tabla</button>
                <button className="hs-btn-ghost" onClick={exportCSV}>Exportar CSV</button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho: Visual / Resultado */}
        <div className="hs-card" style={{ marginBottom: 0 }}>
          <div className="hs-card-head">
            <div className="hs-tabs">
              <button className={`hs-tab ${rightTab === "visual" ? "active" : ""}`}
                onClick={() => setRightTab("visual")}>Visual</button>
              <button className={`hs-tab ${rightTab === "instant" ? "active" : ""}`}
                onClick={() => setRightTab("instant")}>Resultado</button>
            </div>
          </div>

          {rightTab === "visual" ? (
            <div style={{ overflow: "visible" }}>
              <svg width="100%" height={viz.h} viewBox={`0 0 ${viz.w} ${viz.h}`}>
                <rect x={40} y={viz.topPadding} width={viz.w - 80} height={viz.ceilingH} fill="#1f2937" stroke="#2a3546" />
                <line x1={viz.left} y1={viz.topPadding + viz.ceilingH} x2={viz.left} y2={viz.topPadding + viz.ceilingH + viz.hookLen} stroke="#aab4c3" strokeWidth="2" />
                <path d={springPath} stroke="#9ec5ff" strokeWidth="2" fill="none" />
                <line x1={viz.left} y1={springBottomY} x2={viz.left} y2={springBottomY + 6} stroke="#aab4c3" strokeWidth="2" />
                <g transform={`translate(${blockX}, ${blockY})`}>
                  <rect x="0" y="20" width={viz.blockW} height={viz.blockH - 20} rx="8" fill="#364152" stroke="#2a3546" />
                  <rect x={viz.blockW * 0.2} y="0" width={viz.blockW * 0.6} height="28" rx="4" fill="#4b5b70" stroke="#2a3546" />
                  <rect x={viz.blockW * 0.38} y={viz.blockH - 2} width={viz.blockW * 0.24} height="6" fill="#2a3546" />
                </g>
                <g>
                  <line x1={60} y1={springTopY} x2={60} y2={springBottomY} stroke="#415169" />
                  {Array.from({ length: 6 }).map((_, i) => {
                    const y = springTopY + (springLenPx * i) / 5;
                    return <line key={i} x1={56} y1={y} x2={64} y2={y} stroke="#415169" />;
                  })}
                  <text x={50} y={springTopY - 10} fill="#9aa4b2" fontSize="12" textAnchor="end">{lenLabel}</text>
                </g>
              </svg>
            </div>
          ) : (
            <div className="hs-result-box">
              <div className="hs-result-item">
                <div className="hs-result-value">
                  {round(Math.max(0, toNumOr(elong_UI, 0)))}
                  <span className="hs-result-unit">{lenLabel}</span>
                </div>
                <div className="hs-result-label">Elongación x</div>
              </div>
              <div className="hs-result-item">
                <div className="hs-result-value">
                  {round(Math.max(0, toNumOr(length_UI, 0)))}
                  <span className="hs-result-unit">{lenLabel}</span>
                </div>
                <div className="hs-result-label">Longitud total L</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Gráfica ── */}
      <div className="hs-card">
        <div className="hs-card-head">
          <h2>Gráfica x vs m</h2>
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={showFit} onChange={(e) => setShowFit(e.target.checked)} />
            <span style={{ fontSize: 12, color: "#64748b" }}>Mostrar recta ajustada</span>
          </label>
        </div>
        <div className="hs-card-body">
          <div className="hs-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 84, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m_axis" type="number" tickCount={8} domain={["dataMin", "dataMax"]}
                  label={{ value: `m (${massLabelLocal})`, position: "insideBottom", offset: -10 }} />
                <YAxis tickFormatter={(v) => round(v)} domain={yDomain} tickCount={8}
                  label={{ value: `x (${lenLabelLocal})`, angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v) => round(v)} labelFormatter={(m) => `m = ${round(m)} ${massLabelLocal}`} />
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 14 }} />
                {showFit && regression && (
                  <Line type="monotone" dataKey="fit"
                    name={`Ajuste x ≈ a·m + b (k_est=${regression.kEst ? round(regression.kEst) : "—"} N/m)`}
                    dot={false} strokeWidth={2} strokeDasharray="6 4" isAnimationActive={false} />
                )}
                <Line data={pointsUI} type="linear" dataKey="x_ui"
                  name={`Capturas x(${lenLabelLocal})`}
                  strokeWidth={0} dot={{ r: 4 }} isAnimationActive={false} />
                <ReferenceLine x={0} stroke="#6b7280" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {regression ? (
            <div style={{ marginTop: 14, fontSize: 12.5, color: "#64748b", fontFamily: "monospace", lineHeight: 1.8 }}>
              <div>Recta ajustada en SI: x ≈ <b>a</b>·m + <b>b</b> con a = {round(regression.a)} (m/kg), b = {round(regression.b)} m.</div>
              <div>Estimación: k<sub>est</sub> = g / a = {regression.kEst ? <b>{round(regression.kEst)}</b> : "—"} N/m.</div>
              <div>Error relativo vs k: {isFinite(regression.errRel) ? <b>{round(regression.errRel * 100)}%</b> : "—"}</div>
            </div>
          ) : (
            <div style={{ marginTop: 12, fontSize: 12.5, color: "#475569" }}>
              Se requieren al menos 2 capturas con distinta masa para estimar k.
            </div>
          )}
        </div>
      </div>

      {/* ── Tabla de capturas ── */}
      <div className="hs-card">
        <div className="hs-card-head">
          <h2>Tabla de capturas ({rows.length})</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="hs-btn-ghost" onClick={exportCSV}>Exportar CSV</button>
            <button className="hs-btn-ghost" onClick={clearRows}>Limpiar</button>
          </div>
        </div>
        <div className="hs-table-wrap">
          <table className="hs-table">
            <thead>
              <tr>
                {["Masa (UI)", "Masa (kg)", "k (N/m)", "g (m/s²)", "x (UI)", "L (UI)"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="hs-table-empty">Sin capturas. Usa "Capturar".</td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.m_ui} {r.massUnit}</td>
                    <td>{r.m_kg}</td>
                    <td>{r.k_Npm}</td>
                    <td>{r.g_ms2}</td>
                    <td>{r.x_ui} {r.lenUnit}</td>
                    <td>{r.L_ui} {r.lenUnit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overlay MAS */}
      <HookeMAS
        open={showMAS}
        onClose={() => setShowMAS(false)}
        onEditParams={() => {}}
        params={{ massValue, massUnit, lenUnit, k, g, L0, massKg, elong_m }}
      />
    </div>
  );
}

function round(x, d = 3) {
  const k = Math.pow(10, d);
  return Math.round(Number(x) * k) / k;
}