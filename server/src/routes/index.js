// server/src/routes/index.js

const { Router } = require('express');
const healthRouter = require('./health.routes');
const echoRouter = require('./echo.routes');
const authRouter = require('./auth.routes');
const meRouter = require('./me.routes');
const usersRouter = require('./users.routes');

const api = Router();

// Módulos de la API
api.use('/health', healthRouter);
api.use('/echo', echoRouter);
api.use('/auth', authRouter);
api.use('/me', meRouter);
api.use('/users', usersRouter);

module.exports = api;
