// server/src/middlewares/auth.js

const { getBearerFromHeader, verifyAccessToken } = require('../utils/jwt');

// Middleware de autenticación por JWT en el header Authorization: Bearer <token>
function auth(req, res, next) {
  const token = getBearerFromHeader(req);
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Falta Authorization: Bearer <token>'
    });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role
    };
    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token inválido o expirado'
    });
  }
}

module.exports = auth;
