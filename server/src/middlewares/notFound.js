// server/src/middlewares/notFound.js

// Respuesta estándar para rutas no encontradas
function notFound(req, res) {
  return res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl
  });
}

module.exports = notFound;
