// server/src/middlewares/validators/common.js

const { body, query, param } = require('express-validator');

// Valida un email obligatorio y lo normaliza
const emailRequired = () =>
  body('email')
    .isEmail()
    .withMessage('El email no es válido')
    .bail()
    .normalizeEmail();

// Valida una cadena obligatoria con longitud mínima
// min = 1 por defecto (no vacío), trim y escape básicos
const stringRequired = (field, min = 1, max = 255) =>
  body(field)
    .isString()
    .withMessage(`El campo ${field} debe ser una cadena`)
    .bail()
    .trim()
    .isLength({ min, max })
    .withMessage(`El campo ${field} debe tener entre ${min} y ${max} caracteres`)
    .escape();

// Valida una cadena opcional (si viene, se valida)
const stringOptional = (field, min = 1, max = 255) =>
  body(field)
    .optional({ nullable: true })
    .isString()
    .withMessage(`El campo ${field} debe ser una cadena`)
    .bail()
    .trim()
    .isLength({ min, max })
    .withMessage(`El campo ${field} debe tener entre ${min} y ${max} caracteres`)
    .escape();

// Valida booleano opcional admitiendo "true/false", "1/0"
const booleanOptional = (field) =>
  body(field)
    .optional({ nullable: true })
    .isBoolean({ loose: true })
    .withMessage(`El campo ${field} debe ser booleano`)
    .toBoolean();

// Valida paginación en query: page y pageSize con límites
const paginationQuery = (maxPageSize = 100) => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un entero ≥ 1')
    .toInt(),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: maxPageSize })
    .withMessage(`pageSize debe ser un entero entre 1 y ${maxPageSize}`)
    .toInt(),
];

// Valida ordenamiento simple en query: sort y order (asc/desc) con lista blanca
const sortingQuery = (allowedFields = []) => [
  query('sort')
    .optional()
    .isIn(allowedFields)
    .withMessage(`sort debe estar en: ${allowedFields.join(', ')}`),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order debe ser "asc" o "desc"')
    .toLowerCase(),
];

// Valida un parámetro de ruta con formato cuid (id de Prisma)
// Ejemplo de cuid v2: ckqv9l1x20000l8k1c0r8b3k4
const cuidParam = (name = 'id') =>
  param(name)
    .isString()
    .withMessage(`El parámetro ${name} debe ser una cadena`)
    .bail()
    .matches(/^[a-z0-9]+$/i)
    .withMessage(`El parámetro ${name} debe contener solo caracteres alfanuméricos`)
    .isLength({ min: 10, max: 36 })
    .withMessage(`El parámetro ${name} no tiene un largo válido`);

// Valida un slug en el body (letras, números, guiones)
const slugRequired = (field = 'slug') =>
  body(field)
    .isString()
    .withMessage(`El campo ${field} debe ser una cadena`)
    .bail()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(`El campo ${field} debe ser un slug válido (minúsculas, números y guiones)`);

// Exporta helpers para uso en rutas
module.exports = {
  emailRequired,
  stringRequired,
  stringOptional,
  booleanOptional,
  paginationQuery,
  sortingQuery,
  cuidParam,
  slugRequired,
};
