// server/src/routes/experiment.routes.js

const { Router } = require('express');
const ctrl = require('../controllers/experiment.controller');
const validate = require('../middlewares/validate');

// Middlewares locales de auth/roles garantizados
const { ensureAuth, requireRole } = require('../middlewares/role');

const {
  listExperimentsValidator,
  idParamValidator,
  slugParamValidator,
  createExperimentValidator,
  updateExperimentValidator,
} = require('../validators/experiment.validator');

const router = Router();

/**
 * GET /api/experiments
 * Lista con filtros/paginación. Pública por ahora.
 */
router.get('/', listExperimentsValidator, validate, ctrl.list);

/**
 * GET /api/experiments/:id
 * Detalle por ID
 */
router.get('/:id', idParamValidator, validate, ctrl.getById);

/**
 * GET /api/experiments/slug/:slug
 * Detalle por slug
 */
router.get('/slug/:slug', slugParamValidator, validate, ctrl.getBySlug);

/**
 * POST /api/experiments
 * Crea experimento (SOLO ADMIN)
 */
router.post(
  '/',
  ensureAuth,
  requireRole(['ADMIN']),
  createExperimentValidator,
  validate,
  ctrl.create
);

/**
 * PATCH /api/experiments/:id
 * Actualiza experimento (SOLO ADMIN)
 */
router.patch(
  '/:id',
  ensureAuth,
  requireRole(['ADMIN']),
  idParamValidator,
  updateExperimentValidator,
  validate,
  ctrl.update
);

/**
 * DELETE /api/experiments/:id
 * Elimina experimento (SOLO ADMIN)
 */
router.delete(
  '/:id',
  ensureAuth,
  requireRole(['ADMIN']),
  idParamValidator,
  validate,
  ctrl.remove
);

module.exports = router;
