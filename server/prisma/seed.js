// server/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    || 'admin@lab2hand.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin1234!';

// ─── EXPERIMENTOS ─────────────────────────────────────────────────────────────
// fileUrl: ruta pública al PDF dentro del servidor (server/public/guides/)
// Coloca los PDFs en server/public/guides/ con los nombres indicados.

const experiments = [
  {
    slug: 'bernoulli',
    name: 'Bernoulli',
    description: 'Flujo de fluido con variación de presión y velocidad.',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    order: 1,
    guideTitle: 'Guía de laboratorio — Bernoulli',
    guideFile: '/guides/guia-bernoulli.pdf',
  },
  {
    slug: 'spring',
    name: 'Resorte estático',
    description: 'Ley de Hooke: deformación de un resorte en reposo.',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    order: 2,
    guideTitle: 'Guía de laboratorio — Resorte estático',
    guideFile: '/guides/guia-resorte-estatico.pdf',
  },
  {
    slug: 'mas',
    name: 'Movimiento Armónico Simple',
    description: 'Oscilación de un resorte: periodo, frecuencia y amplitud.',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    order: 3,
    guideTitle: 'Guía de laboratorio — MAS',
    guideFile: '/guides/guia-mas.pdf',
  },
];

// ─── UPSERT EXPERIMENTO + GUÍA ────────────────────────────────────────────────

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

  // Upsert guía del experimento (una por experimento, sin curso ni docente)
  const existingGuide = await prisma.guide.findFirst({
    where: { experimentId: base.id, courseId: null },
  });

  if (!existingGuide) {
    // Necesitamos un createdById válido — usamos el admin del sistema
    // Se resuelve después de crear el admin; por eso se llama desde main()
    base._guideData = {
      title: exp.guideTitle,
      fileUrl: exp.guideFile,
      experimentId: base.id,
      status: 'PUBLISHED',
    };
  }

  console.log(`  ✅ Experimento: ${exp.name}`);
  return base;
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

async function upsertAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: 'ADMIN',
      isActive: true,
      pendingApproval: false,
      institutionId: null,
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      firstName: 'Admin',
      lastName: 'Lab2Hand',
      role: 'ADMIN',
      isActive: true,
      pendingApproval: false,
      institutionId: null,
    },
  });

  console.log(`  ✅ Admin: ${user.email}`);
  return user;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Ejecutando seed...\n');

  console.log('📦 Experimentos:');
  const upsertedExperiments = [];
  for (const exp of experiments) {
    const result = await upsertExperiment(exp);
    upsertedExperiments.push(result);
  }

  console.log('\n👤 Usuarios del sistema:');
  const admin = await upsertAdmin();

  // Crear guías faltantes usando el admin como creador
  console.log('\n📄 Guías de experimentos:');
  for (const exp of upsertedExperiments) {
    if (exp._guideData) {
      await prisma.guide.create({
        data: {
          ...exp._guideData,
          createdById: admin.id,
        },
      });
      console.log(`  ✅ Guía creada: ${exp._guideData.title}`);
    } else {
      console.log(`  ⏭️  Guía ya existe: ${exp.name}`);
    }
  }

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