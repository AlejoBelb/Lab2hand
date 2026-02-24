// server/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── CONFIG ───────────────────────────────────────────────────────────────

const SUPERADMIN_EMAIL    = process.env.SEED_SUPERADMIN_EMAIL    || 'superadmin@lab2hand.com';
const SUPERADMIN_PASSWORD = process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin1234!';

// ─── EXPERIMENTOS ─────────────────────────────────────────────────────────

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
    name: 'Resorte estático',
    description: 'Ley de Hooke: deformación de un resorte en reposo.',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    order: 2,
    scenarios: [
      { slug: 'estatico', name: 'Estático', order: 1 },
    ],
  },
  {
    slug: 'mas',
    name: 'Movimiento Armónico Simple',
    description: 'Oscilación de un resorte: periodo, frecuencia y amplitud.',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    order: 3,
    scenarios: [
      { slug: 'mas', name: 'MAS', order: 1 },
    ],
  },
];

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

  const existing = await prisma.scenario.findMany({ where: { experimentId: base.id } });
  const existingMap = new Map(existing.map(s => [s.slug, s]));

  for (const s of exp.scenarios) {
    if (existingMap.has(s.slug)) {
      await prisma.scenario.update({
        where: { id: existingMap.get(s.slug).id },
        data: { name: s.name, order: s.order },
      });
    } else {
      await prisma.scenario.create({
        data: { experimentId: base.id, slug: s.slug, name: s.name, order: s.order },
      });
    }
  }

  console.log(`  ✅ Experimento: ${exp.name}`);
}

// ─── SUPERADMIN ───────────────────────────────────────────────────────────

async function upsertSuperAdmin() {
  const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: SUPERADMIN_EMAIL },
    update: {
      role: 'SUPERADMIN',
      isActive: true,
      institutionId: null,
    },
    create: {
      email: SUPERADMIN_EMAIL,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPERADMIN',
      isActive: true,
      pendingApproval: false,
      institutionId: null,
    },
  });

  console.log(`  ✅ Superadmin: ${user.email}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Ejecutando seed...\n');

  console.log('📦 Experimentos:');
  for (const exp of experiments) {
    await upsertExperiment(exp);
  }

  console.log('\n👤 Usuarios del sistema:');
  await upsertSuperAdmin();

  console.log('\n✅ Seed completado.');
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });