// server/src/controllers/health.controller.js
// Controlador del healthcheck. No usa base de datos y responde de inmediato.

function getHealth(req, res) {
  const now = new Date();
  const uptimeSeconds = process.uptime();
  const memory = process.memoryUsage();

  res.status(200).json({
    status: 'ok',
    service: 'lab2hand-api',
    time: now.toISOString(),
    uptime_seconds: Math.round(uptimeSeconds),
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
      arrayBuffers: memory.arrayBuffers
    },
    version: process.env.npm_package_version || '1.0.0'
  });
}

module.exports = { getHealth };
