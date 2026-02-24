// server/src/routes/superadmin.routes.js

const { Router } = require('express');
const { requireAuth, requireSuperAdmin } = require('../middlewares/auth');
const {
  getInstitutions,
  getInstitution,
  postInstitution,
  patchInstitution,
  getUsers,
  postUser,
  patchUser,
  postAssignAdmin,
} = require('../controllers/superadmin.controller');

const router = Router();

// Todas las rutas bajo /api/superadmin requieren SUPERADMIN
router.use(requireAuth, requireSuperAdmin);

// ─── Instituciones ────────────────────────────────────────────────────────
router.get('/institutions',       getInstitutions);
router.get('/institutions/:id',   getInstitution);
router.post('/institutions',      postInstitution);
router.patch('/institutions/:id', patchInstitution);

// ─── Usuarios globales ────────────────────────────────────────────────────
router.get('/users',       getUsers);
router.post('/users',      postUser);
router.patch('/users/:id', patchUser);

// ─── Asignar admin a institución ─────────────────────────────────────────
router.post('/assign-admin', postAssignAdmin);

module.exports = router;