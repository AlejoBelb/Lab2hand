// server/src/server.js
// Punto de arranque del servidor HTTP con logs y handlers de proceso.

require('dotenv').config();
const http = require('http');
const app = require('./app');

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);

// Log de eventos del servidor
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`;
  console.log(`[lab2hand-api] Listening on ${bind}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[lab2hand-api] Port ${PORT} is already in use`);
  } else {
    console.error('[lab2hand-api] Server error:', error);
  }
  process.exit(1);
});

// Señales de terminación
process.on('SIGINT', () => {
  console.log('[lab2hand-api] SIGINT received, shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('[lab2hand-api] SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
});

// Inicio
server.listen(PORT, HOST);
