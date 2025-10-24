// server/src/middlewares/requestLogger.js

const morgan = require('morgan');

// Middleware de logging HTTP; en dev usa 'dev' y en prod 'combined'
function requestLogger() {
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  return morgan(isDev ? 'dev' : 'combined');
}

module.exports = requestLogger;
