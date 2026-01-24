// server/src/services/menu.service.js
// Servicio de menú: consulta ligera para evitar bloqueos en joins, y resuelve escenarios con consultas separadas

const prisma = require('../config/prisma');

async function getMenu() {
  // Chequeo rápido de DB para descartar problemas de conexión
  const ping = await prisma.$queryRaw`SELECT 1 AS ok`;

  // 1) Traer solo los experiments de forma ligera (sin include)
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

  // 2) Traer escenarios por lotes con una sola consulta usando IN
  const expIds = experiments.map(e => e.id);

  const scenarios = await prisma.scenario.findMany({
    where: { experimentId: { in: expIds } },
    orderBy: [{ experimentId: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    select: {
      experimentId: true,
      slug: true,
      name: true,
      order: true,
    },
  });

  // 3) Agrupar escenarios por experimento y formatear DTO
  const byExp = new Map();
  for (const s of scenarios) {
    if (!byExp.has(s.experimentId)) byExp.set(s.experimentId, []);
    byExp.get(s.experimentId).push({ slug: s.slug, name: s.name, order: s.order });
  }

  const dto = experiments.map(exp => ({
    name: exp.name,
    slug: exp.slug,
    description: exp.description || null,
    order: exp.order,
    scenarios: byExp.get(exp.id) || [],
  }));

  return dto;
}

module.exports = { getMenu };
