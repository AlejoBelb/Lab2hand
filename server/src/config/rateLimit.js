// server/src/config/rateLimit.js

const rateLimit = require('express-rate-limit');

// Crea un limitador de peticiones basado en variables de entorno
function createApiRateLimiter() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
  const max = Number(process.env.RATE_LIMIT_MAX || 100);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too Many Requests',
      statusCode: 429
    }
  });
}

module.exports = {
  createApiRateLimiter
};
