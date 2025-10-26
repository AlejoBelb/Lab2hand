// client/src/experiments/spring-static/pages/SpringStaticWrapper.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import HookeStatic from "./HookeStatic.jsx";

// Envoltura no intrusiva: escucha clicks globales y redirige
export default function SpringStaticWrapper() {
  const navigate = useNavigate();

  React.useEffect(() => {
    function shouldGoToMAS(node) {
      if (!node) return false;
      // Buscar el botón más cercano
      const btn = node.closest ? node.closest("button") : null;
      const el = btn || node;
      const text = (el.textContent || "").trim().toLowerCase();
      // Coincidencias comunes: "Ir a MAS", "Ir a Mas", etc.
      return (
        el.tagName === "BUTTON" &&
        (text.includes("ir a mas") || text.includes("ir a m.a.s") || text === "mas")
      );
    }

    function onCaptureClick(e) {
      const target = e.target;
      if (shouldGoToMAS(target)) {
        e.preventDefault();
        e.stopPropagation();
        navigate("/experiments/spring/mas");
      }
    }

    // Fase de captura para interceptar antes que handlers internos
    document.addEventListener("click", onCaptureClick, true);
    return () => {
      document.removeEventListener("click", onCaptureClick, true);
    };
  }, [navigate]);

  return <HookeStatic />;
}
