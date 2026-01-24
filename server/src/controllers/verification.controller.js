// server/src/controllers/verification.controller.js
// Controlador HTTP para solicitudes de verificación de identidad y rol

const {
  createVerificationRequest,
  getUserVerificationStatus,
  reviewVerificationRequest,
} = require('../services/verification.service');

// Crear solicitud de verificación
async function requestVerification(req, res, next) {
  try {
    const userId = req.user && req.user.id; // <- USAR id, no sub
    const {
      documentType,
      documentNumber,
      institutionEmail,
      photoUrl,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (!documentType || !documentNumber || !photoUrl) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'Tipo de documento, número y foto son obligatorios',
      });
    }

    const request = await createVerificationRequest(userId, {
      documentType,
      documentNumber,
      institutionEmail,
      photoUrl,
    });

    return res.status(201).json({
      message: 'Solicitud de verificación enviada',
      request,
    });
  } catch (err) {
    next(err);
  }
}

// Obtener estado de verificación
async function getStatus(req, res, next) {
  try {
    const userId = req.user && req.user.id; // <- USAR id, no sub

    if (!userId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { user, lastRequest } = await getUserVerificationStatus(userId);

    return res.status(200).json({
      user,
      lastRequest,
    });
  } catch (err) {
    next(err);
  }
}

// Revisar solicitud (solo ADMIN)
async function review(req, res, next) {
  try {
    const adminId = req.user && req.user.id; // <- USAR id, no sub
    const { requestId, status, notes } = req.body;

    if (!adminId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (!requestId || !status) {
      return res.status(400).json({
        error: 'Datos inválidos',
        message: 'requestId y status son obligatorios',
      });
    }

    const updated = await reviewVerificationRequest(adminId, {
      requestId,
      status,
      notes,
    });

    return res.status(200).json({
      message: 'Solicitud actualizada',
      request: updated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requestVerification,
  getStatus,
  review,
};
