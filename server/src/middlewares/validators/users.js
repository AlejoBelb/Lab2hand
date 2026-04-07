// server/src/middlewares/validators/users.js

const { body, query } = require('express-validator');
const {
  paginationQuery,
  sortingQuery,
  cuidParam,
  stringOptional,
  booleanOptional,
} = require('./common');

const ALL_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'];
const ADMIN_EDITABLE_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'];

// Listar usuarios (ADMIN institucional)
const listUsersRules = [
  ...paginationQuery(100),
  query('role').optional().isIn(ALL_ROLES)
    .withMessage(`role debe ser uno de: ${ALL_ROLES.join(', ')}`),
  query('isActive').optional().isBoolean({ loose: true })
    .withMessage('isActive debe ser booleano').toBoolean(),
  query('search').optional().isString().trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('search debe tener entre 1 y 100 caracteres'),
  ...sortingQuery(['createdAt', 'email', 'firstName', 'lastName', 'role']),
];

const getUserByIdRules = [cuidParam('id')];

// Actualizar usuario (ADMIN institucional)
const updateUserRules = [
  cuidParam('id'),
  stringOptional('firstName', 1, 100),
  stringOptional('lastName', 1, 100),
  body('role').optional().isIn(ADMIN_EDITABLE_ROLES)
    .withMessage(`role debe ser uno de: ${ADMIN_EDITABLE_ROLES.join(', ')}`),
  booleanOptional('isActive'),
];

module.exports = { listUsersRules, getUserByIdRules, updateUserRules };
