// server/src/middlewares/validate.js

const { validationResult } = require('express-validator');

// Formatea los errores de express-validator en un arreglo simple y consistente
function formatErrors(result) {
  return result.array().map((err) => ({
    field: err.type === 'field' ? err.path : undefined,
    message: err.msg,
    location: err.location
  }));
}

// Middleware fábrica: recibe un arreglo de reglas y las ejecuta; si hay errores, corta con 422
function validate(rules = []) {
  return async (req, res, next) => {
    // Ejecuta reglas secuencialmente para soportar validaciones asíncronas
    for (const rule of rules) {
      // Cada rule es un middleware de express-validator
      // eslint-disable-next-line no-await-in-loop
      await rule.run(req);
    }

    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }

    return res.status(422).json({
      error: 'ValidationError',
      statusCode: 422,
      errors: formatErrors(result)
    });
  };
}

module.exports = validate;
