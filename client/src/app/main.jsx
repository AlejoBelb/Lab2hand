// client/src/app/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import RouterApp from "./RouterApp.jsx";
import "../shared/styles/styles.css";
import "../shared/styles/glass.css";
import { AuthProvider } from "../lib/auth/AuthContext.jsx";

import { FluentProvider } from "@fluentui/react-components";
import { fluentTheme } from "./fluentTheme";

// Listener global MAS
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
      /* Placeholder para reinicio de contadores */
    });
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FluentProvider theme={fluentTheme} style={{ minHeight: "100vh" }}>
      <AuthProvider>
        <RouterApp />
      </AuthProvider>
    </FluentProvider>
  </React.StrictMode>
);
