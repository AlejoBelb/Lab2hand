// client/src/pages/HomeMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const experiments = [
  {
    id: "bernoulli",
    path: "/experiments/bernoulli",
    title: "Bernoulli",
    subtitle: "Dinámica de fluidos",
    description: "Estudia el vaciado de un recipiente y verifica la ecuación de Torricelli midiendo el alcance horizontal del chorro en función de la altura.",
    color: "#2563eb",
    colorSoft: "rgba(37,99,235,0.12)",
    colorBorder: "rgba(37,99,235,0.3)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* Recipiente */}
        <rect x="10" y="8" width="22" height="26" rx="2" stroke="#3b82f6" strokeWidth="2" fill="rgba(59,130,246,0.08)"/>
        {/* Agua */}
        <rect x="11" y="20" width="20" height="13" rx="1" fill="rgba(59,130,246,0.25)"/>
        {/* Orificio */}
        <circle cx="32" cy="28" r="2" fill="#60a5fa"/>
        {/* Chorro parabólico */}
        <path d="M34 28 Q40 30 44 38" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="2 2"/>
        {/* Suelo */}
        <line x1="6" y1="40" x2="46" y2="40" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "spring",
    path: "/experiments/spring",
    title: "Spring — Estático",
    subtitle: "Ley de Hooke",
    description: "Cuelga masas conocidas y mide la deformación del resorte. Captura puntos para estimar la constante k mediante regresión lineal.",
    color: "#10b981",
    colorSoft: "rgba(16,185,129,0.12)",
    colorBorder: "rgba(16,185,129,0.3)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* Techo */}
        <rect x="16" y="6" width="16" height="4" rx="1" fill="#334155"/>
        {/* Resorte zigzag */}
        <polyline
          points="24,10 24,13 20,15 28,18 20,21 28,24 20,27 28,30 24,32 24,35"
          stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
        {/* Masa */}
        <rect x="18" y="35" width="12" height="8" rx="2" fill="rgba(52,211,153,0.2)" stroke="#34d399" strokeWidth="1.5"/>
        {/* Flecha deformación */}
        <line x1="34" y1="10" x2="34" y2="38" stroke="#475569" strokeWidth="1" strokeDasharray="2 2"/>
        <line x1="32" y1="38" x2="36" y2="38" stroke="#475569" strokeWidth="1"/>
        <text x="36" y="26" fill="#64748b" fontSize="7" fontFamily="monospace">x</text>
      </svg>
    ),
  },
  {
    id: "mas",
    path: "/experiments/spring/mas",
    title: "MAS",
    subtitle: "Movimiento Armónico Simple",
    description: "Aplica una fuerza inicial y observa la oscilación amortiguada del resorte en tiempo real. Registra posición, velocidad y período.",
    color: "#8b5cf6",
    colorSoft: "rgba(139,92,246,0.12)",
    colorBorder: "rgba(139,92,246,0.3)",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        {/* Eje */}
        <line x1="4" y1="24" x2="44" y2="24" stroke="#334155" strokeWidth="1.5"/>
        {/* Onda sinusoidal amortiguada */}
        <path
          d="M4,24 C7,14 11,14 14,24 C17,34 21,34 24,24 C27,16 30,16 33,24 C36,30 39,30 41,24"
          stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" fill="none"
        />
        {/* Punto actual */}
        <circle cx="41" cy="24" r="3" fill="#8b5cf6"/>
        {/* Flecha vertical */}
        <line x1="24" y1="6" x2="24" y2="42" stroke="#334155" strokeWidth="1" strokeDasharray="2 2"/>
        <text x="25" y="10" fill="#64748b" fontSize="7" fontFamily="monospace">A</text>
      </svg>
    ),
  },
];

export default function HomeMenu() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .hm-root {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px 60px;
        }

        /* Hero */
        .hm-hero {
          text-align: center;
          padding: 52px 0 48px;
        }
        .hm-hero-title {
          font-size: 2.6rem;
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1.15;
          margin: 0 0 14px;
          background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hm-hero-sub {
          font-size: 15px;
          color: #64748b;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Grid de tarjetas */
        .hm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 20px;
          margin-bottom: 52px;
        }

        /* Tarjeta */
        .hm-card {
          position: relative;
          background: rgba(13, 20, 33, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 28px 26px 22px;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          overflow: hidden;
        }
        .hm-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }
        .hm-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 50px -12px rgba(0,0,0,0.6);
        }
        .hm-card:hover::before { opacity: 1; }

        /* Colores por experimento */
        .hm-card[data-exp="bernoulli"] { box-shadow: 0 4px 20px rgba(37,99,235,0.08); }
        .hm-card[data-exp="bernoulli"]:hover { border-color: rgba(37,99,235,0.4); box-shadow: 0 20px 50px -12px rgba(37,99,235,0.25); }
        .hm-card[data-exp="bernoulli"]::before { background: radial-gradient(ellipse at top left, rgba(37,99,235,0.07), transparent 70%); }

        .hm-card[data-exp="spring"] { box-shadow: 0 4px 20px rgba(16,185,129,0.08); }
        .hm-card[data-exp="spring"]:hover { border-color: rgba(16,185,129,0.4); box-shadow: 0 20px 50px -12px rgba(16,185,129,0.2); }
        .hm-card[data-exp="spring"]::before { background: radial-gradient(ellipse at top left, rgba(16,185,129,0.07), transparent 70%); }

        .hm-card[data-exp="mas"] { box-shadow: 0 4px 20px rgba(139,92,246,0.08); }
        .hm-card[data-exp="mas"]:hover { border-color: rgba(139,92,246,0.4); box-shadow: 0 20px 50px -12px rgba(139,92,246,0.2); }
        .hm-card[data-exp="mas"]::before { background: radial-gradient(ellipse at top left, rgba(139,92,246,0.07), transparent 70%); }

        /* Cabecera de la tarjeta */
        .hm-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .hm-card-icon {
          width: 58px; height: 58px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .hm-card-tag {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid;
        }

        /* Cuerpo */
        .hm-card-title {
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
          letter-spacing: -0.2px;
        }
        .hm-card-subtitle {
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0 0 12px;
        }
        .hm-card-desc {
          font-size: 13.5px;
          color: #64748b;
          line-height: 1.65;
          margin: 0 0 22px;
        }

        /* Botón de la tarjeta */
        .hm-card-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px;
          border: none;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .hm-card-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .hm-card-btn:active { transform: translateY(0); }

        /* Separador de sección de video */
        .hm-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .hm-section-title-text {
          font-size: 17px;
          font-weight: 600;
          color: #cbd5e1;
        }
        .hm-section-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        /* Video */
        .hm-video-card {
          background: rgba(13, 20, 33, 0.7);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          overflow: hidden;
        }
        .hm-video-ratio {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
        }
        .hm-video-ratio iframe {
          position: absolute;
          inset: 0; width: 100%; height: 100%; border: 0;
        }
        .hm-video-caption {
          padding: 16px 20px;
          font-size: 13px;
          color: #475569;
        }
      `}</style>

      <div className="hm-root">
        {/* Hero */}
        <header className="hm-hero">
          <h1 className="hm-hero-title">Experimentos de Física</h1>
          <p className="hm-hero-sub">
            Simulaciones interactivas para registrar, analizar y exportar datos de laboratorio.
          </p>
        </header>

        {/* Grid de experimentos */}
        <section className="hm-grid">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              className="hm-card"
              data-exp={exp.id}
              onClick={() => navigate(exp.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(exp.path)}
              aria-label={`Abrir experimento ${exp.title}`}
            >
              <div className="hm-card-head">
                {/* Ícono SVG */}
                <div
                  className="hm-card-icon"
                  style={{ background: exp.colorSoft, border: `1px solid ${exp.colorBorder}` }}
                >
                  {exp.icon}
                </div>
                {/* Tag */}
                <span
                  className="hm-card-tag"
                  style={{ color: exp.color, borderColor: exp.colorBorder, background: exp.colorSoft }}
                >
                  {exp.id.toUpperCase()}
                </span>
              </div>

              <h2 className="hm-card-title">{exp.title}</h2>
              <p className="hm-card-subtitle" style={{ color: exp.color }}>{exp.subtitle}</p>
              <p className="hm-card-desc">{exp.description}</p>

              <button
                className="hm-card-btn"
                style={{
                  background: `linear-gradient(135deg, ${exp.color}, ${exp.color}cc)`,
                  color: "#fff",
                  boxShadow: `0 4px 16px ${exp.color}40`,
                }}
                tabIndex={-1}
              >
                Abrir experimento
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          ))}
        </section>

        {/* Sección de video */}
        <section>
          <div className="hm-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span className="hm-section-title-text">Introducción / Tutorial</span>
            <div className="hm-section-line" />
          </div>

          <div className="hm-video-card">
            <div className="hm-video-ratio">
              <iframe
                src="https://www.youtube.com/embed/lxI1L1Qh8s4?si=demo"
                title="Video explicativo Lab2hand"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="hm-video-caption">
              Breve explicación sobre cómo utilizar los módulos de simulación y recolectar datos.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}