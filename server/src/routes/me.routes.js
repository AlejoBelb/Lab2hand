// server/src/routes/me.routes.js

const express = require('express');
const router = express.Router();

// Controlador
const meController = require('../controllers/me.controller');

// Middlewares
const { requireAuth, requireRole } = require('../middlewares/auth');
const requireInstitution = require('../middlewares/requireInstitution');

// GET /api/me -> perfil del usuario autenticado (requiere institución)
router.get(
  '/',
  requireAuth,
  requireInstitution, // ← PASO CLAVE
  meController.me
);

// GET /api/me/admin-check -> solo ADMIN
router.get(
  '/admin-check',
  requireAuth,
  requireRole(['ADMIN']),
  (req, res) => {
    res.json({ ok: true, message: 'Acceso ADMIN concedido' });
  }
);

module.exports = router;
