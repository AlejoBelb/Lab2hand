// server/src/routes/verification.routes.js
// Rutas para verificación de identidad y revisión de solicitudes

const express = require('express');
const router = express.Router();

// Middlewares de autenticación y rol
const { requireAuth, requireRole } = require('../middlewares/auth');

// Configuración de subida de archivos (foto del documento)
const upload = require('../config/upload');

// Controlador de verificación
const verificationController = require('../controllers/verification.controller');

// POST /api/verification/request
// Crea una nueva solicitud de verificación para el usuario autenticado
router.post('/request', requireAuth, verificationController.requestVerification);

// GET /api/verification/status
// Devuelve el estado de verificación del usuario autenticado
router.get('/status', requireAuth, verificationController.getStatus);

// POST /api/verification/upload-photo
// Sube la foto del documento y devuelve la URL pública
router.post(
  '/upload-photo',
  requireAuth,
  upload.single('photo'),
  (req, res) => {
    try {
      const filename = req.file.filename;
      const fileUrl = `/uploads/verification-docs/${filename}`;

      return res.status(201).json({
        message: 'Foto subida correctamente',
        fileUrl
      });
    } catch (err) {
      return res.status(500).json({
        error: 'Error al subir la imagen',
        details: err.message
      });
    }
  }
);

// POST /api/verification/review
// Revisión de solicitudes de verificación (solo ADMIN)
router.post(
  '/review',
  requireAuth,
  requireRole(['ADMIN']),
  verificationController.review
);

module.exports = router;
