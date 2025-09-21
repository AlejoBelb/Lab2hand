# Lab2hand

Plataforma web para experimentos y simulaciones físicas con captura de datos y generación de gráficas. Arquitectura monorepo con frontend y backend separados.

## Estructura

Lab2hand/
  client/            # Frontend (React + Vite)
    public/
    src/
  server/            # Backend (Node.js + Express)
    src/
      config/
      controllers/
      middlewares/
      routes/
      services/
  database/          # Migraciones, seeds y esquemas
    migrations/
    schemas/
    seeds/
  docs/              # Documentación del proyecto
  tests/             # Pruebas automatizadas

## Requisitos

- Node.js LTS
- Git
- Visual Studio Code

## Próximos pasos

1. Inicializar Git.
2. Crear frontend con Vite.
3. Crear backend con Express.
4. Configurar scripts para desarrollo en paralelo.