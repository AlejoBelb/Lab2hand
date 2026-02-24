// server/src/services/teacherStudents.service.js

const prisma = require('../config/prisma');

/* ======================================================
   VERIFICAR QUE EL DOCENTE PERTENECE A LA INSTITUCIÓN
====================================================== */

async function getTeacherInstitution(teacherId) {
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { institutionId: true },
  });

  if (!teacher?.institutionId) {
    const err = new Error('El docente no pertenece a ninguna institución');
    err.status = 403;
    throw err;
  }

  return teacher.institutionId;
}

/* ======================================================
   LISTAR ESTUDIANTES DE LA INSTITUCIÓN
   - Con filtro de estado: pending | approved | all
====================================================== */

async function listStudents({ teacherId, status = 'all', search } = {}) {
  const institutionId = await getTeacherInstitution(teacherId);

  const where = {
    institutionId,
    role: 'STUDENT',
  };

  if (status === 'pending') {
    where.pendingApproval = true;
    where.isActive = false;
  } else if (status === 'approved') {
    where.pendingApproval = false;
    where.isActive = true;
  }

  if (search?.trim()) {
    where.OR = [
      { email: { contains: search.trim(), mode: 'insensitive' } },
      { firstName: { contains: search.trim(), mode: 'insensitive' } },
      { lastName: { contains: search.trim(), mode: 'insensitive' } },
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
      // Cursos en los que ya está inscrito dentro de esta institución
      enrolledCourses: {
        where: { course: { institutionId } },
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
   - Lo activa y quita pendingApproval
====================================================== */

async function approveStudent({ teacherId, studentId }) {
  const institutionId = await getTeacherInstitution(teacherId);

  const student = await prisma.user.findFirst({
    where: { id: studentId, institutionId, role: 'STUDENT' },
    select: { id: true, isActive: true, pendingApproval: true },
  });

  if (!student) {
    const err = new Error('Estudiante no encontrado en esta institución');
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
  const institutionId = await getTeacherInstitution(teacherId);

  const student = await prisma.user.findFirst({
    where: { id: studentId, institutionId, role: 'STUDENT' },
    select: { id: true },
  });

  if (!student) {
    const err = new Error('Estudiante no encontrado en esta institución');
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
  const institutionId = await getTeacherInstitution(teacherId);

  // Verificar que el docente pertenece al curso
  const courseLink = await prisma.courseTeacher.findUnique({
    where: { courseId_teacherId: { courseId, teacherId } },
    select: { courseId: true },
  });

  if (!courseLink) {
    const err = new Error('No tienes acceso a este curso');
    err.status = 403;
    throw err;
  }

  // Verificar que el estudiante está aprobado y en la misma institución
  const student = await prisma.user.findFirst({
    where: { id: studentId, institutionId, role: 'STUDENT', isActive: true },
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
      course: { select: { id: true, name: true } },
    },
  });
}

/* ======================================================
   REMOVER ESTUDIANTE DE UN CURSO
====================================================== */

async function unenrollStudentFromCourse({ teacherId, studentId, courseId }) {
  const institutionId = await getTeacherInstitution(teacherId);

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