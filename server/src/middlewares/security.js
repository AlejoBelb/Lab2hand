// server/src/middlewares/security.js

const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { getAllowedOrigins } = require('../config/cors');
const { createApiRateLimiter } = require('../config/rateLimit');

// Aplica cabeceras de seguridad, compresión, CORS y rate limit
function applySecurity(app) {
  app.use(helmet());
  app.use(compression());

  const allowed = getAllowedOrigins();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowed.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    })
  );

  app.use('/api', createApiRateLimiter());
}

module.exports = {
  applySecurity
};
