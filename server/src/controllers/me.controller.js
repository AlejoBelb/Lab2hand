// server/src/controllers/me.controller.js

// Cliente de Prisma generado en server/src/generated/prisma
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// GET /api/me -> devuelve el perfil del usuario autenticado
// Requiere que requireAuth haya puesto req.user = { id, role }
async function me(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('[me.controller] Error:', err);
    return res.status(500).json({ error: 'ServerError' });
  }
}

module.exports = { me };
