// client/src/shared/components/AppFooter.jsx
import React from "react";

export default function AppFooter() {
  return (
    <footer className="glass" style={{ marginTop: 18 }}>
      <div className="container-max" style={{ padding: "12px", textAlign: "center", color: "#94A3B8" }}>
        © {new Date().getFullYear()} Lab2hand — Plataforma de experimentos
      </div>
    </footer>
  );
}
