// server/src/routes/me.routes.js

const { Router } = require('express');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { getMe, adminCheck } = require('../controllers/me.controller');

const router = Router();

// Perfil del usuario autenticado
router.get('/', auth, getMe);

// Ejemplo de endpoint que requiere rol ADMIN
router.get('/admin-check', auth, authorize('ADMIN'), adminCheck);

module.exports = router;
