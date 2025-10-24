// server/src/routes/auth.routes.js

const { Router } = require('express');
const validate = require('../middlewares/validate');
const { registerRules, loginRules, refreshRules } = require('../middlewares/validators/auth');
const { register, login, refresh, logout } = require('../controllers/auth.controller');

const router = Router();

// Registro de usuario
router.post('/register', validate(registerRules), register);

// Login
router.post('/login', validate(loginRules), login);

// Refresh de tokens
router.post('/refresh', validate(refreshRules), refresh);

// Logout (revoca refreshToken recibido)
router.post('/logout', validate(refreshRules), logout);

module.exports = router;
