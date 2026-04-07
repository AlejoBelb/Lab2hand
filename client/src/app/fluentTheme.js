// client/src/app/fluentTheme.js
import { webDarkTheme } from "@fluentui/react-components";

/*
 * Tema oscuro personalizado para Lab2Hand.
 * Basado en webDarkTheme (antes usaba webLightTheme forzado a oscuro).
 * Tokens alineados con las CSS variables de styles.css.
 */
const fluentTheme = { ...webDarkTheme };

/* ── Tipografía ── */
fluentTheme.fontFamilyBase =
  '"DM Sans", "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif';

/* ── Texto ── */
fluentTheme.colorNeutralForeground1 = "#E5E7EB";  // texto principal — contraste ≥ 7:1 sobre #0B1220
fluentTheme.colorNeutralForeground2 = "#94A3B8";  // texto secundario — contraste ≥ 4.5:1
fluentTheme.colorNeutralForeground3 = "#64748B";  // texto deshabilitado / placeholder
fluentTheme.colorNeutralForegroundDisabled = "#475569";

/* ── Superficies ── */
fluentTheme.colorNeutralBackground1 = "#0B1220";                 // fondo base de página
fluentTheme.colorNeutralBackground2 = "rgba(13, 20, 33, 0.85)";  // cards, modales
fluentTheme.colorNeutralBackground3 = "rgba(17, 24, 39, 0.6)";   // paneles elevados
fluentTheme.colorNeutralBackground4 = "rgba(255,255,255,0.03)";   // hover sobre cards
fluentTheme.colorSubtleBackground = "rgba(255,255,255,0.04)";     // inputs, selects
fluentTheme.colorSubtleBackgroundHover = "rgba(255,255,255,0.07)";
fluentTheme.colorSubtleBackgroundPressed = "rgba(255,255,255,0.09)";

/* ── Bordes ── */
fluentTheme.colorNeutralStroke1 = "rgba(255,255,255,0.08)";   // borde sutil
fluentTheme.colorNeutralStroke2 = "rgba(255,255,255,0.12)";   // borde hover
fluentTheme.colorNeutralStrokeAccessible = "rgba(255,255,255,0.16)"; // borde visible

/* ── Brand / Primary (azul Lab2Hand) ── */
fluentTheme.colorBrandBackground = "#2563EB";
fluentTheme.colorBrandBackgroundHover = "#1D4ED8";
fluentTheme.colorBrandBackgroundPressed = "#1E40AF";
fluentTheme.colorBrandForeground1 = "#60A5FA";    // texto/iconos azul sobre fondo oscuro
fluentTheme.colorBrandForeground2 = "#93C5FD";    // azul claro para links
fluentTheme.colorBrandStroke1 = "rgba(37,99,235,0.3)";

/* ── Estados semánticos ── */
fluentTheme.colorPaletteGreenForeground1 = "#34D399";     // éxito
fluentTheme.colorPaletteGreenBackground1 = "rgba(16,185,129,0.08)";
fluentTheme.colorPaletteRedForeground1 = "#F87171";       // error / peligro
fluentTheme.colorPaletteRedBackground1 = "rgba(239,68,68,0.08)";
fluentTheme.colorPaletteYellowForeground1 = "#FBBF24";    // advertencia
fluentTheme.colorPaletteYellowBackground1 = "rgba(245,158,11,0.08)";

/* ── Focus ring ── */
fluentTheme.colorStrokeFocus1 = "rgba(96,165,250,0.5)";
fluentTheme.colorStrokeFocus2 = "#60A5FA";

/* ── Radios ── */
fluentTheme.borderRadiusSmall = "6px";
fluentTheme.borderRadiusMedium = "10px";
fluentTheme.borderRadiusLarge = "14px";
fluentTheme.borderRadiusXLarge = "20px";

/* ── Sombras ── */
fluentTheme.shadow4 = "0 2px 8px rgba(0,0,0,0.3)";
fluentTheme.shadow8 = "0 4px 16px rgba(0,0,0,0.4)";
fluentTheme.shadow16 = "0 8px 32px rgba(0,0,0,0.5)";
fluentTheme.shadow28 = "0 16px 48px rgba(0,0,0,0.6)";

export { fluentTheme };