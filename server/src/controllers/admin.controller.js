// server/src/controllers/admin.controller.js

const {
  listPendingTeachers,
  approveTeacher,
  approveUser,
  listUsers,
  createUserByAdmin,
  updateUserByAdmin,
} = require('../services/admin.service');


// ─── INSTITUCIONES ────────────────────────────────────────────────────────────

const {
  listAllInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
} = require('../services/global.service');

function parseBoolean(val) {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return undefined;
}

async function getInstitutions(req, res, next) {
  try {
    const { isActive, search } = req.query;
    const institutions = await listAllInstitutions({ isActive: parseBoolean(isActive), search });
    return res.json({ institutions });
  } catch (err) { next(err); }
}

async function getInstitution(req, res, next) {
  try {
    const institution = await getInstitutionById(req.params.id);
    return res.json({ institution });
  } catch (err) { next(err); }
}

async function postInstitution(req, res, next) {
  try {
    const institution = await createInstitution({ name: req.body.name });
    return res.status(201).json({ institution });
  } catch (err) { next(err); }
}

async function patchInstitution(req, res, next) {
  try {
    const { name, isActive } = req.body;
    const institution = await updateInstitution(req.params.id, {
      name, isActive: parseBoolean(isActive),
    });
    return res.json({ institution });
  } catch (err) { next(err); }
}

// ─── USUARIOS DE LA INSTITUCIÓN ───────────────────────────────────────────────

async function getUsers(req, res, next) {
  try {
    const { page, pageSize, role, isActive, search, sort, order, institutionId } = req.query;
    const result = await listUsers({
      adminInstitutionId: institutionId || undefined,
      page, pageSize, role,
      isActive: parseBoolean(isActive),
      search, sort, order,
    });
    return res.json(result);
  } catch (err) { next(err); }
}

async function postUser(req, res, next) {
  try {
    const { email, password, firstName, lastName, role, institutionId } = req.body;
    const user = await createUserByAdmin({
      email, password, firstName, lastName, role, institutionId,
    });
    return res.status(201).json({ user });
  } catch (err) { next(err); }
}

async function patchUser(req, res, next) {
  try {
    const { firstName, lastName, role, isActive } = req.body;
    const parsedIsActive = parseBoolean(isActive);

    // Un admin no puede desactivarse a sí mismo
    if (req.params.id === req.user.id && parsedIsActive === false) {
      return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta' });
    }

    const user = await updateUserByAdmin(req.params.id, {
      firstName, lastName, role,
      isActive: parsedIsActive,
      requesterId: req.user.id,
    });
    return res.json({ user });
  } catch (err) { next(err); }
}

// ─── APROBACIÓN DE USUARIOS ───────────────────────────────────────────────────

/* POST /api/admin/users/:userId/approve
   Body: { role: 'ADMIN' | 'TEACHER' | 'STUDENT' }
*/
async function approveUserController(req, res, next) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'El rol es obligatorio (ADMIN, TEACHER o STUDENT)' });
    }

    const user = await approveUser({ userId, approvedRole: role });
    return res.json({ message: 'Usuario aprobado correctamente', user });
  } catch (err) {
    next(err);
  }
}

// ─── USUARIOS PENDIENTES ──────────────────────────────────────────────────────

/* GET /api/admin/pending-users */
async function getPendingUsers(req, res, next) {
  try {
    const users = await listPendingTeachers();
    return res.json({ users });
  } catch (err) { next(err); }
}

// Legacy — se mantiene por compatibilidad
async function getPendingTeachers(req, res, next) {
  return getPendingUsers(req, res, next);
}

async function approveTeacherController(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId es obligatorio' });
    }
    const user = await approveTeacher({ userId });
    return res.json({ message: 'Usuario aprobado correctamente', user });
  } catch (err) { next(err); }
}

module.exports = {
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
};
