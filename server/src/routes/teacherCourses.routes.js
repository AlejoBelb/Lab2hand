// server/src/routes/teacherCourses.routes.js

const { Router } = require('express');
const router = Router();

const { requireAuth, requireRole } = require('../middlewares/auth');
const { listMyCourses } = require('../controllers/teacherCourses.controller');

// GET /api/teacher/courses
router.get(
  '/courses',
  requireAuth,
  requireRole(['TEACHER']),
  listMyCourses
);

module.exports = router;
