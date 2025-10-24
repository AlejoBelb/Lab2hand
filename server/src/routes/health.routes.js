// server/src/routes/health.routes.js

const { Router } = require('express');
const { health, readiness } = require('../controllers/health.controller');

const router = Router();

// Endpoint de liveness: confirma que el proceso está corriendo
router.get('/', health);

// Endpoint de readiness: pensado para validar dependencias
router.get('/ready', readiness);

module.exports = router;
