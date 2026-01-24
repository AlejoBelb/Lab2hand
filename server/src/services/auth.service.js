// server/src/services/auth.service.js
// Servicio de autenticación y gestión de tokens para usuarios

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
console.log('AuthService Prisma models:', Object.keys(prisma));

// Configuración de tiempos de expiración
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

/* ======================================================
   Helpers JWT
====================================================== */

function signAccessToken(user) {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('Falta ACCESS_TOKEN_SECRET');
  }

  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      institutionId: user.institutionId || null,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function signRefreshToken(user) {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('Falta REFRESH_TOKEN_SECRET');
  }

  return jwt.sign(
    {
      sub: user.id,
      type: 'refresh',
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

/* ======================================================
   REGISTRO DE USUARIO (PENDIENTE DE APROBACIÓN)
====================================================== */

// -----------------------------------------------------------
// Registro de usuario
// -----------------------------------------------------------
async function registerUser(data) {
  const {
    email,
    password,
    firstName,
    lastName,
    role, // opcional: "TEACHER" o "STUDENT"
  } = data;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    const error = new Error('El correo ya está registrado');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Regla clave del sistema
  const isTeacherRequest = role === 'TEACHER';

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,

      // reglas de negocio
      role: isTeacherRequest ? 'STUDENT' : 'STUDENT',
      isActive: isTeacherRequest ? false : true,
      pendingApproval: isTeacherRequest ? true : false,

      institutionId: null,
    },
  });

  // Si está pendiente → NO se generan tokens
  if (user.pendingApproval) {
    return {
      user,
      accessToken: null,
      refreshToken: null,
      pendingApproval: true,
    };
  }

  // Usuarios activos normales
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: null,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
    pendingApproval: false,
  };
}


/* ======================================================
   LOGIN
====================================================== */

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Cuenta pendiente de aprobación');
    error.statusCode = 403;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: null,
    },
  });

  return { user, accessToken, refreshToken };
}

/* ======================================================
   REFRESH TOKEN
====================================================== */

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    const error = new Error('Falta refreshToken');
    error.statusCode = 400;
    throw error;
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored || stored.revokedAt) {
    const error = new Error('Refresh token inválido');
    error.statusCode = 401;
    throw error;
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  if (!stored.user || !stored.user.isActive) {
    const error = new Error('Usuario inactivo');
    error.statusCode = 403;
    throw error;
  }

  const accessToken = signAccessToken(stored.user);
  return { accessToken };
}

/* ======================================================
   LOGOUT
====================================================== */

async function logoutUser(refreshToken) {
  if (!refreshToken) return;

  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revokedAt: new Date() },
  });
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
