// server/src/middlewares/auth.js

// Importa JWT y las variables de entorno centralizadas
const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Middleware: exige un token Bearer válido y adjunta el usuario al request
function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (!env.ACCESS_TOKEN_SECRET) {
      return res
        .status(500)
        .json({ error: 'ServerError', message: 'Falta ACCESS_TOKEN_SECRET' });
    }

    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'No autorizado' });
  }
}

// Middleware: exige que el usuario tenga uno de los roles indicados
function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Prohibido' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
