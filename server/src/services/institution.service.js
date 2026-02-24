// server/src/services/institution.service.js

const prisma = require('../config/prisma');

/* ======================================================
   LISTAR INSTITUCIONES
   - Filtradas por isActive (opcional)
   - Solo las de la institución del admin que consulta
====================================================== */
async function listInstitutions({ adminInstitutionId, isActive, search } = {}) {
  const where = {
    id: adminInstitutionId, // admin solo ve su institución
  };

  // isActive puede ser true/false explícito
  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (search && search.trim()) {
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
        select: {
          users: true,
          courses: true,
        },
      },
    },
  });
}

/* ======================================================
   OBTENER INSTITUCIÓN POR ID
====================================================== */
async function getInstitutionById(id) {
  return prisma.institution.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: true,
          courses: true,
        },
      },
    },
  });
}

/* ======================================================
   CREAR INSTITUCIÓN
   - Solo puede hacerlo un superadmin (no implementado aún)
   - Por ahora disponible vía seed o script
====================================================== */
async function createInstitution({ name }) {
  if (!name || !name.trim()) {
    const err = new Error('El nombre de la institución es obligatorio');
    err.statusCode = 400;
    throw err;
  }

  const existing = await prisma.institution.findFirst({
    where: { name: { equals: name.trim(), mode: 'insensitive' } },
  });

  if (existing) {
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

/* ======================================================
   ACTUALIZAR INSTITUCIÓN
   - Permite cambiar nombre e isActive
   - Validar que pertenece al admin que opera
====================================================== */
async function updateInstitution(id, { name, isActive, adminInstitutionId }) {
  // Seguridad: el admin solo puede editar su propia institución
  if (id !== adminInstitutionId) {
    const err = new Error('No tienes permiso para modificar esta institución');
    err.statusCode = 403;
    throw err;
  }

  const institution = await prisma.institution.findUnique({ where: { id } });

  if (!institution) {
    const err = new Error('Institución no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const data = {};
  if (typeof name === 'string' && name.trim()) {
    // Verificar duplicado de nombre (excluyendo la actual)
    const duplicate = await prisma.institution.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        NOT: { id },
      },
    });
    if (duplicate) {
      const err = new Error('Ya existe una institución con ese nombre');
      err.statusCode = 409;
      throw err;
    }
    data.name = name.trim();
  }

  if (typeof isActive === 'boolean') {
    data.isActive = isActive;
  }

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

module.exports = {
  listInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
};