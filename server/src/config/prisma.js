// server/src/config/prisma.js
// Prisma client con log explícito de modelos (DEBUG TEMPORAL)

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 🔍 DEBUG: mostrar modelos cargados por Prisma Client

process.on('SIGINT', async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  try {
    await prisma.$disconnect();
  } finally {
    process.exit(0);
  }
});

module.exports = prisma;
