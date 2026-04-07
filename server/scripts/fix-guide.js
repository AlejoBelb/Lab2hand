const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const exp = await prisma.experiment.findUnique({ where: { slug: 'spring' } });

  if (!exp) { console.log('Experimento no encontrado'); return; }
  if (!admin) { console.log('Admin no encontrado'); return; }

  const guide = await prisma.guide.create({
    data: {
      title: 'Guía de laboratorio — Resorte estático',
      fileUrl: '/guides/guia-resorte-estatico.pdf',
      status: 'PUBLISHED',
      experimentId: exp.id,
      createdById: admin.id,
    },
  });

  console.log('Guía creada:', guide.id, guide.fileUrl);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());