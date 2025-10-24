// server/src/middlewares/authorize.js

// Middleware de autorización por roles; recibe una lista de roles permitidos
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No autorizado'
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'No posee permisos suficientes'
      });
    }
    return next();
  };
}

module.exports = authorize;
