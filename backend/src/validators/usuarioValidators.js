const { body, param, query } = require('express-validator')
const mongoose = require('mongoose')

/**
 * Validaciones para crear un nuevo usuario
 */
const validateCreateUsuario = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage(
      'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos'
    )
    .toLowerCase(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
    ),

  body('persona')
    .notEmpty()
    .withMessage('La persona es requerida')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de persona inválido')
      }
      return true
    }),

  body('rol')
    .notEmpty()
    .withMessage('El rol es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de rol inválido')
      }
      return true
    }),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El estado activo debe ser true o false'),
]

/**
 * Validaciones para actualizar un usuario
 */
const validateUpdateUsuario = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage(
      'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos'
    )
    .toLowerCase(),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
    ),

  body('persona')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de persona inválido')
      }
      return true
    }),

  body('rol')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de rol inválido')
      }
      return true
    }),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El estado activo debe ser true o false'),
]

/**
 * Validación para parámetros de ID
 */
const validateUsuarioId = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('ID de usuario inválido')
    }
    return true
  }),
]

/**
 * Validaciones para query parameters
 */
const validateUsuarioQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 2000 })
    .withMessage('El límite debe estar entre 1 y 2000'),

  query('rol')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de rol inválido')
      }
      return true
    }),

  query('activo')
    .optional()
    .isBoolean()
    .withMessage('El filtro activo debe ser true o false'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La búsqueda debe tener entre 1 y 50 caracteres'),

  query('includeDeleted')
    .optional()
    .isBoolean()
    .withMessage('includeDeleted debe ser true o false'),
]

module.exports = {
  validateCreateUsuario,
  validateUpdateUsuario,
  validateUsuarioId,
  validateUsuarioQuery,
}
