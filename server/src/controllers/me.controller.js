// server/src/controllers/me.controller.js

const prisma = require('../config/prisma');

// Devuelve el perfil del usuario autenticado a partir de req.user.id
async function getMe(req, res, next) {
  try {
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
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
}

// Endpoint de verificación de acceso para rol ADMIN
async function adminCheck(req, res) {
  return res.status(200).json({ ok: true, message: 'Acceso ADMIN concedido' });
}

module.exports = {
  getMe,
  adminCheck
};
