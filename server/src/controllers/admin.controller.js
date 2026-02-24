// server/src/controllers/admin.controller.js

const {
  listPendingTeachers,
  approveTeacher,
  listUsers,
  createUserByAdmin,
  updateUserByAdmin,
  approveUser,
} = require('../services/admin.service');

const {
  listInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
} = require('../services/institution.service');

// ─── HELPERS ──────────────────────────────────────────────────────────────

function parseBoolean(val) {
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return undefined;
}

function getAdminInstitutionId(req) {
  return req.user?.institutionId || null;
}

// ─── INSTITUCIONES ────────────────────────────────────────────────────────

/* GET /api/admin/institutions */
async function getInstitutions(req, res, next) {
  try {
    const adminInstitutionId = getAdminInstitutionId(req);
    if (!adminInstitutionId) {
      return res.status(403).json({ message: 'Admin sin institución asignada' });
    }

    const { isActive, search } = req.query;
    const institutions = await listInstitutions({
      adminInstitutionId,
      isActive: parseBoolean(isActive),
      search,
    });

    return res.json({ institutions });
  } catch (err) {
    next(err);
  }
}

/* GET /api/admin/institutions/:id */
async function getInstitution(req, res, next) {
  try {
    const adminInstitutionId = getAdminInstitutionId(req);
    const { id } = req.params;

    if (id !== adminInstitutionId) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta institución' });
    }

    const institution = await getInstitutionById(id);
    if (!institution) {
      return res.status(404).json({ message: 'Institución no encontrada' });
    }

    return res.json({ institution });
  } catch (err) {
    next(err);
  }
}

/* POST /api/admin/institutions */
async function postInstitution(req, res, next) {
  try {
    const { name } = req.body;
    const institution = await createInstitution({ name });
    return res.status(201).json({ institution });
  } catch (err) {
    next(err);
  }
}

/* PATCH /api/admin/institutions/:id */
async function patchInstitution(req, res, next) {
  try {
    const adminInstitutionId = getAdminInstitutionId(req);
    const { id } = req.params;
    const { name, isActive } = req.body;

    const institution = await updateInstitution(id, {
      name,
      isActive: parseBoolean(isActive),
      adminInstitutionId,
    });

    return res.json({ institution });
  } catch (err) {
    next(err);
  }
}

// ─── USUARIOS ─────────────────────────────────────────────────────────────

/* GET /api/admin/users */
async function getUsers(req, res, next) {
  try {
    const adminInstitutionId = getAdminInstitutionId(req);
    if (!adminInstitutionId) {
      return res.status(403).json({ message: 'Admin sin institución asignada' });
    }

    const { page, pageSize, role, isActive, search, sort, order } = req.query;

    const result = await listUsers({
      adminInstitutionId,
      page,
      pageSize,
      role,
      isActive: parseBoolean(isActive),
      search,
      sort,
      order,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

/* POST /api/admin/users */
async function postUser(req, res, next) {
  try {
    const adminInstitutionId = getAdminInstitutionId(req);
    if (!adminInstitutionId) {
      return res.status(403).json({ message: 'Admin sin institución asignada' });
    }

    const { email, password, firstName, lastName, role } = req.body;

    const user = await createUserByAdmin({
      adminInstitutionId,
      email,
      password,
      firstName,
      lastName,
      role,
    });

    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

/* PATCH /api/admin/users/:id */
async function patchUser(req, res, next) {
  try {
    const adminInstitutionId = getAdminInstitutionId(req);
    if (!adminInstitutionId) {
      return res.status(403).json({ message: 'Admin sin institución asignada' });
    }

    const { id } = req.params;
    const { firstName, lastName, role, isActive } = req.body;

    const user = await updateUserByAdmin(id, {
      adminInstitutionId,
      firstName,
      lastName,
      role,
      isActive: parseBoolean(isActive),
    });

    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

/* POST /api/admin/users/:userId/approve */
async function approveUserController(req, res, next) {
  try {
    const adminInstitutionId = getAdminInstitutionId(req);
    if (!adminInstitutionId) {
      return res.status(403).json({ message: 'Admin sin institución asignada' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'El rol es obligatorio (STUDENT o TEACHER)' });
    }

    const user = await approveUser({ userId, adminInstitutionId, approvedRole: role });
    return res.json({ message: 'Usuario aprobado correctamente', user });
  } catch (err) {
    next(err);
  }
}

// ─── DOCENTES PENDIENTES ──────────────────────────────────────────────────

/* GET /api/admin/pending-teachers */
async function getPendingTeachers(req, res, next) {
  try {
    const adminInstitutionId = getAdminInstitutionId(req);
    const teachers = await listPendingTeachers({ adminInstitutionId });
    return res.json({ teachers });
  } catch (err) {
    next(err);
  }
}

/* POST /api/admin/approve-teacher */
async function approveTeacherController(req, res, next) {
  try {
    const adminInstitutionId = getAdminInstitutionId(req);
    if (!adminInstitutionId) {
      return res.status(403).json({ message: 'Admin sin institución asignada' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId es obligatorio' });
    }

    const user = await approveTeacher({ userId, adminInstitutionId });
    return res.json({ message: 'Docente aprobado correctamente', user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Instituciones
  getInstitutions,
  getInstitution,
  postInstitution,
  patchInstitution,
  // Usuarios
  getUsers,
  postUser,
  patchUser,
  approveUserController,
  // Docentes pendientes (legacy)
  getPendingTeachers,
  approveTeacherController,
};