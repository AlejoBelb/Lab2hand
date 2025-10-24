// server/src/middlewares/validators/users.js

const { body, query } = require('express-validator');
const { paginationQuery, sortingQuery, cuidParam, stringOptional, booleanOptional } = require('./common');

// Reglas para listar usuarios (solo ADMIN): paginación, filtros y orden
const listUsersRules = [
  ...paginationQuery(100),
  query('role')
    .optional()
    .isIn(['ADMIN', 'TEACHER', 'STUDENT'])
    .withMessage('role debe ser uno de: ADMIN, TEACHER, STUDENT'),
  query('isActive')
    .optional()
    .isBoolean({ loose: true })
    .withMessage('isActive debe ser booleano')
    .toBoolean(),
  query('search')
    .optional()
    .isString()
    .withMessage('search debe ser una cadena')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('search debe tener entre 1 y 100 caracteres'),
  ...sortingQuery(['createdAt', 'email', 'firstName', 'lastName', 'role'])
];

// Reglas para obtener usuario por id
const getUserByIdRules = [cuidParam('id')];

// Reglas para actualizar usuario (solo ADMIN)
const updateUserRules = [
  cuidParam('id'),
  stringOptional('firstName', 1, 100),
  stringOptional('lastName', 1, 100),
  body('role')
    .optional()
    .isIn(['ADMIN', 'TEACHER', 'STUDENT'])
    .withMessage('role debe ser uno de: ADMIN, TEACHER, STUDENT'),
  booleanOptional('isActive')
];

module.exports = {
  listUsersRules,
  getUserByIdRules,
  updateUserRules
};
