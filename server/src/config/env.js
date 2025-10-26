// server/src/config/env.js
const path = require('path');

// Carga siempre server/.env (desde src/config => subir dos niveles)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Lista de variables requeridas
const REQUIRED = [
  'DATABASE_URL',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
];

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn('[env] Faltan variables en .env ->', missing.join(', '));
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),

  DATABASE_URL: process.env.DATABASE_URL || '',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '',
};
