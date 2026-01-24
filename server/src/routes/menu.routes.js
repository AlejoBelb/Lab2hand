//server\src\routes\menu.routes.js
// Rutas del menú de experimentos

const express = require('express');
const { getMenu } = require('../controllers/menuController');

const router = express.Router();

// Endpoint público: GET /api/menu
router.get('/menu', getMenu);

module.exports = router;
