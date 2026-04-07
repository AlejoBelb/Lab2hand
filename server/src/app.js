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
const coursesRouter = require('./routes/courses.routes');
const echoRouter = require('./routes/echo.routes');
const healthRouter = require('./routes/health.routes');
const experimentRouter = require('./routes/experiment.routes');
const meRouter = require('./routes/me.routes');
const menuRouter = require('./routes/menu.routes');
const adminRouter = require('./routes/admin.routes');
const teacherCoursesRouter = require('./routes/teacherCourses.routes');
const teacherGuidesRouter = require('./routes/teacherGuides.routes');
const teacherStudentsRouter = require('./routes/teacherStudents.routes');
const courseExperimentsRouter = require('./routes/courseExperiments.routes');
const studentRouter = require('./routes/student.routes');

const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

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
app.use(express.static('public'));
app.use('/api/admin', adminRouter);
app.use('/api/admin/courses', coursesRouter);
app.use('/api/teacher', teacherCoursesRouter);
app.use('/api/student', studentRouter);
app.use('/api/teacher', teacherGuidesRouter);
app.use('/api/teacher', teacherStudentsRouter);
app.use('/api/courses', courseExperimentsRouter);
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/echo', echoRouter);
app.use('/api/experiments', experimentRouter);
app.use('/api/me', meRouter);
app.use('/api/menu', menuRouter);

// 404
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
