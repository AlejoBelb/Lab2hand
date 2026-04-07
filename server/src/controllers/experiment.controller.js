// server/src/controllers/experiment.controller.js

const {
  listExperiments,
  getExperimentBySlug,
  getGuideByExperimentSlug,
} = require('../services/experiment.service');

async function getExperiments(req, res, next) {
  try {
    const experiments = await listExperiments();
    return res.json({ experiments });
  } catch (err) { next(err); }
}

async function getExperiment(req, res, next) {
  try {
    const experiment = await getExperimentBySlug(req.params.slug);
    if (!experiment) {
      return res.status(404).json({ message: 'Experimento no encontrado' });
    }
    return res.json({ experiment });
  } catch (err) { next(err); }
}

// GET /api/experiments/:slug/guide
// Devuelve la guía PDF asociada al experimento (precargada por seed)
async function getExperimentGuide(req, res, next) {
  try {
    const guide = await getGuideByExperimentSlug(req.params.slug);
    if (!guide) {
      return res.status(404).json({ message: 'Este experimento no tiene guía asignada' });
    }
    return res.json({ guide });
  } catch (err) { next(err); }
}

module.exports = {
  getExperiments,
  getExperiment,
  getExperimentGuide,
};
