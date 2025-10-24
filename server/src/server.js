// server/src/server.js

require('dotenv').config();
const http = require('http');
const app = require('./app');

// Obtiene el puerto desde variables de entorno con un valor por defecto
const PORT = process.env.PORT || 4000;

// Crea el servidor HTTP basado en la app de Express
const server = http.createServer(app);

// Inicia el servidor y escribe un log de arranque
server.listen(PORT, () => {
  console.log(`Lab2hand API escuchando en puerto ${PORT}`);
});

module.exports = server;
