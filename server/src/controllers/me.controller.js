// server/src/controllers/me.controller.js

const prisma = require('../config/prisma');

// GET /api/me -> perfil del usuario autenticado
async function me(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
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
