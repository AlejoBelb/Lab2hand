// server/src/middlewares/requireInstitution.js

/**
 * Requiere que el usuario tenga institutionId
 * y lo expone en req.institutionId para uso posterior.
 */
function requireInstitution(req, res, next) {
  if (!req.user || !req.user.institutionId) {
    return res.status(403).json({
      error: 'El usuario no pertenece a ninguna institución',
    });
  }

  // Normalizamos el acceso
  req.institutionId = req.user.institutionId;
  next();
}

module.exports = requireInstitution;
