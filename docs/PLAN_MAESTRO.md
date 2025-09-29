# Plan Maestro de Lab2hand (Design Thinking + Dual-Track)

## 1. Propósito
Definir visión, alcance, fases, criterios de salida y la gobernanza del proyecto integrando Design Thinking (Empatizar, Definir, Idear, Prototipar, Testear) con un modelo Dual-Track (Descubrimiento + Entrega).

## 2. Visión y objetivos
- Visión: Plataforma web para explorar principios físicos mediante simulaciones interactivas y captura de datos con trazabilidad desde el insight de usuario hasta el release.
- Objetivos trimestrales (ejemplo):
  - Q1: MVP usable con autenticación, experimento base y registro/graficación de datos.
  - Q2: Beta pública con telemetría, mejoras de UX y seguridad básica endurecida.
  - Q3: Versión 1.0 con documentación y despliegue estable.

## 3. Modelo de trabajo (Dual-Track)
- Track de Descubrimiento (DT): investigación con usuarios, definición de problemas, ideación, prototipos y pruebas de usabilidad.
- Track de Entrega (Dev): diseño técnico, implementación, pruebas automáticas, documentación y despliegue.
- Sincronización: en cada Planning y Review se conectan hallazgos de DT con el backlog técnico.

## 4. Fases y “puertas” (checkpoints DT)
### Fase 0 — Descubrimiento
- Entregables: Personas, Mapa de Empatía, Journey “as-is”, Problema y HMW, Matriz de priorización (RICE/MoSCoW).
- Criterios de salida: problemas priorizados con evidencia y criterios de éxito medibles; backlog inicial de épicas con hipótesis.

### Fase 1 — Fundaciones
- Entregables: Storyboards; prototipos low-fi validados; ADRs iniciales.
- Criterios de salida: riesgos principales identificados; DoR/DoD definidos con requisitos DT.

### Fase 2 — MVP
- Entregables: Prototipos mid/hi-fi; implementación del flujo crítico; guiones e informes de test.
- Criterios de salida: 5–10 pruebas; métricas mínimas alcanzadas; backlog ajustado.

### Fase 3 — Beta
- Entregables: Telemetría básica; seguridad y performance base.
- Criterios de salida: tendencias de uso estables; defectos críticos controlados.

### Fase 4 — Versión 1.0
- Entregables: Documentación completa; pipeline CI/CD mínimo.
- Criterios de salida: estabilidad en producción; métricas objetivo alcanzadas.

### Fase 5 — Escalado
- Entregables: Observabilidad avanzada; A/B testing.
- Criterios de salida: plan de escalado aprobado.

## 5. Trazabilidad y artefactos
Issue ↔ Prototipo/Evidencia DT ↔ PR ↔ ADR ↔ Release.

## 6. DoR/DoD
- DoR: problema validado, hipótesis y criterios medibles; evidencia DT cuando aplique.
- DoD: código probado/mergeado, docs y changelog; resultado de test registrado cuando aplique.

## 7. Gobernanza de arquitectura
ADRs en `/docs/ADRs` con flujo: propuesta → discusión → decisión → seguimiento.

## 8. Métricas y control
DT: tasa de aprendizajes, SUS/UMUX-Lite. Producto: adopción, retención, éxito de tarea. Proceso: lead time, defectos por release.

## 9. Riesgos y mitigaciones
DT–Dev desalineado, performance en dispositivos modestos, deuda de seguridad.

## 10. Calendario de sprints
Cadencia 2 semanas; Planning, Daily, Review y Retro.
