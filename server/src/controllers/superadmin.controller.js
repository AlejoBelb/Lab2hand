// server/src/controllers/superadmin.controller.js

const {
  listAllInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  listAllUsers,
  assignAdmin,
  createUserGlobal,
  updateUserGlobal,
} = require('../services/superadmin.service');

function parseBoolean(val) {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return undefined;
}

// ─── INSTITUCIONES ────────────────────────────────────────────────────────

async function getInstitutions(req, res, next) {
  try {
    const { isActive, search } = req.query;
    const institutions = await listAllInstitutions({
      isActive: parseBoolean(isActive),
      search,
    });
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
    const { name } = req.body;
    const institution = await createInstitution({ name });
    return res.status(201).json({ institution });
  } catch (err) { next(err); }
}

async function patchInstitution(req, res, next) {
  try {
    const { name, isActive } = req.body;
    const institution = await updateInstitution(req.params.id, {
      name,
      isActive: parseBoolean(isActive),
    });
    return res.json({ institution });
  } catch (err) { next(err); }
}

// ─── USUARIOS ─────────────────────────────────────────────────────────────

async function getUsers(req, res, next) {
  try {
    const { page, pageSize, role, isActive, search, institutionId, sort, order } = req.query;
    const result = await listAllUsers({
      page, pageSize, role,
      isActive: parseBoolean(isActive),
      search, institutionId, sort, order,
    });
    return res.json(result);
  } catch (err) { next(err); }
}

async function postUser(req, res, next) {
  try {
    const { email, password, firstName, lastName, role, institutionId } = req.body;
    const user = await createUserGlobal({
      email, password, firstName, lastName, role, institutionId,
    });
    return res.status(201).json({ user });
  } catch (err) { next(err); }
}

async function patchUser(req, res, next) {
  try {
    const { firstName, lastName, role, isActive, institutionId } = req.body;
    const user = await updateUserGlobal(req.params.id, {
      firstName, lastName, role,
      isActive: parseBoolean(isActive),
      institutionId,
    });
    return res.json({ user });
  } catch (err) { next(err); }
}

// ─── ASIGNAR ADMIN ────────────────────────────────────────────────────────

async function postAssignAdmin(req, res, next) {
  try {
    const { userId, institutionId } = req.body;

    if (!userId || !institutionId) {
      return res.status(400).json({ message: 'userId e institutionId son obligatorios' });
    }

    const user = await assignAdmin({ userId, institutionId });
    return res.json({ message: 'Admin asignado correctamente', user });
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
  postAssignAdmin,
};