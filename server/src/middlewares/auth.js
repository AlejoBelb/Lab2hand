// server/src/middlewares/auth.js

const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Middleware: exige un token Bearer válido y adjunta el usuario al request
function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    console.log('[requireAuth] authHeader =>', authHeader);

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    console.log('[requireAuth] token extraído =>', token);

    if (!token) {
      console.log('[requireAuth] Sin token, devolviendo 401');
      return res.status(401).json({ error: 'No autorizado' });
    }

    if (!env.ACCESS_TOKEN_SECRET) {
      console.log('[requireAuth] Falta ACCESS_TOKEN_SECRET en env');
      return res
        .status(500)
        .json({ error: 'ServerError', message: 'Falta ACCESS_TOKEN_SECRET' });
    }

    console.log(
      '[requireAuth] Verificando token con clave:',
      env.ACCESS_TOKEN_SECRET.slice(0, 5),
      '...'
    );

    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    console.log('[requireAuth] payload decodificado =>', payload);

    // ✅ CORRECCIÓN CLAVE (ESTA ES LA LÍNEA IMPORTANTE)
    req.user = {
      id: payload.sub,
      role: payload.role,
      institutionId: payload.institutionId || null,
    };

    next();
  } catch (err) {
    console.error('[requireAuth] Error al verificar token =>', err.message);
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
