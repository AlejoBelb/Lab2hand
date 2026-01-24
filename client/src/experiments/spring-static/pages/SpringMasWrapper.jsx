// client/src/experiments/spring-static/pages/SpringMasWrapper.jsx

import React from "react";
import HookeStatic from "./HookeStatic.jsx";

/* Wrapper para la ruta /experiments/spring/mas
   - Reutiliza HookeStatic.
   - Abre el overlay MAS desde el estado inicial mediante props.
   - No realiza manipulación directa del DOM.
*/
export default function SpringMasWrapper() {
  return <HookeStatic initialShowMAS={true} />;
}
