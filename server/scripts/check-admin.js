// prisma/check-admin.js
// Verifica si existe al menos un usuario ADMIN activo

const prisma = require('../src/config/prisma');

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      isActive: true,
      pendingApproval: false,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      pendingApproval: true,
      institutionId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('=== ADMINS ACTIVOS ===');
  if (!admins.length) {
    console.log('No hay ADMIN activo.');
    process.exitCode = 1;
    return;
  }

  console.table(admins);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
