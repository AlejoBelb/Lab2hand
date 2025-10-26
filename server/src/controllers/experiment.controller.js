// server/src/controllers/experiment.controller.js

// Esta sección importa el servicio que contiene la lógica de negocio
const service = require('../services/experiment.service');

// Esta función responde con lista paginada de experimentos
async function list(req, res, next) {
  try {
    const { page, pageSize, sort, order, status, visibility, search, ownerId } = req.query;
    const result = await service.listExperiments({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sort,
      order,
      status,
      visibility,
      search,
      ownerId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Esta función retorna un experimento por ID
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const exp = await service.getExperimentById(id);
    if (!exp) {
      return res.status(404).json({ error: 'NotFound', message: 'Experimento no encontrado' });
    }
    res.json({ experiment: exp });
  } catch (err) {
    next(err);
  }
}

// Esta función retorna un experimento por slug
async function getBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const exp = await service.getExperimentBySlug(slug);
    if (!exp) {
      return res.status(404).json({ error: 'NotFound', message: 'Experimento no encontrado' });
    }
    res.json({ experiment: exp });
  } catch (err) {
    next(err);
  }
}

// Esta función crea un experimento (requiere ADMIN en rutas)
async function create(req, res, next) {
  try {
    const { title, slug, description, status, visibility } = req.body;
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Sesión requerida' });
    }
    const created = await service.createExperiment({ title, slug, description, status, visibility, ownerId });
    res.status(201).json({ experiment: created });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: 'Error', message: err.message });
    }
    next(err);
  }
}

// Esta función actualiza un experimento (requiere ADMIN en rutas)
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, slug, description, status, visibility } = req.body;
    const updated = await service.updateExperiment(id, { title, slug, description, status, visibility });
    res.json({ experiment: updated });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: 'Error', message: err.message });
    }
    next(err);
  }
}

// Esta función elimina un experimento (requiere ADMIN en rutas)
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await service.deleteExperiment(id);
    res.json({ ok: true, deleted });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: 'Error', message: err.message });
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
