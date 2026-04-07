// server/src/routes/teacherStudents.routes.js

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middlewares/auth');
const {
  getStudents, postApprove, postReject, postEnroll, deleteEnroll,
} = require('../controllers/teacherStudents.controller');

const router = Router();
router.use(requireAuth, requireRole(['TEACHER']));

router.get('/students',                           getStudents);
router.post('/students/:id/approve',              postApprove);
router.post('/students/:id/reject',               postReject);
router.post('/students/:id/enroll',               postEnroll);
router.delete('/students/:id/courses/:courseId',  deleteEnroll);

module.exports = router;
