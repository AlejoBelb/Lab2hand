// server/src/services/users.service.js

const prisma = require('../config/prisma');

// Normaliza parámetros de paginación y orden
function parsePaginationAndSort({ page = 1, pageSize = 20, sort = 'createdAt', order = 'desc' }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const safeOrder = (order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  const allowedSort = new Set(['createdAt', 'email', 'firstName', 'lastName', 'role']);
  const safeSort = allowedSort.has(sort) ? sort : 'createdAt';
  return { page: safePage, pageSize: safePageSize, sort: safeSort, order: safeOrder };
}

// Construye cláusula where para filtros
function buildWhere({ role, isActive, search }) {
  const where = {};
  if (role) where.role = role;
  if (typeof isActive === 'boolean') where.isActive = isActive;
  if (search && search.trim().length > 0) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ];
  }
  return where;
}

// Lista usuarios con filtros y paginación
async function listUsers(params = {}) {
  const { page, pageSize, sort, order } = parsePaginationAndSort(params);
  const where = buildWhere(params);

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { items, page, pageSize, total, totalPages, sort, order };
}

// Obtiene un usuario por id
async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return user;
}

// Actualiza campos permitidos de un usuario
async function updateUser(id, data = {}) {
  const { firstName, lastName, role, isActive } = data;

  const user = await prisma.user.update({
    where: { id },
    data: {
      firstName: typeof firstName !== 'undefined' ? firstName : undefined,
      lastName: typeof lastName !== 'undefined' ? lastName : undefined,
      role: typeof role !== 'undefined' ? role : undefined,
      isActive: typeof isActive !== 'undefined' ? isActive : undefined
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return user;
}

module.exports = {
  listUsers,
  getUserById,
  updateUser
};
