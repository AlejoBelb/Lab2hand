// client/src/experiments/mas/pages/MASPage.jsx
import React from "react";
import "../styles/mas.css";

/**
 * Página base del experimento de Movimiento Armónico Simple (MAS).
 * Presenta el contenedor principal, descripción y espacio para futuros controles y vista.
 */
export default function MASPage() {
  return (
    <div className="masContainer">
      <header className="masHeader">
        <h1>Movimiento Armónico Simple (MAS)</h1>
        <p className="masSubtitle">
          Oscilación ideal de una masa unida a un resorte en una dimensión.
        </p>
      </header>

      <section className="masContent">
        <div className="masPanel">
          <h2>Descripción</h2>
          <p>
            En el MAS, la posición de la partícula puede modelarse por
            x(t) = A · cos(ω₀ t + φ), donde A es la amplitud, ω₀ la frecuencia angular,
            y φ la fase inicial. La aceleración es proporcional y opuesta
            a la posición, característica clave de este movimiento.
          </p>
        </div>

        <div className="masPanel">
          <h2>Próximamente</h2>
          <ul className="masList">
            <li>Controles para parámetros físicos y unidades.</li>
            <li>Animación SVG del oscilador masa–resorte.</li>
            <li>Gráficas de x(t), v(t) y a(t).</li>
            <li>Presets y guardado local de configuraciones.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
