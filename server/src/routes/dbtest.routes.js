//server\src\routes\dbtest.routes.js

// Prueba directa de conexión a base de datos

const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

router.get('/dbtest', async (_req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() AS current_time`;
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('❌ Error en dbtest:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
