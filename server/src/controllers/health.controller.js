// server/src/controllers/health.controller.js

const prisma = require('../config/prisma');
const { version: pkgVersion, name: pkgName } = require('../../package.json');

// Construye la carga útil base para respuestas de salud
function buildBasePayload(extra = {}) {
  return {
    service: pkgName || 'lab2hand-api',
    status: 'ok',
    uptimeMs: Math.round(process.uptime() * 1000),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    version: pkgVersion || '0.0.0',
    ...extra
  };
}

// Liveness básico: confirma que el proceso de Node corre
async function health(req, res) {
  const payload = buildBasePayload();
  return res.status(200).json(payload);
}

// Readiness: incluye chequeo de base de datos con latencia
async function readiness(req, res) {
  const dependencies = {
    database: {
      status: 'unknown',
      latencyMs: null
    }
  };

  try {
    const t0 = Date.now();
    // Consulta mínima para validar conexión
    await prisma.$queryRaw`SELECT 1`;
    const t1 = Date.now();

    dependencies.database.status = 'up';
    dependencies.database.latencyMs = t1 - t0;

    const payload = buildBasePayload({ dependencies });
    return res.status(200).json(payload);
  } catch (err) {
    dependencies.database.status = 'down';
    dependencies.database.latencyMs = null;

    const payload = buildBasePayload({ dependencies });
    return res.status(503).json(payload);
  }
}

module.exports = {
  health,
  readiness
};
