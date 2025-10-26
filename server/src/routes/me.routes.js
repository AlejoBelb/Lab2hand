// server/src/routes/me.routes.js

const express = require('express');
const router = express.Router();

// Controlador
const meController = require('../controllers/me.controller');

// Middlewares (usar DESTRUCTURING correcto)
const { requireAuth, requireRole } = require('../middlewares/auth');

// GET /api/me -> perfil del usuario autenticado
router.get('/', requireAuth, meController.me);

// GET /api/me/admin-check -> solo ADMIN
router.get('/admin-check', requireAuth, requireRole(['ADMIN']), (req, res) => {
  res.json({ ok: true, message: 'Acceso ADMIN concedido' });
});

module.exports = router;
