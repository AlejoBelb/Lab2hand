# Arquitectura Base de Lab2hand

## Resumen
Documento técnico que describe la arquitectura monorepo, componentes principales, convenciones, variables de entorno, scripts y flujos de trabajo de desarrollo y despliegue.

## Objetivos arquitectónicos
- Separación clara entre frontend y backend manteniendo un único repositorio.
- Facilitar el desarrollo paralelo y la integración continua.
- Preparar el proyecto para un enfoque offline-first y observabilidad básica.
- Establecer lineamientos mínimos de seguridad desde el inicio.

## Estructura monorepo
```
Lab2hand/
  client/                  # Frontend (React + Vite)
    public/
    src/
  server/                  # Backend (Node.js + Express)
    src/
      config/
      controllers/
      middlewares/
      routes/
      services/
  database/                # Migraciones, seeds y esquemas
    migrations/
    schemas/
    seeds/
  docs/                    # Documentación (Plan Maestro, DT, ADRs, etc.)
  tests/                   # Pruebas automatizadas (compartidas o específicas)
  .editorconfig
  .gitignore
  README.md
```

## Tecnologías base
- Frontend: React + Vite, TypeScript opcional, state management ligero (zustand o context).
- Backend: Node.js LTS + Express, validación con zod/joi, autenticación por tokens.
- Base de datos: PostgreSQL.
- Testing: Vitest/Jest en frontend, Jest/Supertest en backend.
- Formato: Prettier + ESLint.
- CI/CD: GitHub Actions.

## Convenciones
- Ramas: `feature/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>`, `refactor/<slug>`.
- Commits: Conventional Commits.
- Nombres de archivos: kebab-case en JS/TS, PascalCase para componentes React.
- Rutas API: `/api/v1/...`.

## Variables de entorno
Crear archivos `.env` locales no versionados.

### Frontend (`/client/.env`)
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Lab2hand
```

### Backend (`/server/.env`)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://<user>:<password>@localhost:5432/lab2hand
JWT_SECRET=change_this_in_prod
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

## Scripts sugeridos

### Frontend (`/client/package.json`)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 5173",
    "lint": "eslint \"src/**/*.{ts,tsx,js,jsx}\"",
    "test": "vitest run"
  }
}
```

### Backend (`/server/package.json`)
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "lint": "eslint \"src/**/*.js\"",
    "test": "jest --runInBand"
  }
}
```

### Raíz del repo (`/package.json`) para orquestar ambos
```json
{
  "private": true,
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "dev": "concurrently -n CLIENT,SERVER -c auto \"npm:dev:client\" \"npm:dev:server\"",
    "dev:client": "npm --workspace client run dev",
    "dev:server": "npm --workspace server run dev",
    "build": "npm --workspace client run build",
    "lint": "npm --workspace client run lint && npm --workspace server run lint",
    "test": "npm --workspace client run test && npm --workspace server run test"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

## Flujo de desarrollo local
- `npm run dev` inicia Vite en `http://localhost:5173` y Express en `http://localhost:3000`.
- El frontend consume la API usando `VITE_API_BASE_URL`.

## Flujo de build y despliegue
- Build frontend: `npm --workspace client run build` genera `/client/dist`.
- Despliegue inicial: backend en servicio Node y frontend estático (CDN/Netlify/Vercel).
- Variables de entorno por entorno: dev/staging/prod.

## Seguridad mínima inicial
- CORS restringido por entorno.
- Helmet en Express.
- Tokens con expiración corta y refresh tokens.
- Validación de entrada en controllers/middlewares.

## Observabilidad mínima
- Logger estructurado (pino/winston).
- Correlación `request-id`.
- Métricas HTTP a futuro.

## Offline-first (plan)
- Cache de assets con Service Worker (Workbox).
- Cola de acciones/sincronización.
- IndexedDB para datos temporales.

## Endpoints iniciales
- `POST /api/v1/auth/login`
- `GET /api/v1/experiments`
- `POST /api/v1/experiments/:id/runs`
- `GET /api/v1/experiments/:id/runs/:runId/data`
- `POST /api/v1/experiments/:id/runs/:runId/data` 

## Diagrama lógico
```
[Client (Vite/React)] <—HTTP—> [API Express] <—SQL—> [PostgreSQL]
       |                               |
   Service Worker                 Logger/Metrics
       |                               |
   Cache/IndexedDB               Observabilidad/Alertas
```
