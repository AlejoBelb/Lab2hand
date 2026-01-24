// server/src/controllers/experiment.controller.js

const service = require('../services/experiment.service');
const prisma = require('../config/prisma');

// ======================================================
// LISTAR EXPERIMENTOS (con control por curso)
// ======================================================
async function list(req, res, next) {
  try {
    const { page, pageSize, sort, order, status, visibility, search } = req.query;
    const { role, id: userId, institutionId } = req.user || {};

    let courseIds = undefined;

    // Si no es ADMIN, limitar por cursos del usuario
    if (role !== 'ADMIN') {
      if (!institutionId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Usuario sin institución asignada',
        });
      }

      const courses = await prisma.course.findMany({
        where: {
          institutionId,
          OR: [
            { students: { some: { studentId: userId } } },
            { teachers: { some: { teacherId: userId } } },
          ],
        },
        select: { id: true },
      });

      courseIds = courses.map(c => c.id);

      if (courseIds.length === 0) {
        return res.json({
          page: 1,
          pageSize: 0,
          total: 0,
          items: [],
        });
      }
    }

    const result = await service.listExperiments({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sort,
      order,
      status,
      visibility,
      search,
      courseIds,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ======================================================
// OBTENER EXPERIMENTO POR ID
// ======================================================
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const exp = await service.getExperimentById(id);

    if (!exp) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Experimento no encontrado',
      });
    }

    res.json({ experiment: exp });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// OBTENER EXPERIMENTO POR SLUG
// ======================================================
async function getBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const exp = await service.getExperimentBySlug(slug);

    if (!exp) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Experimento no encontrado',
      });
    }

    res.json({ experiment: exp });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// CREAR EXPERIMENTO (ADMIN)
// ======================================================
async function create(req, res, next) {
  try {
    const { title, slug, description, status, visibility, courseId } = req.body;
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Sesión requerida',
      });
    }

    const created = await service.createExperiment({
      title,
      slug,
      description,
      status,
      visibility,
      ownerId,
      courseId,
    });

    res.status(201).json({ experiment: created });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: 'Error',
        message: err.message,
      });
    }
    next(err);
  }
}

// ======================================================
// ACTUALIZAR EXPERIMENTO (ADMIN)
// ======================================================
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, slug, description, status, visibility, courseId } = req.body;

    const updated = await service.updateExperiment(id, {
      title,
      slug,
      description,
      status,
      visibility,
      courseId,
    });

    res.json({ experiment: updated });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: 'Error',
        message: err.message,
      });
    }
    next(err);
  }
}

// ======================================================
// ELIMINAR EXPERIMENTO (ADMIN)
// ======================================================
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await service.deleteExperiment(id);
    res.json({ ok: true, deleted });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        error: 'Error',
        message: err.message,
      });
    }
    next(err);
  }
}

module.exports = {
  list,
  getById,
  getBySlug,
  create,
  update,
  remove,
};
