import React from "react";
import ReactDOM from "react-dom/client";
import RouterApp from "./RouterApp.jsx";
import "../shared/styles/styles.css";

// Reinicio del tiempo simulado global del MAS al disparar un evento
(function registerResetListener() {
  if (typeof window !== "undefined" && !window.__mas_reset_bound) {
    window.__mas_reset_bound = true;
    const timeSlots = [];
    Object.defineProperty(window, "__mas_times", {
      get() {
        return timeSlots;
      },
    });
    window.addEventListener("reset-time", () => {
      // Se notifica a los observadores que deseen reiniciar contadores propios.
      // Este hook deja el mecanismo listo si luego se extiende la simulación.
    });
  }
})();


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterApp />
  </React.StrictMode>
);
