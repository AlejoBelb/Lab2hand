// server/src/routes/admin.routes.js

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middlewares/auth');

const {
  getInstitutions,
  getInstitution,
  postInstitution,
  patchInstitution,
  getUsers,
  postUser,
  patchUser,
  approveUserController,
  getPendingUsers,
  getPendingTeachers,
  approveTeacherController,
} = require('../controllers/admin.controller');

const {
  getGlobalUsers,
  postGlobalUser,
  patchGlobalUser,
  postAssignAdmin,
} = require('../controllers/global.controller');

const router = Router();

router.use(requireAuth, requireRole(['ADMIN']));

// ─── Instituciones (gestión global) ──────────────────────────────────────────
router.get('/institutions',       getInstitutions);
router.get('/institutions/:id',   getInstitution);
router.post('/institutions',      postInstitution);
router.patch('/institutions/:id', patchInstitution);

// ─── Usuarios globales ────────────────────────────────────────────────────────
router.get('/global-users',       getGlobalUsers);
router.post('/global-users',      postGlobalUser);
router.patch('/global-users/:id', patchGlobalUser);
router.post('/assign-admin',      postAssignAdmin);

// ─── Usuarios pendientes de aprobación ───────────────────────────────────────
router.get('/pending-users',      getPendingUsers);
router.get('/pending-teachers',   getPendingTeachers); // legacy

// ─── Usuarios de la institución propia ───────────────────────────────────────
router.get('/users',              getUsers);
router.post('/users',             postUser);
router.patch('/users/:id',        patchUser);
router.post('/users/:userId/approve', approveUserController);

// ─── Legacy ───────────────────────────────────────────────────────────────────
router.post('/approve-teacher',   approveTeacherController);

module.exports = router;
