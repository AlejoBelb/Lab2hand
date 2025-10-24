// server/src/controllers/auth.controller.js

const {
  registerUser,
  loginUser,
  refreshSession,
  logoutByToken
} = require('../services/auth.service');

// Registra un usuario nuevo y devuelve el perfil creado
async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const user = await registerUser({ email, password, firstName, lastName, role });
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
}

// Inicia sesión: devuelve accessToken, refreshToken y perfil
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

// Renueva sesión con refreshToken válido
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await refreshSession({ refreshToken });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

// Cierra sesión: revoca el refreshToken recibido
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await logoutByToken({ refreshToken });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout
};
