// server/src/services/admin.service.js

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

/* ======================================================
   LISTAR USUARIOS PENDIENTES DE APROBACIÓN
====================================================== */
async function listPendingTeachers({ adminInstitutionId } = {}) {
  return prisma.user.findMany({
    where: {
      pendingApproval: true,
      isActive: false,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      requestedRole: true,
      institutionId: true,
      institution: { select: { id: true, name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

/* ======================================================
   APROBAR USUARIO
   - El admin elige el rol definitivo al aprobar
   - Roles permitidos: ADMIN, TEACHER, STUDENT
====================================================== */
async function approveUser({ userId, adminInstitutionId, approvedRole }) {
  const validRoles = ['ADMIN', 'TEACHER', 'STUDENT'];
  if (!validRoles.includes(approvedRole)) {
    const err = new Error('Rol inválido. Solo se permite ADMIN, TEACHER o STUDENT');
    err.statusCode = 400;
    throw err;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      pendingApproval: true,
    },
  });

  if (!user) {
    const err = new Error('Usuario no encontrado o no está pendiente de aprobación');
    err.statusCode = 404;
    throw err;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      role: approvedRole,
      isActive: true,
      pendingApproval: false,
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, isActive: true, pendingApproval: true, institutionId: true,
    },
  });
}

/* ======================================================
   APROBAR DOCENTE (legacy)
====================================================== */
async function approveTeacher({ userId }) {
  return approveUser({ userId, approvedRole: 'TEACHER' });
}

/* ======================================================
   LISTAR USUARIOS DE LA INSTITUCIÓN DEL ADMIN
====================================================== */
async function listUsers({
  adminInstitutionId,
  page = 1,
  pageSize = 20,
  role,
  isActive,
  search,
  sort = 'createdAt',
  order = 'desc',
} = {}) {
  const safePage  = Math.max(1, Number(page) || 1);
  const safeSize  = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const safeOrder = order === 'asc' ? 'asc' : 'desc';
  const allowedSort = new Set(['createdAt', 'email', 'firstName', 'lastName', 'role']);
  const safeSort  = allowedSort.has(sort) ? sort : 'createdAt';

  const where = {};
  if (adminInstitutionId) where.institutionId = adminInstitutionId;

  if (role) where.role = role;
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (search && search.trim()) {
    where.OR = [
      { email:     { contains: search.trim(), mode: 'insensitive' } },
      { firstName: { contains: search.trim(), mode: 'insensitive' } },
      { lastName:  { contains: search.trim(), mode: 'insensitive' } },
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
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, pendingApproval: true,
        institutionId: true, createdAt: true,
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
   CREAR USUARIO DESDE EL PANEL ADMIN
====================================================== */
async function createUserByAdmin({
  email, password, firstName, lastName, role, institutionId,
}) {
  if (!email || !password || !role) {
    const err = new Error('email, password y role son obligatorios');
    err.statusCode = 400;
    throw err;
  }

  const validRoles = ['TEACHER', 'STUDENT'];
  if (!validRoles.includes(role)) {
    const err = new Error(`Rol inválido. Valores permitidos: ${validRoles.join(', ')}`);
    err.statusCode = 400;
    throw err;
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
      email, passwordHash,
      firstName: firstName || null,
      lastName:  lastName  || null,
      role,
      isActive: true,
      pendingApproval: false,
      institutionId: institutionId || null,
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, isActive: true, institutionId: true, createdAt: true,
    },
  });
}

/* ======================================================
   ACTUALIZAR USUARIO (desde panel admin)
====================================================== */
async function updateUserByAdmin(userId, { firstName, lastName, role, isActive, requesterId } = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  // Un admin no puede desactivarse a sí mismo
  if (requesterId && requesterId === userId && isActive === false) {
    const err = new Error('No puedes desactivar tu propia cuenta');
    err.statusCode = 400;
    throw err;
  }

  const data = {};
  if (typeof firstName === 'string') data.firstName = firstName;
  if (typeof lastName  === 'string') data.lastName  = lastName;
  if (typeof isActive  === 'boolean') {
    data.isActive = isActive;
    // Al activar manualmente también se limpia la bandera de pendiente
    if (isActive === true) data.pendingApproval = false;
  }
  if (role) {
    const validRoles = ['ADMIN', 'TEACHER', 'STUDENT'];
    if (!validRoles.includes(role)) {
      const err = new Error('Rol inválido');
      err.statusCode = 400;
      throw err;
    }
    data.role = role;
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, isActive: true, pendingApproval: true,
      institutionId: true, createdAt: true,
    },
  });
}

module.exports = {
  listPendingTeachers,
  approveTeacher,
  approveUser,
  listUsers,
  createUserByAdmin,
  updateUserByAdmin,
};
