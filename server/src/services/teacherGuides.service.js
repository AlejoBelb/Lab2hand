// server/src/services/teacherGuides.service.js

const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

/* ======================================================
   HELPER — verificar que el docente pertenece al curso
====================================================== */

async function assertTeacherAssignedToCourse({ teacherId, courseId }) {
  const link = await prisma.courseTeacher.findUnique({
    where: { courseId_teacherId: { courseId, teacherId } },
    select: { id: true },
  });
  if (!link) {
    const err = new Error('No tienes acceso a este curso');
    err.status = 403;
    throw err;
  }
}

/* ======================================================
   LISTAR GUÍAS DEL DOCENTE
   - Filtradas por curso (opcional)
   - Solo guías creadas por el docente
====================================================== */

async function listMyGuides({ teacherId, courseId } = {}) {
  const where = { createdById: teacherId };
  if (courseId) where.courseId = courseId;

  return prisma.guide.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      course: { select: { id: true, name: true, grade: true, group: true } },
      experiment: { select: { id: true, name: true, slug: true } },
    },
  });
}

/* ======================================================
   OBTENER GUÍA POR ID
====================================================== */

async function getGuideById({ guideId, teacherId }) {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
      course: { select: { id: true, name: true, grade: true, group: true } },
      experiment: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!guide) {
    const err = new Error('Guía no encontrada');
    err.status = 404;
    throw err;
  }

  if (guide.createdById !== teacherId) {
    const err = new Error('No tienes acceso a esta guía');
    err.status = 403;
    throw err;
  }

  return guide;
}

/* ======================================================
   CREAR GUÍA CON PDF
====================================================== */

async function createGuide({ teacherId, courseId, experimentId, title, description, fileUrl }) {
  await assertTeacherAssignedToCourse({ teacherId, courseId });

  // Verificar que el experimento está asignado al curso
  const expLink = await prisma.courseExperiment.findUnique({
    where: { courseId_experimentId: { courseId, experimentId } },
    select: { experimentId: true },
  });

  if (!expLink) {
    const err = new Error('El experimento no está asignado a este curso');
    err.status = 400;
    throw err;
  }

  return prisma.guide.create({
    data: {
      title,
      description: description || null,
      fileUrl,
      status: 'DRAFT',
      courseId,
      experimentId,
      createdById: teacherId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
      status: true,
      createdAt: true,
      course: { select: { id: true, name: true } },
      experiment: { select: { id: true, name: true } },
    },
  });
}

/* ======================================================
   ACTUALIZAR GUÍA (título, descripción o nuevo PDF)
   - Solo si está en DRAFT
====================================================== */

async function updateGuide({ guideId, teacherId, title, description, fileUrl }) {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: { id: true, createdById: true, status: true, fileUrl: true },
  });

  if (!guide) {
    const err = new Error('Guía no encontrada');
    err.status = 404;
    throw err;
  }

  if (guide.createdById !== teacherId) {
    const err = new Error('No puedes editar una guía que no creaste');
    err.status = 403;
    throw err;
  }

  if (guide.status === 'PUBLISHED') {
    const err = new Error('Debes despublicar la guía antes de editarla');
    err.status = 400;
    throw err;
  }

  const data = {};
  if (title) data.title = title;
  if (description !== undefined) data.description = description;

  // Si se sube un PDF nuevo, eliminar el anterior
  if (fileUrl) {
    if (guide.fileUrl) {
      const oldPath = path.join(__dirname, '..', '..', guide.fileUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    data.fileUrl = fileUrl;
  }

  return prisma.guide.update({
    where: { id: guideId },
    data,
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
      status: true,
      updatedAt: true,
    },
  });
}

/* ======================================================
   PUBLICAR GUÍA
====================================================== */

async function publishGuide({ guideId, teacherId }) {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: { id: true, createdById: true, status: true, fileUrl: true, title: true },
  });

  if (!guide) {
    const err = new Error('Guía no encontrada');
    err.status = 404;
    throw err;
  }

  if (guide.createdById !== teacherId) {
    const err = new Error('No puedes publicar una guía que no creaste');
    err.status = 403;
    throw err;
  }

  if (guide.status === 'PUBLISHED') {
    const err = new Error('La guía ya está publicada');
    err.status = 400;
    throw err;
  }

  if (!guide.fileUrl) {
    const err = new Error('Debes subir un PDF antes de publicar');
    err.status = 400;
    throw err;
  }

  if (!guide.title?.trim()) {
    const err = new Error('La guía debe tener un título');
    err.status = 400;
    throw err;
  }

  return prisma.guide.update({
    where: { id: guideId },
    data: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });
}

/* ======================================================
   DESPUBLICAR GUÍA (volver a DRAFT)
====================================================== */

async function unpublishGuide({ guideId, teacherId }) {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: { id: true, createdById: true, status: true },
  });

  if (!guide) {
    const err = new Error('Guía no encontrada');
    err.status = 404;
    throw err;
  }

  if (guide.createdById !== teacherId) {
    const err = new Error('No tienes permiso sobre esta guía');
    err.status = 403;
    throw err;
  }

  if (guide.status === 'DRAFT') {
    const err = new Error('La guía ya está en borrador');
    err.status = 400;
    throw err;
  }

  return prisma.guide.update({
    where: { id: guideId },
    data: { status: 'DRAFT' },
    select: { id: true, title: true, status: true, updatedAt: true },
  });
}

/* ======================================================
   ELIMINAR GUÍA
   - Solo borradores
====================================================== */

async function deleteGuide({ guideId, teacherId }) {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: { id: true, createdById: true, status: true, fileUrl: true },
  });

  if (!guide) {
    const err = new Error('Guía no encontrada');
    err.status = 404;
    throw err;
  }

  if (guide.createdById !== teacherId) {
    const err = new Error('No puedes eliminar una guía que no creaste');
    err.status = 403;
    throw err;
  }

  if (guide.status === 'PUBLISHED') {
    const err = new Error('Debes despublicar la guía antes de eliminarla');
    err.status = 400;
    throw err;
  }

  // Eliminar archivo PDF del disco
  if (guide.fileUrl) {
    const filePath = path.join(__dirname, '..', '..', guide.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await prisma.guide.delete({ where: { id: guideId } });
}

/* ======================================================
   LISTAR CURSOS DEL DOCENTE (para el panel)
====================================================== */

async function listMyCourses({ teacherId }) {
  return prisma.course.findMany({
    where: {
      teachers: { some: { teacherId } },
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      grade: true,
      group: true,
      academicYear: true,
      experiments: {
        select: {
          experiment: { select: { id: true, name: true, slug: true } },
        },
      },
      _count: { select: { guides: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Mantener compatibilidad con código anterior
async function upsertDraftGuide({ teacherId, payload }) {
  const { id, courseId, experimentId, title, description, content } = payload;
  await assertTeacherAssignedToCourse({ teacherId, courseId });

  if (id) {
    const updated = await prisma.guide.update({
      where: { id },
      data: { title, description: description ?? null, content: content ?? undefined, status: 'DRAFT' },
      select: { id: true, title: true, status: true, courseId: true, updatedAt: true },
    });
    return { mode: 'updated', guide: updated };
  }

  const created = await prisma.guide.create({
    data: { title, description: description ?? null, content: content ?? undefined, status: 'DRAFT', courseId, experimentId: experimentId ?? null, createdById: teacherId },
    select: { id: true, title: true, status: true, courseId: true, createdAt: true },
  });
  return { mode: 'created', guide: created };
}

module.exports = {
  listMyGuides,
  getGuideById,
  createGuide,
  updateGuide,
  publishGuide,
  unpublishGuide,
  deleteGuide,
  listMyCourses,
  upsertDraftGuide,
};