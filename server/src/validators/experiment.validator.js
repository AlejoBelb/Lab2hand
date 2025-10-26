const { checkSchema } = require('express-validator');

const ExperimentStatus = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const Visibility = ['PRIVATE', 'UNLISTED', 'PUBLIC'];
const Sortable = ['createdAt', 'updatedAt', 'title', 'status', 'visibility'];

// Validación para listar con filtros y paginación
const listExperimentsValidator = checkSchema({
  page: {
    in: ['query'],
    optional: true,
    isInt: { options: { min: 1 } },
    toInt: true,
    errorMessage: 'El parámetro page debe ser un entero >= 1',
  },
  pageSize: {
    in: ['query'],
    optional: true,
    isInt: { options: { min: 1, max: 100 } },
    toInt: true,
    errorMessage: 'El parámetro pageSize debe ser un entero entre 1 y 100',
  },
  sort: {
    in: ['query'],
    optional: true,
    isIn: { options: [Sortable] },
    errorMessage: `El parámetro sort debe ser uno de: ${Sortable.join(', ')}`,
  },
  order: {
    in: ['query'],
    optional: true,
    isIn: { options: [['asc', 'desc']] },
    errorMessage: 'El parámetro order debe ser "asc" o "desc"',
  },
  status: {
    in: ['query'],
    optional: true,
    isIn: { options: [ExperimentStatus] },
    errorMessage: `El parámetro status debe ser uno de: ${ExperimentStatus.join(', ')}`,
  },
  visibility: {
    in: ['query'],
    optional: true,
    isIn: { options: [Visibility] },
    errorMessage: `El parámetro visibility debe ser uno de: ${Visibility.join(', ')}`,
  },
  search: {
    in: ['query'],
    optional: true,
    isString: true,
    trim: true,
    escape: true,
    isLength: { options: { min: 2, max: 100 } },
    errorMessage: 'El parámetro search debe tener entre 2 y 100 caracteres',
  },
});

// Validación de parámetro :id (cuid)
const idParamValidator = checkSchema({
  id: {
    in: ['params'],
    isString: true,
    trim: true,
    isLength: { options: { min: 10, max: 50 } },
    errorMessage: 'El parámetro id es inválido',
  },
});

// Validación de parámetro :slug
const slugParamValidator = checkSchema({
  slug: {
    in: ['params'],
    isString: true,
    trim: true,
    matches: { options: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/] },
    isLength: { options: { min: 3, max: 80 } },
    errorMessage: 'El parámetro slug es inválido. Use minúsculas, números y guiones medios',
  },
});

// Validación para crear experimentos
const createExperimentValidator = checkSchema({
  title: {
    in: ['body'],
    exists: { options: { checkFalsy: true } },
    isString: true,
    trim: true,
    isLength: { options: { min: 3, max: 120 } },
    errorMessage: 'El campo title es obligatorio y debe tener entre 3 y 120 caracteres',
  },
  slug: {
    in: ['body'],
    exists: { options: { checkFalsy: true } },
    isString: true,
    trim: true,
    toLowerCase: true,
    matches: { options: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/] },
    isLength: { options: { min: 3, max: 80 } },
    errorMessage: 'El campo slug es obligatorio, minúsculas/números con guiones, 3-80 caracteres',
  },
  description: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    isLength: { options: { min: 0, max: 2000 } },
    errorMessage: 'El campo description debe ser texto de máximo 2000 caracteres',
  },
  status: {
    in: ['body'],
    optional: true,
    isIn: { options: [ExperimentStatus] },
    errorMessage: `El campo status debe ser uno de: ${ExperimentStatus.join(', ')}`,
  },
  visibility: {
    in: ['body'],
    optional: true,
    isIn: { options: [Visibility] },
    errorMessage: `El campo visibility debe ser uno de: ${Visibility.join(', ')}`,
  },
});

// Validación para actualizar experimentos
const updateExperimentValidator = checkSchema({
  title: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    isLength: { options: { min: 3, max: 120 } },
    errorMessage: 'El campo title debe tener entre 3 y 120 caracteres',
  },
  slug: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    toLowerCase: true,
    matches: { options: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/] },
    isLength: { options: { min: 3, max: 80 } },
    errorMessage: 'El campo slug debe usar minúsculas/números con guiones y 3-80 caracteres',
  },
  description: {
    in: ['body'],
    optional: true,
    isString: true,
    trim: true,
    isLength: { options: { min: 0, max: 2000 } },
    errorMessage: 'El campo description debe ser texto de máximo 2000 caracteres',
  },
  status: {
    in: ['body'],
    optional: true,
    isIn: { options: [ExperimentStatus] },
    errorMessage: `El campo status debe ser uno de: ${ExperimentStatus.join(', ')}`,
  },
  visibility: {
    in: ['body'],
    optional: true,
    isIn: { options: [Visibility] },
    errorMessage: `El campo visibility debe ser uno de: ${Visibility.join(', ')}`,
  },
});

module.exports = {
  listExperimentsValidator,
  idParamValidator,
  slugParamValidator,
  createExperimentValidator,
  updateExperimentValidator,
};
