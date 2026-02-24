// src/routes/auth.routes.js
// Rutas de autenticación para registro, login y tokens

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const prisma = require('../config/prisma');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// ─── Instituciones (endpoint público) ──────────────────────────────────────
router.get('/institutions', async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return res.json({ institutions });
  } catch { res.status(500).json({ error: 'Error al obtener instituciones' }); }
});

module.exports = router;
