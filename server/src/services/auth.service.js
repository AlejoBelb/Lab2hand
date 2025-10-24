// server/src/services/auth.service.js

const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require('../utils/jwt');

// Convierte duraciones tipo "15m", "7d", "12h" a milisegundos
function parseDurationToMs(str) {
  if (!str || typeof str !== 'string') return 0;
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(str.trim());
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * map[unit];
}

// Calcula expiresAt para refresh tokens en base a JWT_REFRESH_EXPIRES_IN
function computeRefreshExpiresAt() {
  const dur = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const ms = parseDurationToMs(dur);
  return new Date(Date.now() + (ms || 7 * 24 * 3600000));
}

// Normaliza errores con status para el errorHandler global
function toHttpError(message, statusCode = 400) {
  const err = new Error(message);
  err.status = statusCode;
  return err;
}

// Crea usuario con email único y contraseña hasheada
async function registerUser({ email, password, firstName, lastName, role = 'STUDENT' }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw toHttpError('El email ya está registrado', 409);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      role,
      isActive: true
    },
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

  return user;
}

// Verifica credenciales y emite tokens; guarda el refresh en DB
async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw toHttpError('Credenciales inválidas', 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw toHttpError('Credenciales inválidas', 401);

  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: computeRefreshExpiresAt()
    }
  });

  const profile = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  };

  return { accessToken, refreshToken, user: profile };
}

// Genera nuevos tokens a partir de un refresh token válido y no revocado
async function refreshSession({ refreshToken }) {
  if (!refreshToken) throw toHttpError('Falta refresh token', 400);

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw toHttpError('Refresh token inválido', 401);
  }

  const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!dbToken) throw toHttpError('Refresh token no reconocido', 401);
  if (dbToken.revokedAt) throw toHttpError('Refresh token revocado', 401);
  if (dbToken.expiresAt && dbToken.expiresAt < new Date()) {
    throw toHttpError('Refresh token expirado', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive) throw toHttpError('Usuario no disponible', 401);

  const payload = { sub: user.id, role: user.role };
  const newAccess = signAccessToken(payload);
  const newRefresh = signRefreshToken(payload);

  // Opcional: rotación (revoca el anterior y guarda el nuevo)
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revokedAt: new Date() }
    }),
    prisma.refreshToken.create({
      data: {
        token: newRefresh,
        userId: user.id,
        expiresAt: computeRefreshExpiresAt()
      }
    })
  ]);

  return { accessToken: newAccess, refreshToken: newRefresh };
}

// Revoca un refresh token específico
async function logoutByToken({ refreshToken }) {
  if (!refreshToken) throw toHttpError('Falta refresh token', 400);
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() }
  });
  return { ok: true };
}

// Revoca todos los refresh tokens del usuario (logout global de todos los dispositivos)
async function logoutAllForUser({ userId }) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
  return { ok: true };
}

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  logoutByToken,
  logoutAllForUser
};
