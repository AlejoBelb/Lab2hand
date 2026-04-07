// server/src/services/courses.service.js

const prisma = require('../config/prisma');

/* ======================================================
   HELPERS
====================================================== */

function parsePagination({ page = 1, pageSize = 20 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
  return { safePage, safeSize };
}

async function assertCourseExists(courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!course) {
    const err = new Error('Curso no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return course;
}

/* ======================================================
   LISTAR CURSOS
   - institutionId opcional: si se pasa filtra por institución,
     si no se pasa devuelve todos (admin global)
====================================================== */

async function listCourses({
  institutionId,
  page = 1,
  pageSize = 20,
  status,
  search,
  sort = 'createdAt',
  order = 'desc',
} = {}) {
  const { safePage, safeSize } = parsePagination({ page, pageSize });
  const safeOrder = order === 'asc' ? 'asc' : 'desc';
  const allowedSort = new Set(['createdAt', 'name', 'academicYear', 'status']);
  const safeSort = allowedSort.has(sort) ? sort : 'createdAt';

  const where = {};
  if (institutionId) where.institutionId = institutionId;
  if (status) where.status = status;
  if (search?.trim()) {
    where.OR = [
      { name:  { contains: search.trim(), mode: 'insensitive' } },
      { grade: { contains: search.trim(), mode: 'insensitive' } },
      { group: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy: { [safeSort]: safeOrder },
      skip: (safePage - 1) * safeSize,
      take: safeSize,
      select: {
        id: true,
        name: true,
        grade: true,
        group: true,
        academicYear: true,
        status: true,
        startsAt: true,
        endsAt: true,
        createdAt: true,
        institution: { select: { id: true, name: true } },
        _count: {
          select: {
            teachers: true,
            students: true,
            guides: true,
            experiments: true,
          },
        },
      },
    }),
  ]);

  return {
    items,
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeSize)),
  };
}

/* ======================================================
   OBTENER CURSO POR ID
====================================================== */

async function getCourseById(courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      grade: true,
      group: true,
      academicYear: true,
      status: true,
      startsAt: true,
      endsAt: true,
      createdAt: true,
      updatedAt: true,
      institution: { select: { id: true, name: true } },
      teachers: {
        select: {
          role: true,
          assignedAt: true,
          teacher: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
      students: {
        select: {
          enrolledAt: true,
          student: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
      experiments: {
        select: {
          experiment: { select: { id: true, slug: true, name: true } },
        },
      },
      _count: {
        select: {
          teachers: true,
          students: true,
          guides: true,
          experiments: true,
        },
      },
    },
  });

  if (!course) {
    const err = new Error('Curso no encontrado');
    err.statusCode = 404;
    throw err;
  }

  return course;
}

/* ======================================================
   CREAR CURSO
====================================================== */

async function createCourse({
  institutionId,
  name,
  grade,
  group,
  academicYear,
  startsAt,
  endsAt,
}) {
  if (!name?.trim() || !grade?.trim() || !group?.trim() || !academicYear?.trim()) {
    const err = new Error('name, grade, group y academicYear son obligatorios');
    err.statusCode = 400;
    throw err;
  }

  if (!startsAt || !endsAt) {
    const err = new Error('startsAt y endsAt son obligatorios');
    err.statusCode = 400;
    throw err;
  }

  const start = new Date(startsAt);
  const end   = new Date(endsAt);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const err = new Error('Fechas inválidas');
    err.statusCode = 400;
    throw err;
  }

  if (end <= start) {
    const err = new Error('endsAt debe ser posterior a startsAt');
    err.statusCode = 400;
    throw err;
  }

  return prisma.course.create({
    data: {
      name: name.trim(),
      grade: grade.trim(),
      group: group.trim(),
      academicYear: academicYear.trim(),
      startsAt: start,
      endsAt: end,
      status: 'ACTIVE',
      institutionId,
    },
    select: {
      id: true, name: true, grade: true, group: true,
      academicYear: true, status: true, startsAt: true, endsAt: true, createdAt: true,
    },
  });
}

/* ======================================================
   ACTUALIZAR CURSO
====================================================== */

async function updateCourse(courseId, {
  name, grade, group, academicYear, startsAt, endsAt, status,
}) {
  await assertCourseExists(courseId);

  const data = {};
  if (typeof name === 'string' && name.trim())         data.name = name.trim();
  if (typeof grade === 'string' && grade.trim())       data.grade = grade.trim();
  if (typeof group === 'string' && group.trim())       data.group = group.trim();
  if (typeof academicYear === 'string' && academicYear.trim()) data.academicYear = academicYear.trim();

  if (status) {
    const validStatuses = ['ACTIVE', 'EXPIRED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      const err = new Error('Estado inválido');
      err.statusCode = 400;
      throw err;
    }
    data.status = status;
  }

  if (startsAt) {
    const d = new Date(startsAt);
    if (isNaN(d.getTime())) { const err = new Error('startsAt inválido'); err.statusCode = 400; throw err; }
    data.startsAt = d;
  }
  if (endsAt) {
    const d = new Date(endsAt);
    if (isNaN(d.getTime())) { const err = new Error('endsAt inválido'); err.statusCode = 400; throw err; }
    data.endsAt = d;
  }

  if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) {
    const err = new Error('endsAt debe ser posterior a startsAt');
    err.statusCode = 400;
    throw err;
  }

  return prisma.course.update({
    where: { id: courseId },
    data,
    select: {
      id: true, name: true, grade: true, group: true,
      academicYear: true, status: true, startsAt: true, endsAt: true, updatedAt: true,
    },
  });
}

/* ======================================================
   MEMBRESÍAS – DOCENTES
====================================================== */

async function addTeacher(courseId, { teacherId, role = 'OWNER' }) {
  await assertCourseExists(courseId);

  const validRoles = ['OWNER', 'EDITOR', 'VIEWER'];
  if (!validRoles.includes(role)) {
    const err = new Error('Rol inválido. Valores: OWNER, EDITOR, VIEWER');
    err.statusCode = 400;
    throw err;
  }

  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, role: 'TEACHER' },
    select: { id: true },
  });
  if (!teacher) {
    const err = new Error('Docente no encontrado');
    err.statusCode = 404;
    throw err;
  }

  return prisma.courseTeacher.upsert({
    where: { courseId_teacherId: { courseId, teacherId } },
    update: { role },
    create: { courseId, teacherId, role },
    select: {
      role: true,
      assignedAt: true,
      teacher: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });
}

async function removeTeacher(courseId, teacherId) {
  await assertCourseExists(courseId);

  const link = await prisma.courseTeacher.findUnique({
    where: { courseId_teacherId: { courseId, teacherId } },
  });
  if (!link) {
    const err = new Error('El docente no está asignado a este curso');
    err.statusCode = 404;
    throw err;
  }

  await prisma.courseTeacher.delete({
    where: { courseId_teacherId: { courseId, teacherId } },
  });
}

/* ======================================================
   MEMBRESÍAS – ESTUDIANTES
====================================================== */

async function addStudent(courseId, { studentId }) {
  await assertCourseExists(courseId);

  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'STUDENT' },
    select: { id: true },
  });
  if (!student) {
    const err = new Error('Estudiante no encontrado');
    err.statusCode = 404;
    throw err;
  }

  return prisma.courseStudent.upsert({
    where: { courseId_studentId: { courseId, studentId } },
    update: {},
    create: { courseId, studentId },
    select: {
      enrolledAt: true,
      student: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });
}

async function removeStudent(courseId, studentId) {
  await assertCourseExists(courseId);

  const link = await prisma.courseStudent.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
  });
  if (!link) {
    const err = new Error('El estudiante no está inscrito en este curso');
    err.statusCode = 404;
    throw err;
  }

  await prisma.courseStudent.delete({
    where: { courseId_studentId: { courseId, studentId } },
  });
}

/* ======================================================
   EXPERIMENTOS DEL CURSO
====================================================== */

async function addExperiment(courseId, experimentId) {
  await assertCourseExists(courseId);

  const exp = await prisma.experiment.findUnique({
    where: { id: experimentId },
    select: { id: true },
  });
  if (!exp) {
    const err = new Error('Experimento no encontrado');
    err.statusCode = 404;
    throw err;
  }

  return prisma.courseExperiment.upsert({
    where: { courseId_experimentId: { courseId, experimentId } },
    update: {},
    create: { courseId, experimentId },
    select: {
      experiment: { select: { id: true, slug: true, name: true } },
    },
  });
}

async function removeExperiment(courseId, experimentId) {
  await assertCourseExists(courseId);

  const link = await prisma.courseExperiment.findUnique({
    where: { courseId_experimentId: { courseId, experimentId } },
  });
  if (!link) {
    const err = new Error('El experimento no está asignado a este curso');
    err.statusCode = 404;
    throw err;
  }

  await prisma.courseExperiment.delete({
    where: { courseId_experimentId: { courseId, experimentId } },
  });
}

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  addTeacher,
  removeTeacher,
  addStudent,
  removeStudent,
  addExperiment,
  removeExperiment,
};
