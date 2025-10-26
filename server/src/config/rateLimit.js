// server/src/config/rateLimit.js

// Esta sección configura el limitador de peticiones HTTP
const rateLimit = require('express-rate-limit');

// Esta sección crea una instancia reutilizable de rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 1000),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', statusCode: 429 },
});

// Esta sección exporta directamente el middleware para usar con app.use(...)
module.exports = limiter;
