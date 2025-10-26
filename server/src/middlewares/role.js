// server/src/middlewares/role.js

// Esta sección importa jsonwebtoken para verificar tokens de acceso
const jwt = require('jsonwebtoken');

// Esta función extrae y valida el JWT de Authorization: Bearer <token>
function ensureAuth(req, res, next) {
  try {
    const hdr = req.headers['authorization'] || '';
    const [, token] = hdr.split(' ');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Token no provisto' });
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'ServerError', message: 'Falta ACCESS_TOKEN_SECRET' });
    }

    const payload = jwt.verify(token, secret);
    // Estructura esperada del payload (según tu backend): { sub, role, iat, exp }
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Token inválido o expirado' });
  }
}

// Esta función valida que el rol del usuario esté permitido
function requireRole(roles = []) {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Sesión requerida' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Permisos insuficientes' });
    }
    next();
  };
}

module.exports = { ensureAuth, requireRole };
