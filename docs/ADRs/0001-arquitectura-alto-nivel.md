# ADR 0001: Arquitectura de alto nivel (Lab2hand)

## Estado
Aprobado

## Contexto
Se requiere una arquitectura simple, mantenible y escalable para una plataforma web de experimentos y simulaciones físicas. Debe soportar modo offline básico, captura y visualización de datos, y crecer hacia telemetría y seguridad endurecida. El equipo es de una sola persona y se privilegia la simplicidad.

## Decisión
Arquitectura de **tres capas** con monorepo:
- **Frontend**: React + Vite, offline-first progresivo, PWA opcional.
- **Backend**: Node.js + Express, REST, validación, CORS/Helmet.
- **Datos**: PostgreSQL con migraciones.

Entornos: dev → staging (opcional) → prod. CI mínima con GitHub Actions.

## Consecuencias
Positivas: separación clara, tooling maduro. Negativas: coordinación front/back, contratos API. Coste: pipelines, esquema, seguridad.

## Alternativas
Monolito SSR, Serverless/BaaS, SPA + Firebase.

## Reversibilidad
Cambiar a SSR/Next.js o a serverless manteniendo contratos.

## Seguimiento
Latencia p95, tasa de errores por usuario, coste de mantenimiento por sprint.

## Trazabilidad
DT: Journey crítico y HMW. Backlog épicas y Sprints 0–1.
