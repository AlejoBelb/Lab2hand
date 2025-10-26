// server/src/app.js

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Config
const corsOptions = require('./config/cors');
const rateLimiter = require('./config/rateLimit');

// Middlewares
const requestLogger = require('./middlewares/requestLogger');
const validate = require('./middlewares/validate');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

// Rutas existentes
const authRoutes = require('./routes/auth.routes');
const meRoutes = require('./routes/me.routes');

// Nueva ruta de experiments
const experimentRoutes = require('./routes/experiment.routes');

const app = express();

// Seguridad y utilidades
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(requestLogger());

// Salud
app.get('/api/health', (req, res) => {
  res.json({
    service: 'lab2hand-api',
    status: 'ok',
    uptimeMs: process.uptime() * 1000,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Echo (útil para probar parseo de JSON, sin validadores)
app.post('/api/echo', (req, res) => {
  res.json({
    ok: true,
    data: {
      body: req.body || {},
      query: req.query || {},
      params: req.params || {},
    },
  });
});


// Auth y perfil
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);

// Experiments (nuevo)
app.use('/api/experiments', experimentRoutes);

// 404
app.use(notFound);

// Manejo de errores central
app.use(errorHandler);

module.exports = app;
