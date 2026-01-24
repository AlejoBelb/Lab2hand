const { Router } = require('express');
const { requireAuth, requireRole } = require('../middlewares/auth');
const {
  getPendingTeachers,
  approveTeacherController,
} = require('../controllers/admin.controller');

const router = Router();

// Todas las rutas solo ADMIN
router.use(requireAuth, requireRole(['ADMIN']));

router.get('/pending-teachers', getPendingTeachers);
router.post('/approve-teacher', approveTeacherController);

module.exports = router;
