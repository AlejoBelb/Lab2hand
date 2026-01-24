// server/src/routes/health.routes.js
// Rutas públicas de verificación de salud del servicio.

const { Router } = require('express');
const { getHealth } = require('../controllers/health.controller');

const router = Router();

router.get('/', getHealth);

module.exports = router;
