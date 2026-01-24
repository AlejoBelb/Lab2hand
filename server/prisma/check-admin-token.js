// prisma/check-admin-token.js
// Decodifica el accessToken del admin para verificar role y claims

const jwt = require('jsonwebtoken');

const ACCESS_TOKEN = process.env.ADMIN_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ Define ADMIN_ACCESS_TOKEN en .env');
  process.exit(1);
}

const payload = jwt.verify(
  ACCESS_TOKEN,
  process.env.ACCESS_TOKEN_SECRET
);

console.log('=== PAYLOAD DEL TOKEN ADMIN ===');
console.log(payload);
