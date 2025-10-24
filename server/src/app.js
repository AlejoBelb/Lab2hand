// server/src/app.js

const express = require('express');
const routes = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const { applySecurity } = require('./middlewares/security');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Seguridad y utilidades globales
applySecurity(app);

// Parseo de JSON
app.use(express.json());

// Logs HTTP
app.use(requestLogger());

// Prefijo de API
app.use('/api', routes);

// 404
app.use(notFound);

// Manejador global de errores
app.use(errorHandler);

module.exports = app;
