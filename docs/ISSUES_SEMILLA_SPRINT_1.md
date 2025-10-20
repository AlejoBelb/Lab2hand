# Issues semilla — Sprint 1 (MVP flujo crítico) — Lab2hand

(Contiene 10–15 issues con criterios, etiquetas, trazabilidad y estimación; ver PMO para detalle completo.)

- [FE-01] Asistente “Nuevo experimento”
- [FE-02] Tabla de mediciones
- [FE-03] Gráfica reactiva
- [BE-01..04] Endpoints stub
- [DB-01] Esquema mínimo
- [QA-01..02] Pruebas básicas
- [OPS-01] CI mínimo
- [DT-01..02] Prototipo y Test + Informe


### [ISSUE] Frontend: Simulación cilindro — Paso 2 (UI)
**Tipo:** feature  
**Prioridad:** Alta  
**Fecha:** 2025-09-28

**Descripción breve**  
Implementar la UI del Paso 2: animación de llenado rápido, botones de control (Iniciar vaciado, Capturar, Reiniciar) y tabla de capturas (estructura sin física aún) en la pantalla de simulación actual.

**Alcance**
- Mantener layout 40/60 (parámetros | vista del recipiente).
- Vista lateral y superior visibles simultáneamente.
- Mostrar y permitir configurar **H**, **D** y **do**, con unidad **cm/m**.
- Implementar **llenado rápido** (animación).
- Agregar botones: **Iniciar vaciado**, **Capturar**, **Reiniciar** (sin lógica de física).
- **Tabla de capturas**: columnas Tiempo, Altura (h), Distancia (x). Por ahora, las filas pueden ser mock añadidas al presionar “Capturar”.

**Criterios de aceptación**
- Se visualiza llenado rápido al confirmar parámetros.
- Botones renderizados con estados coherentes (ej.: “Capturar” activo solo tras iniciar vaciado en pasos futuros).
- La tabla se muestra y agrega filas (mock) al presionar **Capturar**.
- Responsividad conservada (desktop y tamaños medianos).

**Tareas**
- [ ] Agregar estados UI: `isFilled`, `isDraining`, `captures[]`.
- [ ] Animación de llenado rápido en el componente de tanque.
- [ ] Botones y handlers base (`onFill`, `onStartDrain`, `onCapture`, `onReset`).
- [ ] Tabla `CaptureTable` (estructura + agregado de filas mock).
- [ ] Validaciones mínimas de input (rangos H, D, do).
- [ ] Pruebas manuales y screenshots.

**Notas**
- La **física (Torricelli)** y el **chorro** se implementan en el **Paso 3**.
