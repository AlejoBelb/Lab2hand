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

/* Página: HookeStatic (Spring – equilibrio estático)
   - Modelo: mg = k·x  ⇒  x = (m·g)/k
   - Validación: solo números y NO negativos (m, k, g, L0 >= 0).
   - Protección: si k ≈ 0, usar ε para evitar división por cero y avisar.
   - Sin overlay “Finalizado”; el experimento es manual e indefinido.
*/
export default function HookeStatic() {
  const LS_KEY = "lab2hand:spring-static:v1";

  // Estado principal
  const [massValue, setMassValue] = useState(200);
  const [massUnit, setMassUnit] = useState("g");
  const [lenUnit, setLenUnit] = useState("cm");
  const [k, setK] = useState(50);
  const [g, setG] = useState(9.81);
  const [L0, setL0] = useState(30);

  const [rows, setRows] = useState([]);
  const [rightTab, setRightTab] = useState("visual");
  const [showFit, setShowFit] = useState(true);

  // Errores/avisos
  const [errMass, setErrMass] = useState("");
  const [errK, setErrK] = useState("");
  const [errG, setErrG] = useState("");
  const [errL0, setErrL0] = useState("");
  const [warnKZero, setWarnKZero] = useState(false);

  // Overlay MAS
  const [showMAS, setShowMAS] = useState(false);

  // Utilidades
  const isNum = (v) => Number.isFinite(Number(v));
  const toNumOr = (v, def = 0) => (isNum(v) ? Number(v) : def);

  // Persistencia en localStorage
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

  // Atajos: C (capturar), L (limpiar), E (exportar)
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

  // Conversión a SI
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

  // Protección de k para evitar división por cero
  const safeK = useMemo(() => {
    const val = Math.max(0, toNumOr(k, 0));
    const eps = 1e-9;
    const nearZero = val < eps;
    setWarnKZero(nearZero);
    return nearZero ? eps : val;
  }, [k]);

  // Cálculos en SI
  const elong_m = useMemo(() => {
    const m = Math.max(0, massKg);
    const gg = Math.max(0, toNumOr(g, 0));
    return (m * gg) / safeK;
  }, [massKg, g, safeK]);
  const length_m = useMemo(() => L0_m + elong_m, [L0_m, elong_m]);

  // Unidades en UI
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

  // Validación en blur: no negativos y numérico
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

  // Captura de fila
  const handleCapture = () => {
    const anyErr =
      errMass ||
      errK ||
      errG ||
      errL0 ||
      !isNum(massValue) ||
      !isNum(k) ||
      !isNum(g) ||
      !isNum(L0) ||
      Number(massValue) < 0 ||
      Number(k) < 0 ||
      Number(g) < 0 ||
      Number(L0) < 0;
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

  // Limpiar y exportar
  const clearRows = () => setRows([]);
  const exportCSV = () => {
    if (rows.length === 0) return;
    const head = [
      `m (${massLabel})`,
      "m (kg)",
      "k (N/m)",
      "g (m/s^2)",
      `x (${lenLabel})`,
      `L (${lenLabel})`,
    ];
    const data = rows.map((r) => [
      r.m_ui,
      r.m_kg,
      r.k_Npm,
      r.g_ms2,
      r.x_ui,
      r.L_ui,
    ]);
    const csv = [head.join(","), ...data.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spring_static_captures_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parámetros de visualización
  const viz = useMemo(
    () => ({
      w: 420,
      h: 420,
      topPadding: 30,
      left: 200,
      coils: 10,
      amp: 22,
      ceilingH: 14,
      hookLen: 12,
      blockW: 100,
      blockH: 70,
      pxPerUI: 6,
    }),
    []
  );

  // Geometría del resorte y bloque
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
    let x = x0,
      y = y0;
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

  // Datos en SI para regresión lineal x vs m
  const pointsSI = useMemo(() => {
    if (rows.length === 0) return [];
    return rows.map((r) => {
      const x_m = r.lenUnit === "cm" ? Number(r.x_ui) / 100 : Number(r.x_ui);
      return { m_kg: Number(r.m_kg), x_m };
    });
  }, [rows]);

  // Regresión lineal en SI y estimación de k
  const regression = useMemo(() => {
    if (pointsSI.length < 2) return null;
    const n = pointsSI.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0;
    for (const p of pointsSI) {
      sumX += p.m_kg;
      sumY += p.x_m;
      sumXY += p.m_kg * p.x_m;
      sumXX += p.m_kg * p.m_kg;
    }
    const denom = n * sumXX - sumX * sumX;
    if (Math.abs(denom) < 1e-12) return null;
    const a = (n * sumXY - sumX * sumY) / denom; // pendiente en m/kg
    const b = (sumY - a * sumX) / n; // intercepto en m
    const kEst = a !== 0 ? Math.max(0, toNumOr(g, 0)) / a : NaN; // k_est = g/a
    const kVal = Math.max(0, toNumOr(k, 0));
    const errRel =
      isFinite(kEst) && kVal !== 0 ? Math.abs(kEst - kVal) / kVal : NaN;
    return { a, b, kEst, errRel };
  }, [pointsSI, g, k]);

  // Datos para gráfica
  const massLabelLocal = massLabel;
  const lenLabelLocal = lenLabel;

  const chartData = useMemo(() => {
    const maxMkg = Math.max(
      massKg || 0,
      ...rows.map((r) => Number(r.m_kg) || 0),
      1
    );
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
      (m, d) => Math.max(m, isFinite(d.fit) ? Number(d.fit) : 0),
      0
    );
    const maxFromPoints = pointsUI.reduce(
      (m, d) => Math.max(m, Number(d.x_ui) || 0),
      0
    );
    const maxVal = Math.max(maxFromFit, maxFromPoints);
    const pad = maxVal > 0 ? maxVal * 0.1 : lenUnit === "cm" ? 1 : 0.01;
    const upper = maxVal + pad;
    return [0, upper];
  }, [chartData, pointsUI, lenUnit]);

  return (
    <div className="container container-wide">
      <header className="page-header">
        <h1>Spring (static equilibrium) — Hooke’s law</h1>
        <p className="subtitle">
          Modelo: mg = k·x → x = (m·g)/k · Atajos:{" "}
          <span className="mono">C</span> Capturar,{" "}
          <span className="mono">L</span> Limpiar,{" "}
          <span className="mono">E</span> Exportar
        </p>
      </header>

      <div className="grid views-row-2col">
        <section className="card">
          <div
            className="card-header"
            style={{ justifyContent: "space-between" }}
          >
            <h2>Parámetros</h2>
            <span className="small mono">
              L₀ = {round(Math.max(0, toNumOr(L0, 0)))} {lenLabel}
            </span>
          </div>

          <div className="grid-1">
            <div className="controls-row">
              <label className="label-inline">Unidad de masa</label>
              <select
                value={massUnit}
                onChange={(e) => {
                  setMassUnit(e.target.value);
                  setErrMass("");
                }}
                className="input-inline"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>

              <label className="label-inline">Unidad de longitud</label>
              <select
                value={lenUnit}
                onChange={(e) => {
                  setLenUnit(e.target.value);
                  setErrL0("");
                }}
                className="input-inline"
              >
                <option value="cm">cm</option>
                <option value="m">m</option>
              </select>
            </div>

            <div className="controls-row">
              <label className="label-inline">Masa m</label>
              <input
                type="number"
                value={massValue}
                onChange={(e) => setMassValue(e.target.value)}
                onBlur={() =>
                  blurNonNegative(massValue, setMassValue, setErrMass, "m")
                }
                step="any"
                min="0"
                className="input-inline"
                style={{ borderColor: errMass ? "#f59e0b" : undefined }}
              />
              <span className="small mono">{massLabel}</span>
            </div>
            {errMass && (
              <div className="small" style={{ color: "#f59e0b" }}>
                {errMass}
              </div>
            )}

            <div className="controls-row">
              <label className="label-inline">Constante k</label>
              <input
                type="number"
                value={k}
                onChange={(e) => setK(e.target.value)}
                onBlur={() => blurNonNegative(k, setK, setErrK, "k")}
                step="any"
                min="0"
                className="input-inline"
                style={{ borderColor: errK ? "#f59e0b" : undefined }}
              />
              <span className="small mono">N/m</span>
            </div>
            {errK && (
              <div className="small" style={{ color: "#f59e0b" }}>
                {errK}
              </div>
            )}
            {warnKZero && (
              <div className="small" style={{ color: "#f59e0b" }}>
                Aviso: k es 0 o muy cercano a 0; se usa un valor mínimo
                interno.
              </div>
            )}

            <div className="controls-row">
              <label className="label-inline">Gravedad g</label>
              <input
                type="number"
                value={g}
                onChange={(e) => setG(e.target.value)}
                onBlur={() => blurNonNegative(g, setG, setErrG, "g")}
                step="any"
                min="0"
                className="input-inline"
                style={{ borderColor: errG ? "#f59e0b" : undefined }}
              />
              <span className="small mono">m/s²</span>
            </div>
            {errG && (
              <div className="small" style={{ color: "#f59e0b" }}>
                {errG}
              </div>
            )}

            <div className="controls-row">
              <label className="label-inline">Longitud en reposo L₀</label>
              <input
                type="number"
                value={L0}
                onChange={(e) => setL0(e.target.value)}
                onBlur={() => blurNonNegative(L0, setL0, setErrL0, "L₀")}
                step="any"
                min="0"
                className="input-inline"
                style={{ borderColor: errL0 ? "#f59e0b" : undefined }}
              />
              <span className="small mono">{lenLabel}</span>
            </div>
            {errL0 && (
              <div className="small" style={{ color: "#f59e0b" }}>
                {errL0}
              </div>
            )}

            <hr className="sep" />

            <div className="controls-row">
              <button className="primary" onClick={handleCapture}>
                Capturar
              </button>
              <button className="ghost" onClick={clearRows}>
                Limpiar tabla
              </button>
              <button onClick={exportCSV}>Exportar CSV</button>
            </div>

            <p className="small mono">
              m = {round(massKg)} kg · k = {round(Math.max(0, toNumOr(k, 0)))}{" "}
              N/m · g = {round(Math.max(0, toNumOr(g, 0)))} m/s² · L₀ ={" "}
              {round(Math.max(0, toNumOr(L0, 0)))} {lenLabel}
            </p>
            <p className="small mono">
              x = {round(Math.max(0, toNumOr(elong_UI, 0)))} {lenLabel} · L ={" "}
              {round(Math.max(0, toNumOr(length_UI, 0)))} {lenLabel}
            </p>
          </div>
        </section>

        <section className="card">
          <div
            className="card-header"
            style={{ gap: 8, justifyContent: "space-between" }}
          >
            <div className="btn-row">
              <button
                className={rightTab === "visual" ? "primary" : ""}
                onClick={() => setRightTab("visual")}
              >
                Visual
              </button>
              <button
                className={rightTab === "instant" ? "primary" : ""}
                onClick={() => setRightTab("instant")}
              >
                Resultado
              </button>
            </div>

            <div className="btn-row">
              <button
                className="ghost"
                title="Movimiento Armónico Simple"
                onClick={() => setShowMAS(true)}
              >
                Ir a MAS
              </button>
            </div>
          </div>

          {rightTab === "visual" ? (
            <div className="view-box" style={{ overflow: "visible" }}>
              <svg width="100%" height={viz.h} viewBox={`0 0 ${viz.w} ${viz.h}`}>
                <rect
                  x={40}
                  y={viz.topPadding}
                  width={viz.w - 80}
                  height={viz.ceilingH}
                  fill="#1f2937"
                  stroke="#2a3546"
                />
                <line
                  x1={viz.left}
                  y1={viz.topPadding + viz.ceilingH}
                  x2={viz.left}
                  y2={viz.topPadding + viz.ceilingH + viz.hookLen}
                  stroke="#aab4c3"
                  strokeWidth="2"
                />
                <path
                  d={springPath}
                  stroke="#9ec5ff"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1={viz.left}
                  y1={springBottomY}
                  x2={viz.left}
                  y2={springBottomY + 6}
                  stroke="#aab4c3"
                  strokeWidth="2"
                />

                <g transform={`translate(${blockX}, ${blockY})`}>
                  <rect
                    x="0"
                    y="20"
                    width={viz.blockW}
                    height={viz.blockH - 20}
                    rx="8"
                    fill="#364152"
                    stroke="#2a3546"
                  />
                  <rect
                    x={viz.blockW * 0.2}
                    y="0"
                    width={viz.blockW * 0.6}
                    height="28"
                    rx="4"
                    fill="#4b5b70"
                    stroke="#2a3546"
                  />
                  <rect
                    x={viz.blockW * 0.38}
                    y={viz.blockH - 2}
                    width={viz.blockW * 0.24}
                    height="6"
                    fill="#2a3546"
                  />
                </g>

                <g>
                  <line
                    x1={60}
                    y1={springTopY}
                    x2={60}
                    y2={springBottomY}
                    stroke="#415169"
                  />
                  {Array.from({ length: 6 }).map((_, i) => {
                    const y = springTopY + (springLenPx * i) / 5;
                    return (
                      <line
                        key={i}
                        x1={56}
                        y1={y}
                        x2={64}
                        y2={y}
                        stroke="#415169"
                      />
                    );
                  })}
                  <text
                    x={50}
                    y={springTopY - 10}
                    fill="#9aa4b2"
                    fontSize="12"
                    textAnchor="end"
                  >
                    {lenLabel}
                  </text>
                </g>
              </svg>
            </div>
          ) : (
            <div className="post-empty">
              <div className="post-msg">
                Elongación x = <b>{round(Math.max(0, toNumOr(elong_UI, 0)))}</b>{" "}
                {lenLabel} — Longitud total L ={" "}
                <b>{round(Math.max(0, toNumOr(length_UI, 0)))}</b> {lenLabel}
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <div
          className="card-header"
          style={{ justifyContent: "space-between" }}
        >
          <h2>Gráfica x vs m</h2>
          <div className="btn-row">
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={showFit}
                onChange={(e) => setShowFit(e.target.checked)}
              />
              <span className="small">Mostrar recta ajustada</span>
            </label>
          </div>
        </div>

        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, bottom: 84, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="m_axis"
                type="number"
                tickCount={8}
                domain={["dataMin", "dataMax"]}
                label={{
                  value: `m (${massLabelLocal})`,
                  position: "insideBottom",
                  offset: -10,
                }}
              />
              <YAxis
                tickFormatter={(v) => round(v)}
                domain={yDomain}
                tickCount={8}
                label={{
                  value: `x (${lenLabelLocal})`,
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(v) => round(v)}
                labelFormatter={(m) => `m = ${round(m)} ${massLabelLocal}`}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 14 }}
              />
              {showFit && regression && (
                <Line
                  type="monotone"
                  dataKey="fit"
                  name={`Ajuste x ≈ a·m + b (k_est=${
                    regression.kEst ? round(regression.kEst) : "—"
                  } N/m)`}
                  dot={false}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  isAnimationActive={false}
                />
              )}
              <Line
                data={pointsUI}
                type="linear"
                dataKey="x_ui"
                name={`Capturas x(${lenLabelLocal})`}
                strokeWidth={0}
                dot={{ r: 4 }}
                isAnimationActive={false}
              />
              <ReferenceLine x={0} stroke="#6b7280" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="small" style={{ marginTop: 8 }}>
          {regression ? (
            <>
              <div>
                Recta ajustada en SI: x ≈ <b>a</b>·m + <b>b</b> con a ={" "}
                {round(regression.a)} (m/kg), b = {round(regression.b)} m.
              </div>
              <div>
                Estimación: k<sub>est</sub> = g / a ={" "}
                {regression.kEst ? <b>{round(regression.kEst)}</b> : "—"} N/m.
              </div>
              <div>
                Error relativo vs k:{" "}
                {isFinite(regression.errRel) ? (
                  <b>{round(regression.errRel * 100)}%</b>
                ) : (
                  "—"
                )}
              </div>
            </>
          ) : (
            <div>Se requieren al menos 2 capturas con distinta masa para estimar k.</div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Tabla de capturas {rows.length}</h2>
          <div className="btn-row">
            <button onClick={exportCSV}>Exportar CSV</button>
            <button className="ghost" onClick={clearRows}>
              Limpiar tabla
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="captures-table">
            <thead>
              <tr>
                <th>Masa (UI)</th>
                <th>Masa (kg)</th>
                <th>k (N/m)</th>
                <th>g (m/s²)</th>
                <th>x (UI)</th>
                <th>L (UI)</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="small">
                    Sin capturas. Usa “Capturar”.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i}>
                    <td className="mono">
                      {r.m_ui} {r.massUnit}
                    </td>
                    <td className="mono">{r.m_kg}</td>
                    <td className="mono">{r.k_Npm}</td>
                    <td className="mono">{r.g_ms2}</td>
                    <td className="mono">
                      {r.x_ui} {r.lenUnit}
                    </td>
                    <td className="mono">
                      {r.L_ui} {r.lenUnit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Overlay MAS: se renderiza encima sin tocar la vista estática */}
      <HookeMAS
        open={showMAS}
        onClose={() => setShowMAS(false)}
        onEditParams={() => {
          // Mantiene el overlay abierto en este MVP; si prefieres cerrar para editar, cambia a setShowMAS(false)
          alert("Edita los parámetros en la vista estática. Este botón es informativo por ahora.");
        }}
        params={{
          massValue,
          massUnit,
          lenUnit,
          k,
          g,
          L0,
          massKg,
          elong_m,
        }}
      />
    </div>
  );
}

function round(x, d = 3) {
  const k = Math.pow(10, d);
  return Math.round(Number(x) * k) / k;
}
