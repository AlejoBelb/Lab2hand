# Lab2hand — Plan Maestro y Gestión con Design Thinking

## Propósito del repositorio
Convertir este repo en la fuente única de verdad: código, visión de producto, decisiones de arquitectura, trazabilidad y evidencia de usuario, integrando Design Thinking (Empatizar → Definir → Idear → Prototipar → Testear) en un modelo Dual-Track junto con la entrega técnica (desarrollo, pruebas, despliegues).

## Visión
Plataforma web “Eureka / Lab2hand” para explorar principios físicos mediante simulaciones interactivas y captura de datos, con trazabilidad desde la necesidad del usuario hasta el release en producción.

## Cómo está organizado el proyecto
- Dual-Track:
  - Track de Descubrimiento (Design Thinking): investigación con usuarios, definición de problemas, ideación, prototipos y test con evidencia.
  - Track de Entrega (Desarrollo): diseño técnico, implementación, pruebas, documentación y despliegue.
- Trazabilidad end-to-end: Issue ↔ Prototipo/Evidencia ↔ PR ↔ ADR ↔ Release, con etiquetas estandarizadas.

## Navegación rápida
- Plan Maestro: [`/docs/PLAN_MAESTRO.md`](./docs/PLAN_MAESTRO.md)
- Roadmap: [`/docs/ROADMAP.md`](./docs/ROADMAP.md)
- Changelog: [`/docs/CHANGELOG.md`](./docs/CHANGELOG.md)
- Contribución/Flujo de trabajo: [`/docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md)
- Definition of Ready/Done: [`/docs/DOR_DOD.md`](./docs/DOR_DOD.md)
- Etiquetas: [`/docs/LABELS.md`](./docs/LABELS.md)
- Decisiones de Arquitectura (ADRs): [`/docs/ADRs/`](./docs/ADRs/)
- Design Thinking (plantillas y evidencias): [`/docs/DT/`](./docs/DT/)

## Design Thinking integrado
- Artefactos DT esperados:
  - Personas, Mapas de Empatía, Journey as-is/to-be, How Might We (HMW).
  - Prototipos low/mid/hi-fi, Guiones de prueba, Informes de test con hallazgos y métricas (SUS/UMUX-Lite, éxito de tarea).
- Reglas de entrada/salida:
  - Definition of Ready incluye evidencia/insight de usuario y criterios de aceptación medibles.
  - Definition of Done incluye documentación y, cuando aplique, resultado del experimento o test de usabilidad.

## Flujo operativo
- Issues:
  - Tipos principales: bug, feature, enhancement, docs, chore, refactor, test.
  - Etiquetas DT: dt-discovery, dt-ux-research, dt-prototype, needs-user-test.
  - Prioridad: P0–P3.
  - Estado: triage, needs-info, needs-estimate, in-progress, blocked, ready-for-review, done.
- Pull Requests:
  - PR vinculado al issue y, si corresponde, al ADR.
  - Checklist de pruebas, docs y changelog.
- ADRs:
  - Cada decisión técnica relevante se registra en `/docs/ADRs` con contexto, alternativas y consecuencias.
- Releases:
  - Cambios documentados en `/docs/CHANGELOG.md` siguiendo Keep a Changelog.

## Sprints y ceremonias
- Cadencia sugerida: 2 semanas.
- Ceremonias: Planning, Daily, Review, Retro.
- Sprint 0 recomendado: investigación inicial (DT) + fundaciones técnicas mínimas (CI, estructura básica).

## Métricas recomendadas
- Descubrimiento: tasa de aprendizajes accionables, SUS/UMUX-Lite, tiempo a insight.
- Producto: adopción, retención, éxito de tarea, tiempo de tarea.
- Calidad: cobertura de pruebas, defectos por release, lead time, tiempo de ciclo.


## Convenciones de ramas y commits
- Ramas: `feature/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`, `refactor/<slug>`.
- Commits (Conventional Commits): `feat: …`, `fix: …`, `docs: …`, `chore: …`, `refactor: …`, `test: …`, `perf: …`, `ci: …`.

## Cómo contribuir
- Leer [`/docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md).
- Crear issue con la plantilla correspondiente y adjuntar evidencia DT cuando aplique.
- Abrir PR con checklist completo y vinculación a issue/ADR.

## Licencia y contacto
- Licencia a definir en una etapa posterior.
- Para dudas sobre la gestión o arquitectura, revisar ADRs y el Plan Maestro.

---
 **Última sincronización con GitHub:** 2025-10-26 01:19  100 % sincronizado.

