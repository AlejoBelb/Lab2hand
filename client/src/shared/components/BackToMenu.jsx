// client/src/shared/components/BackToMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackToMenu({ style }) {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: 8, ...(style || {}) }}>
      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          background: "transparent",
          border: "none",
          color: "#E5E7EB",
          cursor: "pointer",
          padding: 0,
        }}
      >
        Volver al menú
      </button>
    </div>
  );
}