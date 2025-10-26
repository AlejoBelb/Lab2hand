// server/src/utils/jwt.js

// Utilidades para firmar y verificar JWT de acceso y refresh.
// Usa secretos centralizados desde config/env para evitar leer process.env directo.

const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Firma token de acceso (válido típicamente 15 minutos)
function signAccessToken(payload, options = {}) {
  const secret = env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET no configurado');
  return jwt.sign(payload, secret, { expiresIn: '15m', ...options });
}

// Firma token de refresh (válido típicamente 7 días)
function signRefreshToken(payload, options = {}) {
  const secret = env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET no configurado');
  return jwt.sign(payload, secret, { expiresIn: '7d', ...options });
}

// Verifica token de acceso
function verifyAccessToken(token) {
  const secret = env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET no configurado');
  return jwt.verify(token, secret);
}

// Verifica token de refresh
function verifyRefreshToken(token) {
  const secret = env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET no configurado');
  return jwt.verify(token, secret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
