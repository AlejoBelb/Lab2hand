// server/src/controllers/courseExperiments.controller.js

const prisma = require('../config/prisma');

// GET /api/courses/:courseId/experiments
// Devuelve los experimentos asociados a un curso
async function listExperimentsByCourse(req, res) {
  try {
    const { courseId } = req.params;
    const { institutionId } = req.user;

    if (!institutionId) {
      return res.status(403).json({
        error: 'El usuario no pertenece a ninguna institución',
      });
    }

    // Validar que el curso exista y pertenezca a la institución
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        institutionId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        error: 'Curso no encontrado o no pertenece a tu institución',
      });
    }

    // Buscar experimentos asociados al curso
    const relations = await prisma.courseExperiment.findMany({
      where: { courseId },
      include: {
        experiment: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            visibility: true,
            status: true,
          },
        },
      },
    });

    // Normalizar respuesta
    const experiments = relations.map(r => r.experiment);

    return res.json({
      course,
      experiments,
    });
  } catch (err) {
    console.error('[courseExperiments.controller]', err);
    return res.status(500).json({ error: 'ServerError' });
  }
}

module.exports = { listExperimentsByCourse };
