// Seed inicial de Lab2hand
// - Experimentos y escenarios
// - Usuario ADMIN del sistema

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/* ======================================================
   CONFIG ADMIN
====================================================== */

const ADMIN_EMAIL = 'admin@lab2hand.com';
const ADMIN_PASSWORD = 'Admin1234!';

/* ======================================================
   DATA: EXPERIMENTOS
====================================================== */

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

/* ======================================================
   UPSERT EXPERIMENTOS + ESCENARIOS
====================================================== */

async function upsertExperiment(exp) {
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

  const existing = await prisma.scenario.findMany({
    where: { experimentId: base.id },
  });

  const existingMap = new Map(existing.map(s => [s.slug, s]));

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

/* ======================================================
   UPSERT ADMIN
====================================================== */

async function upsertAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      firstName: 'Admin',
      lastName: 'Lab2hand',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin asegurado:', ADMIN_EMAIL);
}

/* ======================================================
   MAIN
====================================================== */

async function main() {
  console.log('🌱 Ejecutando seed...');

  for (const exp of experiments) {
    await upsertExperiment(exp);
  }

  await upsertAdmin();

  console.log('✅ Seed completado');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
