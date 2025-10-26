// client/src/experiments/spring-static/pages/SpringMasWrapper.jsx

import React from "react";
import HookeStatic from "./HookeStatic.jsx";

/*
# Wrapper para la ruta /experiments/spring/mas
# Renderiza la misma vista base (HookeStatic) y, al montar, acciona el botón "Ir a MAS"
# para mostrar el MAS dentro de la misma pantalla, respetando tu flujo original.
*/
export default function SpringMasWrapper() {
  React.useEffect(() => {
    // Intenta hacer click en el botón "Ir a MAS" cuando aparezca en el DOM
    function clickGoToMAS() {
      // 1) Selectores posibles por accesibilidad o texto
      const byAria = document.querySelector('button[aria-label="Ir a MAS"], button[title="Ir a MAS"]');
      if (byAria) {
        byAria.click();
        return true;
      }

      // 2) Fallback: buscar por texto del botón
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
      while (walker.nextNode()) {
        const el = walker.currentNode;
        if (el.tagName === "BUTTON" && el.textContent && el.textContent.trim().toLowerCase().includes("ir a mas")) {
          el.click();
          return true;
        }
      }
      return false;
    }

    // Intento inmediato
    if (clickGoToMAS()) return;

    // Observa el DOM por si el botón aparece después de montar
    const mo = new MutationObserver(() => {
      if (clickGoToMAS()) mo.disconnect();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);

  return <HookeStatic />;
}
