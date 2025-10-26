// server/src/services/experiment.service.js

// Esta sección importa Prisma Client generado en src/generated/prisma
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Esta sección define constantes de validación referenciales
const ExperimentStatus = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const Visibility = ['PRIVATE', 'UNLISTED', 'PUBLIC'];
const Sortable = ['createdAt', 'updatedAt', 'title', 'status', 'visibility'];

// Esta función construye el objeto "where" dinámico para listados
function buildWhere({ status, visibility, search, ownerId }) {
  const where = {};
  if (status && ExperimentStatus.includes(status)) where.status = status;
  if (visibility && Visibility.includes(visibility)) where.visibility = visibility;
  if (ownerId) where.ownerId = ownerId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }
  return where;
}

// Esta función lista experimentos con filtros, paginación y ordenamiento
async function listExperiments({ page = 1, pageSize = 10, sort = 'createdAt', order = 'desc', status, visibility, search, ownerId }) {
  const take = Math.min(Math.max(pageSize, 1), 100);
  const skip = (Math.max(page, 1) - 1) * take;

  const where = buildWhere({ status, visibility, search, ownerId });

  const orderBy = Sortable.includes(sort)
    ? { [sort]: order === 'asc' ? 'asc' : 'desc' }
    : { createdAt: 'desc' };

  const [total, items] = await Promise.all([
    prisma.experiment.count({ where }),
    prisma.experiment.findMany({
      where,
      orderBy,
      take,
      skip,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        status: true,
        visibility: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    page,
    pageSize: take,
    total,
    items,
  };
}

// Esta función obtiene un experimento por su ID
async function getExperimentById(id) {
  const exp = await prisma.experiment.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      status: true,
      visibility: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });
  return exp;
}

// Esta función obtiene un experimento por su slug
async function getExperimentBySlug(slug) {
  const exp = await prisma.experiment.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      status: true,
      visibility: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });
  return exp;
}

// Esta función crea un experimento nuevo asegurando unicidad de slug
async function createExperiment({ title, slug, description = null, status = 'DRAFT', visibility = 'PRIVATE', ownerId }) {
  try {
    const created = await prisma.experiment.create({
      data: {
        title,
        slug,
        description,
        status,
        visibility,
        ownerId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        status: true,
        visibility: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return created;
  } catch (err) {
    if (err && err.code === 'P2002' && err.meta?.target?.includes('slug')) {
      const error = new Error('El slug ya está en uso');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

// Esta función actualiza un experimento; si cambia slug, valida unicidad
async function updateExperiment(id, { title, slug, description, status, visibility }) {
  try {
    const updated = await prisma.experiment.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(visibility !== undefined ? { visibility } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        status: true,
        visibility: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  } catch (err) {
    if (err && err.code === 'P2002' && err.meta?.target?.includes('slug')) {
      const error = new Error('El slug ya está en uso');
      error.statusCode = 409;
      throw error;
    }
    if (err && err.code === 'P2025') {
      const error = new Error('Experimento no encontrado');
      error.statusCode = 404;
      throw error;
    }
    throw err;
  }
}

// Esta función elimina un experimento por ID
async function deleteExperiment(id) {
  try {
    const deleted = await prisma.experiment.delete({
      where: { id },
      select: { id: true, slug: true },
    });
    return deleted;
  } catch (err) {
    if (err && err.code === 'P2025') {
      const error = new Error('Experimento no encontrado');
      error.statusCode = 404;
      throw error;
    }
    throw err;
  }
}

module.exports = {
  listExperiments,
  getExperimentById,
  getExperimentBySlug,
  createExperiment,
  updateExperiment,
  deleteExperiment,
};
