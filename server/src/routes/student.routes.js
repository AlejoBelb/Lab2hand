// server/src/routes/student.routes.js

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { getMyCourses, getCourseGuides } = require('../controllers/student.controller');

const router = Router();

router.use(requireAuth, requireRole(['STUDENT']));

router.get('/courses', getMyCourses);
router.get('/courses/:courseId/guides', getCourseGuides);

module.exports = router;