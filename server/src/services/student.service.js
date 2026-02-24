// server/src/services/student.service.js

const prisma = require('../config/prisma');

/* ======================================================
   CURSOS DEL ESTUDIANTE
====================================================== */

async function listMyCourses({ studentId }) {
  return prisma.course.findMany({
    where: {
      students: { some: { studentId } },
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
      _count: {
        select: { guides: true, experiments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/* ======================================================
   GUÍAS PUBLICADAS DE UN CURSO
====================================================== */

async function listCourseGuides({ studentId, courseId }) {
  // Verificar que el estudiante está inscrito en el curso
  const enrollment = await prisma.courseStudent.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
    select: { studentId: true },
  });

  if (!enrollment) {
    const err = new Error('No estás inscrito en este curso');
    err.status = 403;
    throw err;
  }

  return prisma.guide.findMany({
    where: {
      courseId,
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
      createdAt: true,
      updatedAt: true,
      experiment: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { listMyCourses, listCourseGuides };