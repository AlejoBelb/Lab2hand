// client/src/shared/components/BackToMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackToMenu({ style }) {
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: 8, ...style }}>
      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          background: "transparent",
          border: "none",
          color: "#E5E7EB",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          fontSize: 14,
          padding: 0,
        }}
        aria-label="Volver a Home"
        title="Volver a Home"
      >
        <span aria-hidden>←</span>
        <span>Volver a Home</span>
      </button>
    </div>
  );
}