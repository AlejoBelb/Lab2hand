// server/src/controllers/teacherCourses.controller.js

const prisma = require('../config/prisma');

// GET /api/teacher/courses
// Devuelve los cursos donde el docente está asignado, sin restricción de institución
async function listMyCourses(req, res) {
  try {
    const { id: teacherId } = req.user;

    const courses = await prisma.course.findMany({
      where: {
        status: 'ACTIVE',
        teachers: {
          some: { teacherId },
        },
      },
      select: {
        id: true,
        name: true,
        grade: true,
        group: true,
        academicYear: true,
        createdAt: true,
        institution: { select: { id: true, name: true } },
        experiments: {
          select: {
            experiment: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ courses });
  } catch (err) {
    console.error('[teacherCourses] Error:', err);
    return res.status(500).json({ error: 'ServerError' });
  }
}

module.exports = { listMyCourses };
