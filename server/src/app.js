// server/src/app.js
// Aplicación Express principal de Lab2hand con middlewares y routers.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Routers
const authRouter = require('./routes/auth.routes');
const echoRouter = require('./routes/echo.routes');
const healthRouter = require('./routes/health.routes');
const experimentRouter = require('./routes/experiment.routes');
const meRouter = require('./routes/me.routes');
const menuRouter = require('./routes/menu.routes');
const verificationRouter = require('./routes/verification.routes');
const adminRouter = require('./routes/admin.routes');
const teacherCoursesRouter = require('./routes/teacherCourses.routes');
const courseExperimentsRouter = require('./routes/courseExperiments.routes'); // ← NUEVO

const app = express();

// Configuración de CORS
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173',
  'http://localhost:5173'
];

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Archivos estáticos
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rate limit
app.use(
  '/api/',
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// =======================
// RUTAS API
// =======================
app.use('/api/admin', adminRouter);
app.use('/api/teacher', teacherCoursesRouter);
app.use('/api/courses', courseExperimentsRouter); // ← AQUÍ
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/echo', echoRouter);
app.use('/api/experiments', experimentRouter);
app.use('/api/me', meRouter);
app.use('/api/menu', menuRouter);
app.use('/api/verification', verificationRouter);

// 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    status: 'error',
    message: err.message || 'Error interno del servidor'
  });
});

module.exports = app;
