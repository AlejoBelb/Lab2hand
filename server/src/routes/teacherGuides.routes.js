// server/src/routes/teacherGuides.routes.js

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middlewares/auth');
const uploadGuide = require('../config/uploadGuides');
const {
  getMyGuides,
  getMyCourses,
  getGuide,
  postGuide,
  patchGuide,
  postPublish,
  postUnpublish,
  deleteGuideController,
  saveDraft,
} = require('../controllers/teacherGuides.controller');

const router = Router();

router.use(requireAuth, requireRole(['TEACHER']));

// ─── Cursos del docente ───────────────────────────────────────────────────
router.get('/courses', getMyCourses);

// ─── Guías ────────────────────────────────────────────────────────────────
router.get('/guides',                    getMyGuides);
router.get('/guides/:id',                getGuide);
router.post('/guides', uploadGuide.single('pdf'), postGuide);
router.patch('/guides/:id', uploadGuide.single('pdf'), patchGuide);
router.post('/guides/:id/publish',       postPublish);
router.post('/guides/:id/unpublish',     postUnpublish);
router.delete('/guides/:id',             deleteGuideController);

// Compatibilidad endpoint anterior
router.post('/guides/draft', saveDraft);

module.exports = router;