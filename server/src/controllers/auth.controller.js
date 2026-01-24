// server/src/controllers/auth.controller.js

const { registerUser, loginUser, refreshAccessToken, logoutUser } = require('../services/auth.service');

/* ======================================================
   REGISTER
====================================================== */

async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      ...result, // ← NO mutilar la respuesta del service
    });
  } catch (err) {
    next(err);
  }
}

/* ======================================================
   LOGIN
====================================================== */

async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

/* ======================================================
   REFRESH
====================================================== */

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

/* ======================================================
   LOGOUT
====================================================== */

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await logoutUser(refreshToken);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
};
