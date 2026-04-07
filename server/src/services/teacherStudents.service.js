// server/src/services/teacherStudents.service.js

const prisma = require('../config/prisma');

/* ======================================================
   LISTAR ESTUDIANTES
   - Muestra estudiantes de los cursos asignados al docente
   - Con filtro de estado: pending | approved | all
====================================================== */

async function listStudents({ teacherId, status = 'all', search } = {}) {
  // Obtener los cursos del docente
  const teacherCourses = await prisma.courseTeacher.findMany({
    where: { teacherId },
    select: { courseId: true },
  });
  const courseIds = teacherCourses.map(tc => tc.courseId);

  const where = { role: 'STUDENT' };

  if (status === 'pending') {
    where.pendingApproval = true;
    where.isActive = false;
  } else if (status === 'approved') {
    where.pendingApproval = false;
    where.isActive = true;
  }

  if (search?.trim()) {
    where.OR = [
      { email:     { contains: search.trim(), mode: 'insensitive' } },
      { firstName: { contains: search.trim(), mode: 'insensitive' } },
      { lastName:  { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      pendingApproval: true,
      createdAt: true,
      // Cursos en los que ya está inscrito (de los cursos del docente)
      enrolledCourses: {
        where: { courseId: { in: courseIds } },
        select: {
          course: { select: { id: true, name: true, grade: true, group: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/* ======================================================
   APROBAR ESTUDIANTE
====================================================== */

async function approveStudent({ teacherId, studentId }) {
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'STUDENT' },
    select: { id: true, isActive: true, pendingApproval: true },
  });

  if (!student) {
    const err = new Error('Estudiante no encontrado');
    err.status = 404;
    throw err;
  }

  if (student.isActive && !student.pendingApproval) {
    const err = new Error('El estudiante ya está aprobado');
    err.status = 400;
    throw err;
  }

  return prisma.user.update({
    where: { id: studentId },
    data: { isActive: true, pendingApproval: false },
    select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
  });
}

/* ======================================================
   RECHAZAR / DESACTIVAR ESTUDIANTE
====================================================== */

async function rejectStudent({ teacherId, studentId }) {
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'STUDENT' },
    select: { id: true },
  });

  if (!student) {
    const err = new Error('Estudiante no encontrado');
    err.status = 404;
    throw err;
  }

  return prisma.user.update({
    where: { id: studentId },
    data: { isActive: false, pendingApproval: false },
    select: { id: true, email: true, isActive: true },
  });
}

/* ======================================================
   ASIGNAR ESTUDIANTE A UN CURSO DEL DOCENTE
====================================================== */

async function enrollStudentInCourse({ teacherId, studentId, courseId }) {
  // Verificar que el docente está asignado al curso
  const courseLink = await prisma.courseTeacher.findUnique({
    where: { courseId_teacherId: { courseId, teacherId } },
    select: { courseId: true },
  });

  if (!courseLink) {
    const err = new Error('No tienes acceso a este curso');
    err.status = 403;
    throw err;
  }

  // Verificar que el estudiante existe y está activo
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'STUDENT', isActive: true },
    select: { id: true },
  });

  if (!student) {
    const err = new Error('Estudiante no encontrado o no aprobado');
    err.status = 404;
    throw err;
  }

  return prisma.courseStudent.upsert({
    where: { courseId_studentId: { courseId, studentId } },
    update: {},
    create: { courseId, studentId },
    select: {
      enrolledAt: true,
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      course:   { select: { id: true, name: true } },
    },
  });
}

/* ======================================================
   REMOVER ESTUDIANTE DE UN CURSO
====================================================== */

async function unenrollStudentFromCourse({ teacherId, studentId, courseId }) {
  // Verificar que el docente está asignado al curso
  const courseLink = await prisma.courseTeacher.findUnique({
    where: { courseId_teacherId: { courseId, teacherId } },
    select: { courseId: true },
  });

  if (!courseLink) {
    const err = new Error('No tienes acceso a este curso');
    err.status = 403;
    throw err;
  }

  const enrollment = await prisma.courseStudent.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
  });

  if (!enrollment) {
    const err = new Error('El estudiante no está inscrito en este curso');
    err.status = 404;
    throw err;
  }

  await prisma.courseStudent.delete({
    where: { courseId_studentId: { courseId, studentId } },
  });
}

module.exports = {
  listStudents,
  approveStudent,
  rejectStudent,
  enrollStudentInCourse,
  unenrollStudentFromCourse,
};
