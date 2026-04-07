// client/src/shared/components/FinishOverlay.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Overlay de finalización reutilizable para todos los experimentos.
 * Se renderiza como portal en el body para evitar que backdrop-filter
 * o transform de contenedores ancestros rompan el position: fixed.
 */
export default function FinishOverlay({
  visible,
  title = "Finalizado",
  subtitle = "",
  duration = 2200,
  onDone,
}) {
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef(null);
  const removeTimerRef = useRef(null);

  const clearTimers = () => {
    if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
    if (removeTimerRef.current) { clearTimeout(removeTimerRef.current); removeTimerRef.current = null; }
  };

  useEffect(() => {
    if (visible) {
      clearTimers();
      setShow(true);
      setExiting(false);

      exitTimerRef.current = setTimeout(() => {
        setExiting(true);
        removeTimerRef.current = setTimeout(() => {
          setShow(false);
          setExiting(false);
          onDone?.();
        }, 600);
      }, duration);

      return clearTimers;
    } else {
      clearTimers();
      setShow(false);
      setExiting(false);
    }
  }, [visible]);

  useEffect(() => clearTimers, []);

  if (!show) return null;

  return createPortal(
    <div className={`fo-overlay${exiting ? " fo-exiting" : ""}`}>
      <div className="fo-content">
        <div className="fo-line fo-line-top" />
        <div className="fo-title">{title}</div>
        {subtitle && <div className="fo-subtitle">{subtitle}</div>}
        <div className="fo-line fo-line-bottom" />
      </div>
    </div>,
    document.body
  );
}