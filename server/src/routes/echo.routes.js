// server/src/routes/echo.routes.js

const { Router } = require('express');
const validate = require('../middlewares/validate');
const {
  emailRequired,
  stringRequired,
  booleanOptional,
  paginationQuery
} = require('../middlewares/validators/common');
const { echo } = require('../controllers/echo.controller');

const router = Router();

// Reglas:
// - body.email: requerido y normalizado
// - body.title: requerido, string entre 3 y 100
// - body.isActive: opcional booleano
// - query.page y query.pageSize: opcionales y acotados
router.post(
  '/',
  validate([
    emailRequired(),
    stringRequired('title', 3, 100),
    booleanOptional('isActive'),
    ...paginationQuery(100)
  ]),
  echo
);

module.exports = router;
