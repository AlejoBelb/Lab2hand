// client/src/app/RouterApp.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// Páginas existentes
import BernoulliPage from "../experiments/bernoulli/pages/BernoulliPage.jsx";
import HookeStatic from "../experiments/spring-static/pages/HookeStatic.jsx";

/**
 * Definición de rutas principales de la aplicación.
 * Se eliminan los enlaces y la ruta de MAS porque será un modo interno de Spring (static).
 */
export default function RouterApp() {
  return (
    <BrowserRouter>
      {/* Barra de navegación principal */}
      <nav style={{ display: "flex", gap: 16, padding: "8px 16px" }}>
        <Link to="/experiments/bernoulli">Bernoulli</Link>
        <Link to="/experiments/spring-static">Spring (static)</Link>
      </nav>

      <Routes>
        {/* Rutas de experimentos */}
        <Route path="/experiments/bernoulli" element={<BernoulliPage />} />
        <Route path="/experiments/spring-static" element={<HookeStatic />} />

        {/* Redirecciones por defecto */}
        <Route path="/" element={<Navigate to="/experiments/bernoulli" replace />} />
        <Route path="*" element={<Navigate to="/experiments/bernoulli" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
