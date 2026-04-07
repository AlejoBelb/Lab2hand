const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const KEEP_EMAIL = 'admin@lab2hand.com'; // cambia por el email real

async function main() {
  // Obtener IDs de los usuarios a eliminar
  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: { id: true },
  });
  const ids = usersToDelete.map(u => u.id);
  console.log(`Usuarios a eliminar: ${ids.length}`);

  // 1. Refresh tokens
  const rt = await prisma.refreshToken.deleteMany({ where: { userId: { in: ids } } });
  console.log(`RefreshTokens eliminados: ${rt.count}`);

  // 2. Relaciones de cursos
  const ct = await prisma.courseTeacher.deleteMany({ where: { teacherId: { in: ids } } });
  console.log(`CourseTeacher eliminados: ${ct.count}`);

  const cs = await prisma.courseStudent.deleteMany({ where: { studentId: { in: ids } } });
  console.log(`CourseStudent eliminados: ${cs.count}`);

  // 3. Guías creadas por esos usuarios
  const g = await prisma.guide.deleteMany({ where: { createdById: { in: ids } } });
  console.log(`Guides eliminadas: ${g.count}`);

  // 4. Finalmente los usuarios
  const users = await prisma.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`Usuarios eliminados: ${users.count}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());