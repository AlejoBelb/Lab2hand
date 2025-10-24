// server/src/middlewares/errorHandler.js

// Manejador global de errores con respuesta segura y trazas en desarrollo
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isDev = (process.env.NODE_ENV || 'development') === 'development';

  const payload = {
    error: err.name || 'Error',
    message: err.message || 'Internal Server Error',
    statusCode: status
  };

  if (isDev && err.stack) {
    payload.stack = err.stack;
  }

  return res.status(status).json(payload);
}

module.exports = errorHandler;
