// server/src/services/admin.service.js

const prisma = require('../config/prisma');

/* ======================================================
   LISTAR DOCENTES PENDIENTES DE APROBACIÓN
   - Aún NO son TEACHER
   - pendingApproval = true
   - isActive = false
====================================================== */
async function listPendingTeachers() {
  return prisma.user.findMany({
    where: {
      pendingApproval: true,
      isActive: false,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });
}

/* ======================================================
   APROBAR DOCENTE
   - Cambia role → TEACHER
   - Activa la cuenta
   - Asigna institución
====================================================== */
async function approveTeacher({ userId, institutionId }) {
  // 1. Validar institución
  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
  });

  if (!institution) {
    const err = new Error('Institución no encontrada');
    err.statusCode = 404;
    throw err;
  }

  // 2. Validar usuario pendiente
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  if (!user.pendingApproval || user.isActive) {
    const err = new Error('El usuario no está pendiente de aprobación');
    err.statusCode = 400;
    throw err;
  }

  // 3. Aprobar docente
  return prisma.user.update({
    where: { id: userId },
    data: {
      role: 'TEACHER',
      isActive: true,
      pendingApproval: false,
      institutionId,
    },
  });
}

module.exports = {
  listPendingTeachers,
  approveTeacher,
};
