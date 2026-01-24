// src/services/verification.service.js
// Servicio para gestionar solicitudes de verificación de identidad y rol

const prisma = require('../config/prisma');

async function createVerificationRequest(userId, data) {
  const {
    documentType,
    documentNumber,
    institutionEmail,
    photoUrl,
  } = data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error('La cuenta está desactivada');
    error.statusCode = 403;
    throw error;
  }

  const existingDoc = await prisma.verificationRequest.findFirst({
    where: {
      documentType,
      documentNumber,
      NOT: {
        userId,
      },
    },
  });

  if (existingDoc) {
    const error = new Error('Este documento ya está asociado a otro usuario');
    error.statusCode = 400;
    throw error;
  }

  const request = await prisma.verificationRequest.create({
    data: {
      userId,
      documentType,
      documentNumber,
      institutionEmail: institutionEmail || null,
      photoUrl,
      status: 'PENDING',
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: 'PENDING',
    },
  });

  return request;
}

async function getUserVerificationStatus(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      verificationStatus: true,
      verifiedAt: true,
    },
  });

  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const lastRequest = await prisma.verificationRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return { user, lastRequest };
}

async function reviewVerificationRequest(adminId, data) {
  const { requestId, status, notes } = data;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    const error = new Error('Estado de verificación inválido');
    error.statusCode = 400;
    throw error;
  }

  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    const error = new Error('Solicitud de verificación no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();

  const updatedRequest = await prisma.verificationRequest.update({
    where: { id: requestId },
    data: {
      status,
      notes: notes || null,
      reviewedBy: adminId,
      reviewedAt: now,
    },
  });

  if (status === 'APPROVED') {
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        verificationStatus: 'APPROVED',
        verifiedAt: now,
      },
    });
  } else if (status === 'REJECTED') {
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        verificationStatus: 'REJECTED',
      },
    });
  }

  return updatedRequest;
}

module.exports = {
  createVerificationRequest,
  getUserVerificationStatus,
  reviewVerificationRequest,
};
