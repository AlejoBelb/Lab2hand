// client/src/shared/components/ui/index.jsx
//
// Componentes reutilizables del Design System de Lab2Hand.
// Uso: import { Card, Button, Alert, Input, Select, EmptyState, LoadingState } from '../shared/components/ui';

import React from "react";

/* ═══════════════════════════════════════════════════════════
   CARD — Contenedor con borde glass y variantes
   ═══════════════════════════════════════════════════════════ */

export function Card({
  children,
  className = "",
  padding = "20px",
  style = {},
  ...props
}) {
  return (
    <div
      className={`l2h-card ${className}`}
      style={{ padding, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", actions, style = {} }) {
  return (
    <div className={`l2h-card-header ${className}`} style={style}>
      <div className="l2h-card-header-text">{children}</div>
      {actions && <div className="l2h-card-header-actions">{actions}</div>}
    </div>
  );
}

export function CardBody({ children, className = "", style = {} }) {
  return (
    <div className={`l2h-card-body ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BUTTON — Variantes: primary, ghost, danger, success
   ═══════════════════════════════════════════════════════════ */

export function Button({
  children,
  variant = "ghost", // "primary" | "ghost" | "danger" | "success"
  size = "md",       // "sm" | "md" | "lg"
  icon,
  loading = false,
  disabled = false,
  className = "",
  style = {},
  ...props
}) {
  const sizeClass = `l2h-btn-${size}`;
  const variantClass = `l2h-btn-${variant}`;

  return (
    <button
      className={`l2h-btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      style={style}
      {...props}
    >
      {loading && <span className="l2h-spinner" />}
      {!loading && icon && <span className="l2h-btn-icon">{icon}</span>}
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   ALERT — Variantes: info, success, warning, error
   ═══════════════════════════════════════════════════════════ */

const ALERT_ICONS = {
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

export function Alert({
  children,
  variant = "info", // "info" | "success" | "warning" | "error"
  icon = true,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`l2h-alert l2h-alert-${variant} ${className}`}
      role={variant === "error" ? "alert" : "status"}
      style={style}
    >
      {icon && <span className="l2h-alert-icon">{ALERT_ICONS[variant]}</span>}
      <span className="l2h-alert-text">{children}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INPUT — Con label, helper text y estado de error
   ═══════════════════════════════════════════════════════════ */

export function Input({
  label,
  helper,
  error,
  id,
  className = "",
  style = {},
  ...props
}) {
  const inputId = id || (label ? `l2h-input-${label.replace(/\s/g, "-").toLowerCase()}` : undefined);

  return (
    <div className={`l2h-field ${error ? "l2h-field-error" : ""} ${className}`} style={style}>
      {label && (
        <label className="l2h-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input className="l2h-input" id={inputId} aria-invalid={!!error} {...props} />
      {error && <div className="l2h-field-msg l2h-field-msg-error">{error}</div>}
      {!error && helper && <div className="l2h-field-msg">{helper}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SELECT — Dropdown con tema oscuro
   ═══════════════════════════════════════════════════════════ */

export function Select({
  label,
  helper,
  error,
  id,
  children,
  className = "",
  style = {},
  ...props
}) {
  const selectId = id || (label ? `l2h-select-${label.replace(/\s/g, "-").toLowerCase()}` : undefined);

  return (
    <div className={`l2h-field ${error ? "l2h-field-error" : ""} ${className}`} style={style}>
      {label && (
        <label className="l2h-label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select className="l2h-select" id={selectId} aria-invalid={!!error} {...props}>
        {children}
      </select>
      {error && <div className="l2h-field-msg l2h-field-msg-error">{error}</div>}
      {!error && helper && <div className="l2h-field-msg">{helper}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMPTY STATE — Cuando no hay datos
   ═══════════════════════════════════════════════════════════ */

export function EmptyState({
  icon,
  title = "Sin datos",
  description,
  action,
  className = "",
}) {
  return (
    <div className={`l2h-empty ${className}`}>
      {icon && <div className="l2h-empty-icon">{icon}</div>}
      <div className="l2h-empty-title">{title}</div>
      {description && <div className="l2h-empty-desc">{description}</div>}
      {action && <div className="l2h-empty-action">{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOADING STATE — Skeleton / spinner
   ═══════════════════════════════════════════════════════════ */

export function LoadingState({
  text = "Cargando...",
  className = "",
}) {
  return (
    <div className={`l2h-loading ${className}`}>
      <span className="l2h-spinner l2h-spinner-md" />
      <span className="l2h-loading-text">{text}</span>
    </div>
  );
}