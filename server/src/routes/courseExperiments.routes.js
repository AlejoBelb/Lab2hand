const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middlewares/auth');
const { listExperimentsByCourse } = require('../controllers/courseExperiments.controller');

// GET /api/courses/:courseId/experiments
router.get(
  '/:courseId/experiments',
  requireAuth,
  listExperimentsByCourse
);

module.exports = router; // ⬅️ ESTO es lo clave
