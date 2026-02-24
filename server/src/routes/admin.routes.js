// server/src/routes/admin.routes.js

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middlewares/auth');
const {
  // Instituciones
  getInstitutions,
  getInstitution,
  postInstitution,
  patchInstitution,
  // Usuarios
  getUsers,
  postUser,
  patchUser,
  approveUser,
  // Docentes pendientes
  getPendingTeachers,
  approveTeacherController,
} = require('../controllers/admin.controller');

const router = Router();

// Todas las rutas bajo /api/admin requieren ADMIN autenticado
router.use(requireAuth, requireRole(['ADMIN']));

// ─── Instituciones ────────────────────────────────────────────────────────
router.get('/institutions',     getInstitutions);
router.get('/institutions/:id', getInstitution);
router.post('/institutions',    postInstitution);
router.patch('/institutions/:id', patchInstitution);

// ─── Usuarios ─────────────────────────────────────────────────────────────
router.get('/users',    getUsers);
router.post('/users',   postUser);
router.patch('/users/:id', patchUser);
router.post('/users/:userId/approve', approveUser);

// ─── Docentes pendientes ──────────────────────────────────────────────────
router.get('/pending-teachers',   getPendingTeachers);
router.post('/approve-teacher',   approveTeacherController);

module.exports = router;