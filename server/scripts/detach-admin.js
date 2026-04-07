// server/prisma/detach-admin.js
// Desasocia al admin de cualquier institución, dejándolo como admin global.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@lab2hand.com'; // cambia si es necesario

async function main() {
  const user = await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { institutionId: null },
    select: { id: true, email: true, role: true, institutionId: true },
  });
  console.log('✅ Admin desasociado:', user);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());