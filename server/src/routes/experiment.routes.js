// server/src/routes/experiment.routes.js

const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth');
const {
  getExperiments,
  getExperiment,
  getExperimentGuide,
} = require('../controllers/experiment.controller');

const router = Router();

// GET /api/experiments — público
router.get('/', getExperiments);

// GET /api/experiments/:slug — público
router.get('/:slug', getExperiment);

// GET /api/experiments/:slug/guide — requiere autenticación
router.get('/:slug/guide', requireAuth, getExperimentGuide);

module.exports = router;
