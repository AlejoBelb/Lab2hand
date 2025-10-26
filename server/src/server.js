// server/src/server.js
const http = require('http');
const path = require('path');

// Carga centralizada de .env + export de variables
const env = require('./config/env');

const app = require('./app');

const server = http.createServer(app);
server.listen(env.PORT, () => {
  console.log(`Lab2hand API escuchando en puerto ${env.PORT}`);
});

module.exports = server;
