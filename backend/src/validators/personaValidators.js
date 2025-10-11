const { body, param, query } = require('express-validator')
const mongoose = require('mongoose')

/**
 * Validaciones para crear una nueva persona
 */
const validateCreatePersona = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('apellido')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('dni')
    .trim()
    .notEmpty()
    .withMessage('El DNI es requerido')
    .matches(/^\d{7,8}$/)
    .withMessage('El DNI debe tener 7 u 8 dígitos'),

  body('telefono')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .matches(/^[\d\s\-\+\(\)]{8,20}$/)
    .withMessage('Formato de teléfono inválido'),

  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Formato de email inválido')
    .normalizeEmail(),

  body('fechaNacimiento')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value) => {
      if (value) {
        const date = new Date(value)
        const now = new Date()
        const age = now.getFullYear() - date.getFullYear()
        if (age < 0 || age > 100) {
          throw new Error('La edad debe estar entre 0 y 100 años')
        }
      }
      return true
    }),

  body('direccion.calle')
    .trim()
    .notEmpty()
    .withMessage('La calle es requerida')
    .isLength({ min: 3, max: 100 })
    .withMessage('La calle debe tener entre 3 y 100 caracteres'),

  body('direccion.numero')
    .trim()
    .notEmpty()
    .withMessage('El número es requerido')
    .isLength({ min: 1, max: 10 })
    .withMessage('El número debe tener entre 1 y 10 caracteres'),

  body('direccion.ciudad')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida')
    .isLength({ min: 2, max: 50 })
    .withMessage('La ciudad debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('La ciudad solo puede contener letras y espacios'),

  body('direccion.codigoPostal')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^\d{4}$/)
    .withMessage('El código postal debe tener 4 dígitos'),

  body('rama')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de rama inválido')
      }
      return true
    }),

  body('funcion')
    .optional()
    .isIn(['ayudante', 'beneficiario', 'educador'])
    .withMessage('La función debe ser: ayudante, beneficiario o educador'),
]

/**
 * Validaciones para actualizar una persona (campos opcionales)
 */
const validateUpdatePersona = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('apellido')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),

  body('dni')
    .optional()
    .trim()
    .matches(/^\d{7,8}$/)
    .withMessage('El DNI debe tener 7 u 8 dígitos'),

  body('telefono')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]{8,20}$/)
    .withMessage('Formato de teléfono inválido'),

  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Formato de email inválido')
    .normalizeEmail(),

  body('fechaNacimiento')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Formato de fecha inválido'),

  body('direccion.calle')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('La calle debe tener entre 3 y 100 caracteres'),

  body('direccion.numero')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('El número debe tener entre 1 y 10 caracteres'),

  body('direccion.ciudad')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ciudad debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('La ciudad solo puede contener letras y espacios'),

  body('direccion.codigoPostal')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^\d{4}$/)
    .withMessage('El código postal debe tener 4 dígitos'),

  body('rama')
    .optional({ nullable: true })
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de rama inválido')
      }
      return true
    }),

  body('funcion')
    .optional()
    .isIn(['ayudante', 'beneficiario', 'educador'])
    .withMessage('La función debe ser: ayudante, beneficiario o educador'),
]

/**
 * Validación para parámetros de ID
 */
const validatePersonaId = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('ID de persona inválido')
    }
    return true
  }),
]

/**
 * Validaciones para query parameters
 */
const validatePersonaQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 2000 })
    .withMessage('El límite debe estar entre 1 y 2000'),

  query('rama')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de rama inválido')
      }
      return true
    }),

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
  validateCreatePersona,
  validateUpdatePersona,
  validatePersonaId,
  validatePersonaQuery,
}
