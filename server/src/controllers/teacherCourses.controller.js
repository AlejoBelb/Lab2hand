// server/src/controllers/teacherCourses.controller.js

const prisma = require('../config/prisma');

// GET /api/teacher/courses
// Devuelve los cursos del docente autenticado, incluyendo experimentos asignados
async function listMyCourses(req, res) {
  try {
    const { id: userId, institutionId } = req.user;

    if (!institutionId) {
      return res
        .status(403)
        .json({ error: 'El usuario no pertenece a ninguna institución' });
    }

    const courses = await prisma.course.findMany({
      where: {
        institutionId,
        status: 'ACTIVE',
        teachers: {
          some: {
            teacherId: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        grade: true,
        group: true,
        academicYear: true,
        createdAt: true,
        experiments: {
          select: {
            experiment: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
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