// client/src/app/fluentTheme.js
import { webLightTheme } from "@fluentui/react-components";

/* Tema base clonado y oscurecido para coherencia con los experimentos */
const fluentTheme = { ...webLightTheme };

/* Tipografía corporativa */
fluentTheme.fontFamilyBase =
  'Segoe UI Variable, "Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial';

/* Texto claro sobre fondo oscuro */
fluentTheme.colorNeutralForeground1 = "#E5E7EB"; // principal
fluentTheme.colorNeutralForeground2 = "#A3AEC2"; // secundaria

/* Superficies neutras en modo “glass” oscuro */
fluentTheme.colorNeutralBackground1 = "#0B1220";               // fondo base de página
fluentTheme.colorNeutralBackground2 = "rgba(17, 24, 39, 0.38)"; // barras/migas traslúcidas
fluentTheme.colorNeutralBackground3 = "rgba(17, 24, 39, 0.48)"; // paneles info

/* Líneas divisorias sutiles */
fluentTheme.colorNeutralStroke1 = "rgba(255,255,255,0.08)";

/* Radios */
fluentTheme.borderRadiusMedium = "10px";
fluentTheme.borderRadiusLarge = "14px";

export { fluentTheme };
