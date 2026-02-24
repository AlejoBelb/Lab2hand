// server/src/validators/teacherGuides.validator.js
const { body } = require('express-validator');

function upsertDraftGuideValidator() {
  return [
    body('id')
      .optional()
      .isString()
      .withMessage('id debe ser string'),

    body('courseId')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('courseId es requerido'),

    body('experimentId')
      .optional({ nullable: true })
      .isString()
      .trim()
      .withMessage('experimentId debe ser string'),

    body('title')
      .isString()
      .trim()
      .isLength({ min: 3, max: 120 })
      .withMessage('title debe tener entre 3 y 120 caracteres'),

    body('description')
      .optional({ nullable: true })
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('description no puede exceder 500 caracteres'),

    body('content')
      .optional({ nullable: true })
      .custom((val) => {
        if (val === null || val === undefined) return true;
        if (typeof val === 'object') return true;
        throw new Error('content debe ser un objeto JSON');
      }),
  ];
}

module.exports = {
  upsertDraftGuideValidator,
};
