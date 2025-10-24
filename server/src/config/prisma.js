// server/src/config/prisma.js

const { PrismaClient } = require('@prisma/client');

let prisma;

// Patrón singleton para evitar múltiples instancias en hot-reload
if (!global.__lab2hand_prisma) {
  global.__lab2hand_prisma = new PrismaClient({
    // Configuración básica; agregar logs si se requiere
    // log: ['query', 'info', 'warn', 'error']
  });
}

prisma = global.__lab2hand_prisma;

// Hook opcional para cierre ordenado en SIGINT/SIGTERM en entornos no serverless
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
