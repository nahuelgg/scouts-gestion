const { body, param } = require('express-validator')
const mongoose = require('mongoose')

/**
 * Validaciones para crear una nueva rama
 */
const validateCreateRama = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la rama es requerido')
    .isIn(['manada', 'unidad', 'caminantes', 'rovers'])
    .withMessage('El nombre debe ser: manada, unidad, caminantes o rovers'),

  body('descripcion')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 200 })
    .withMessage('La descripción debe tener entre 10 y 200 caracteres'),

  body('edadMinima')
    .notEmpty()
    .withMessage('La edad mínima es requerida')
    .isInt({ min: 5, max: 30 })
    .withMessage('La edad mínima debe estar entre 5 y 30 años'),

  body('edadMaxima')
    .notEmpty()
    .withMessage('La edad máxima es requerida')
    .isInt({ min: 5, max: 30 })
    .withMessage('La edad máxima debe estar entre 5 y 30 años')
    .custom((value, { req }) => {
      if (value <= req.body.edadMinima) {
        throw new Error('La edad máxima debe ser mayor a la edad mínima')
      }
      return true
    }),

  body('jefeRama')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de jefe de rama inválido')
      }
      return true
    }),
]

/**
 * Validaciones para actualizar una rama
 */
const validateUpdateRama = [
  body('nombre')
    .optional()
    .trim()
    .isIn(['manada', 'unidad', 'caminantes', 'rovers'])
    .withMessage('El nombre debe ser: manada, unidad, caminantes o rovers'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('La descripción debe tener entre 10 y 200 caracteres'),

  body('edadMinima')
    .optional()
    .isInt({ min: 5, max: 30 })
    .withMessage('La edad mínima debe estar entre 5 y 30 años'),

  body('edadMaxima')
    .optional()
    .isInt({ min: 5, max: 30 })
    .withMessage('La edad máxima debe estar entre 5 y 30 años')
    .custom((value, { req }) => {
      if (value && req.body.edadMinima && value <= req.body.edadMinima) {
        throw new Error('La edad máxima debe ser mayor a la edad mínima')
      }
      return true
    }),

  body('jefeRama')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de jefe de rama inválido')
      }
      return true
    }),
]

/**
 * Validación para parámetros de ID
 */
const validateRamaId = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('ID de rama inválido')
    }
    return true
  }),
]

module.exports = {
  validateCreateRama,
  validateUpdateRama,
  validateRamaId,
}
