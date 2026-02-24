// server/src/services/admin.service.js

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

/* ======================================================
   LISTAR DOCENTES PENDIENTES DE APROBACIÓN
   - pendingApproval = true
   - isActive = false
   - Filtrados por institución del admin
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
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

/* ======================================================
   APROBAR DOCENTE
   - Cambia role → TEACHER
   - Activa la cuenta
   - Asigna institución del admin que aprueba
====================================================== */
async function approveTeacher({ userId, adminInstitutionId }) {
  const institution = await prisma.institution.findUnique({
    where: { id: adminInstitutionId },
  });

  if (!institution) {
    const err = new Error('Institución no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  if (!user.pendingApproval || user.isActive) {
    const err = new Error('El usuario no está pendiente de aprobación');
    err.statusCode = 400;
    throw err;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      role: 'TEACHER',
      isActive: true,
      pendingApproval: false,
      institutionId: adminInstitutionId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      institutionId: true,
    },
  });
}

/* ======================================================
   LISTAR USUARIOS DE LA INSTITUCIÓN DEL ADMIN
   - Con filtros de rol, estado, búsqueda y paginación
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
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const safeOrder = order === 'asc' ? 'asc' : 'desc';
  const allowedSort = new Set(['createdAt', 'email', 'firstName', 'lastName', 'role']);
  const safeSort = allowedSort.has(sort) ? sort : 'createdAt';

  const where = {
    institutionId: adminInstitutionId,
  };

  if (role) where.role = role;
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (search && search.trim()) {
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
   - El admin crea usuarios activos directamente
   - Sin flujo de aprobación
   - Se asigna automáticamente a la institución del admin
====================================================== */
async function createUserByAdmin({
  adminInstitutionId,
  email,
  password,
  firstName,
  lastName,
  role,
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
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      role,
      isActive: true,
      pendingApproval: false,
      institutionId: adminInstitutionId,
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
   ACTUALIZAR USUARIO (desde panel admin)
   - Permite cambiar nombre, rol, estado
   - Valida que el usuario pertenezca a la institución del admin
====================================================== */
async function updateUserByAdmin(userId, { adminInstitutionId, firstName, lastName, role, isActive }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const err = new Error('Usuario no encontrado');
    err.statusCode = 404;
    throw err;
  }

  // El admin solo puede modificar usuarios de su institución
  if (user.institutionId !== adminInstitutionId) {
    const err = new Error('No tienes permiso para modificar este usuario');
    err.statusCode = 403;
    throw err;
  }

  const data = {};
  if (typeof firstName === 'string') data.firstName = firstName;
  if (typeof lastName === 'string') data.lastName = lastName;
  if (typeof isActive === 'boolean') {
    data.isActive = isActive;
    // Si se desactiva, revocar tokens pendientes sería ideal,
    // pero por ahora solo marcamos el estado
  }
  if (role) {
    const validRoles = ['TEACHER', 'STUDENT', 'ADMIN'];
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
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      pendingApproval: true,
      institutionId: true,
      createdAt: true,
    },
  });
}

module.exports = {
  listPendingTeachers,
  approveTeacher,
  listUsers,
  createUserByAdmin,
  updateUserByAdmin,
};