// server/src/config/cors.js

// Obtiene la lista de orígenes permitidos desde variables de entorno
function getAllowedOrigins() {
  const raw = process.env.CORS_ALLOWED_ORIGINS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

module.exports = {
  getAllowedOrigins
};
