// server/src/services/superadmin.service.js

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

/* ======================================================
   INSTITUCIONES — CRUD GLOBAL
====================================================== */

async function listAllInstitutions({ isActive, search } = {}) {
  const where = {};

  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (search?.trim()) {
    where.name = { contains: search.trim(), mode: 'insensitive' };
  }

  return prisma.institution.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { users: true, courses: true },
      },
    },
  });
}

async function getInstitutionById(id) {
  const institution = await prisma.institution.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { users: true, courses: true },
      },
    },
  });

  if (!institution) {
    const err = new Error('Institución no encontrada');
    err.statusCode = 404;
    throw err;
  }

  return institution;
}

async function createInstitution({ name }) {
  if (!name?.trim()) {
    const err = new Error('El nombre es obligatorio');
    err.statusCode = 400;
    throw err;
  }

  const duplicate = await prisma.institution.findFirst({
    where: { name: { equals: name.trim(), mode: 'insensitive' } },
  });

  if (duplicate) {
    const err = new Error('Ya existe una institución con ese nombre');
    err.statusCode = 409;
    throw err;
  }

  return prisma.institution.create({
    data: { name: name.trim() },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
    },
  });
}

async function updateInstitution(id, { name, isActive }) {
  const institution = await prisma.institution.findUnique({ where: { id } });

  if (!institution) {
    const err = new Error('Institución no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const data = {};

  if (typeof name === 'string' && name.trim()) {
    const duplicate = await prisma.institution.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' }, NOT: { id } },
    });
    if (duplicate) {
      const err = new Error('Ya existe una institución con ese nombre');
      err.statusCode = 409;
      throw err;
    }
    data.name = name.trim();
  }

  if (typeof isActive === 'boolean') data.isActive = isActive;

  return prisma.institution.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/* ======================================================
   USUARIOS — CRUD GLOBAL
====================================================== */

async function listAllUsers({
  page = 1,
  pageSize = 20,
  role,
  isActive,
  search,
  institutionId,
  sort = 'createdAt',
  order = 'desc',
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const safeOrder = order === 'asc' ? 'asc' : 'desc';
  const allowedSort = new Set(['createdAt', 'email', 'firstName', 'lastName', 'role']);
  const safeSort = allowedSort.has(sort) ? sort : 'createdAt';

  const where = {};
  if (role) where.role = role;
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (institutionId) where.institutionId = institutionId;
  if (search?.trim()) {
    where.OR = [
      { email: { contains: search.trim(), mode: 'insensitive' } },
      { firstName: { contains: search.trim(), mode: 'insensitive' } },
      { lastName: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { [safeSort]: safeOrder },
      skip: (safePage - 1) * safeSize,
      take: safeSize,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        pendingApproval: true,
        institutionId: true,
        createdAt: true,
        institution: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  return {
    items,
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeSize)),
  };
}

/* ======================================================
   ASIGNAR ADMIN A INSTITUCIÓN
   - Crea o convierte un usuario existente en ADMIN
   - Lo asigna a la institución indicada
====================================================== */

async function assignAdmin({ userId, institutionId }) {
  const [user, institution] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.institution.findUnique({ where: { id: institutionId } }),
  ]);

  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  if (!institution) {
    const err = new Error('Institución no encontrada');
    err.statusCode = 404;
    throw err;
  }

  if (user.role === 'SUPERADMIN') {
    const err = new Error('No se puede reasignar un superadmin');
    err.statusCode = 400;
    throw err;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      role: 'ADMIN',
      isActive: true,
      pendingApproval: false,
      institutionId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      institutionId: true,
      institution: { select: { id: true, name: true } },
    },
  });
}

/* ======================================================
   CREAR USUARIO GLOBAL (desde superadmin)
   - Puede crear cualquier rol incluyendo ADMIN
   - Puede asignar institución directamente
====================================================== */

async function createUserGlobal({
  email,
  password,
  firstName,
  lastName,
  role,
  institutionId,
}) {
  if (!email || !password || !role) {
    const err = new Error('email, password y role son obligatorios');
    err.statusCode = 400;
    throw err;
  }

  const validRoles = ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT'];
  if (!validRoles.includes(role)) {
    const err = new Error(`Rol inválido. Valores: ${validRoles.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  if (institutionId) {
    const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution) {
      const err = new Error('Institución no encontrada');
      err.statusCode = 404;
      throw err;
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Ya existe un usuario con ese correo');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      role,
      isActive: true,
      pendingApproval: false,
      institutionId: institutionId || null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      institutionId: true,
      createdAt: true,
    },
  });
}

/* ======================================================
   ACTUALIZAR USUARIO GLOBAL
====================================================== */

async function updateUserGlobal(userId, { firstName, lastName, role, isActive, institutionId }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  const data = {};
  if (typeof firstName === 'string') data.firstName = firstName;
  if (typeof lastName === 'string') data.lastName = lastName;
  if (typeof isActive === 'boolean') data.isActive = isActive;

  if (role) {
    const validRoles = ['ADMIN', 'TEACHER', 'STUDENT'];
    // No se puede promover a SUPERADMIN desde este endpoint
    if (!validRoles.includes(role)) {
      const err = new Error('Rol inválido');
      err.statusCode = 400;
      throw err;
    }
    data.role = role;
  }

  if (institutionId !== undefined) {
    if (institutionId !== null) {
      const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
      if (!institution) {
        const err = new Error('Institución no encontrada');
        err.statusCode = 404;
        throw err;
      }
    }
    data.institutionId = institutionId;
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      institutionId: true,
      institution: { select: { id: true, name: true } },
      createdAt: true,
    },
  });
}

module.exports = {
  listAllInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  listAllUsers,
  assignAdmin,
  createUserGlobal,
  updateUserGlobal,
};