// server/src/services/menu.service.js
// Servicio de menú: consulta ligera de experimentos públicos/activos

const prisma = require('../config/prisma');

async function getMenu() {
  // Chequeo rápido de DB para descartar problemas de conexión
  const ping = await prisma.$queryRaw`SELECT 1 AS ok`;

  // Traer los experimentos públicos/activos
  const experiments = await prisma.experiment.findMany({
    where: {
      visibility: 'PUBLIC',
      status: { in: ['ACTIVE', 'PUBLISHED'] },
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      order: true,
    },
  });

  if (!experiments.length) return [];

  // Formatear DTO
  const dto = experiments.map(exp => ({
    name: exp.name,
    slug: exp.slug,
    description: exp.description || null,
    order: exp.order,
  }));

  return dto;
}

module.exports = { getMenu };