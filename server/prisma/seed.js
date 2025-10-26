// Seed de menú inicial: Experimentos y Escenarios para Lab2hand

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const experiments = [
  {
    slug: 'bernoulli',
    name: 'Bernoulli',
    description: 'Flujo de fluido con variación de presión y velocidad.',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    order: 1,
    scenarios: [
      { slug: 'sin_tapa', name: 'Sin tapa', order: 1 },
      { slug: 'con_tapa', name: 'Con tapa', order: 2 },
    ],
  },
  {
    slug: 'spring',
    name: 'Spring',
    description: 'Resorte: caso estático y movimiento armónico simple (MAS).',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    order: 2,
    scenarios: [
      { slug: 'estatico', name: 'Estático', order: 1 },
      { slug: 'mas', name: 'Movimiento Armónico Simple (MAS)', order: 2 },
    ],
  },
];

async function upsertExperiment(exp) {
  // Crear/actualizar el experimento
  const base = await prisma.experiment.upsert({
    where: { slug: exp.slug },
    update: {
      name: exp.name,
      description: exp.description,
      visibility: exp.visibility,
      status: exp.status,
      order: exp.order,
    },
    create: {
      slug: exp.slug,
      name: exp.name,
      description: exp.description,
      visibility: exp.visibility,
      status: exp.status,
      order: exp.order,
    },
  });

  // Mapear escenarios existentes por slug
  const existing = await prisma.scenario.findMany({
    where: { experimentId: base.id },
  });
  const existingMap = new Map(existing.map(s => [s.slug, s]));

  // Upsert de escenarios
  for (const s of exp.scenarios) {
    if (existingMap.has(s.slug)) {
      await prisma.scenario.update({
        where: { id: existingMap.get(s.slug).id },
        data: { name: s.name, order: s.order },
      });
    } else {
      await prisma.scenario.create({
        data: {
          experimentId: base.id,
          slug: s.slug,
          name: s.name,
          order: s.order,
        },
      });
    }
  }
}

async function main() {
  for (const exp of experiments) {
    await upsertExperiment(exp);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
