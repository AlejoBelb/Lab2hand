// server/src/services/experiment.service.js

const prisma = require('../config/prisma');

// ─── LISTAR EXPERIMENTOS ──────────────────────────────────────────────────────

async function listExperiments() {
  return prisma.experiment.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      visibility: true,
      status: true,
      order: true,
    },
  });
}

// ─── OBTENER EXPERIMENTO POR SLUG ─────────────────────────────────────────────

async function getExperimentBySlug(slug) {
  return prisma.experiment.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      visibility: true,
      status: true,
      order: true,
    },
  });
}

// ─── OBTENER GUÍA DE UN EXPERIMENTO ──────────────────────────────────────────

// Devuelve la guía precargada por seed (sin courseId, status PUBLISHED)
async function getGuideByExperimentSlug(slug) {
  const experiment = await prisma.experiment.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!experiment) return null;

  return prisma.guide.findFirst({
    where: {
      experimentId: experiment.id,
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      description: true,
      status: true,
      updatedAt: true,
    },
  });
}

module.exports = {
  listExperiments,
  getExperimentBySlug,
  getGuideByExperimentSlug,
};