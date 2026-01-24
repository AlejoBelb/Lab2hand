// server/src/controllers/teacherCourses.controller.js

const prisma = require('../config/prisma');

// GET /api/teacher/courses
// Devuelve los cursos del docente autenticado, filtrados por institución
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
        teachers: {
          some: {
            teacherId: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return res.json({ courses });
  } catch (err) {
    console.error('[teacherCourses] Error:', err);
    return res.status(500).json({ error: 'ServerError' });
  }
}

module.exports = { listMyCourses };
