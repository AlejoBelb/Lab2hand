// server/src/utils/jwt.js

const jwt = require('jsonwebtoken');

// Parámetros cargados desde variables de entorno
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Firma un access token con expiración corta para autenticación en API
function signAccessToken(payload = {}, options = {}) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN, ...options });
}

// Firma un refresh token con expiración más larga para renovación de sesión
function signRefreshToken(payload = {}, options = {}) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN, ...options });
}

// Verifica un access token y retorna el payload si es válido
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

// Verifica un refresh token y retorna el payload si es válido
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

// Decodifica un token sin verificar firma (útil para debugging)
function decodeToken(token) {
  return jwt.decode(token);
}

// Extrae el token Bearer del header Authorization
function getBearerFromHeader(req) {
  const header = req.headers?.authorization || '';
  const parts = header.split(' ');
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getBearerFromHeader
};
