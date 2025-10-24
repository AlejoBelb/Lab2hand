// server/src/middlewares/validators/auth.js

const { body } = require('express-validator');

// Reglas para registro
const registerRules = [
  body('email')
    .isEmail()
    .withMessage('El email no es válido')
    .bail()
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('El password debe ser una cadena')
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage('El password debe tener entre 8 y 128 caracteres'),
  body('firstName')
    .optional({ nullable: true })
    .isString()
    .withMessage('firstName debe ser una cadena')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('firstName debe tener entre 1 y 100 caracteres')
    .escape(),
  body('lastName')
    .optional({ nullable: true })
    .isString()
    .withMessage('lastName debe ser una cadena')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('lastName debe tener entre 1 y 100 caracteres')
    .escape(),
  body('role')
    .optional()
    .isIn(['ADMIN', 'TEACHER', 'STUDENT'])
    .withMessage('role debe ser uno de: ADMIN, TEACHER, STUDENT')
];

// Reglas para login
const loginRules = [
  body('email')
    .isEmail()
    .withMessage('El email no es válido')
    .bail()
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('El password debe ser una cadena')
    .bail()
    .isLength({ min: 8, max: 128 })
    .withMessage('El password debe tener entre 8 y 128 caracteres')
];

// Reglas para refresh/logout (requieren refreshToken)
const refreshRules = [
  body('refreshToken')
    .isString()
    .withMessage('refreshToken es requerido')
    .bail()
    .isLength({ min: 10 })
    .withMessage('refreshToken inválido')
];

module.exports = {
  registerRules,
  loginRules,
  refreshRules
};
