const { body, param, query } = require('express-validator')
const mongoose = require('mongoose')

/**
 * Validaciones para crear un nuevo pago
 */
const validateCreatePago = [
  body('socio')
    .notEmpty()
    .withMessage('El socio es requerido')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de socio inválido')
      }
      return true
    }),

  body('monto')
    .notEmpty()
    .withMessage('El monto es requerido')
    .isFloat({ min: 0.01, max: 99999999.99 })
    .withMessage(
      'El monto debe ser un número positivo entre 0.01 y 99,999,999.99'
    ),

  body('fechaPago')
    .notEmpty()
    .withMessage('La fecha de pago es requerida')
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value) => {
      const date = new Date(value)
      const now = new Date()
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(now.getFullYear() - 1)

      if (date > now) {
        throw new Error('La fecha de pago no puede ser futura')
      }
      if (date < oneYearAgo) {
        throw new Error('La fecha de pago no puede ser anterior a un año')
      }
      return true
    }),

  body('mesCorrespondiente')
    .notEmpty()
    .withMessage('El mes correspondiente es requerido')
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage('El mes correspondiente debe tener formato YYYY-MM'),

  body('metodoPago')
    .notEmpty()
    .withMessage('El método de pago es requerido')
    .isIn(['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito'])
    .withMessage('Método de pago inválido'),
  body('tipoPago')
    .notEmpty()
    .withMessage('El tipo de pago es requerido')
    .isIn(['mensual', 'afiliacion', 'campamento', 'otro'])
    .withMessage('Tipo de pago inválido'),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no pueden exceder 500 caracteres'),

  body('estado')
    .optional()
    .isIn(['pendiente', 'confirmado', 'rechazado'])
    .withMessage('Estado inválido'),
]

/**
 * Validaciones para actualizar un pago
 */
const validateUpdatePago = [
  body('socio')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de socio inválido')
      }
      return true
    }),

  body('monto')
    .optional()
    .isFloat({ min: 0.01, max: 99999999.99 })
    .withMessage(
      'El monto debe ser un número positivo entre 0.01 y 99,999,999.99'
    ),

  body('fechaPago')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha inválido')
    .custom((value) => {
      if (value) {
        const date = new Date(value)
        const now = new Date()
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(now.getFullYear() - 1)

        if (date > now) {
          throw new Error('La fecha de pago no puede ser futura')
        }
        if (date < oneYearAgo) {
          throw new Error('La fecha de pago no puede ser anterior a un año')
        }
      }
      return true
    }),

  body('mesCorrespondiente')
    .optional()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage('El mes correspondiente debe tener formato YYYY-MM'),

  body('metodoPago')
    .optional()
    .isIn(['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito'])
    .withMessage('Método de pago inválido'),
  body('tipoPago')
    .optional()
    .isIn(['mensual', 'afiliacion', 'campamento', 'otro'])
    .withMessage('Tipo de pago inválido'),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no pueden exceder 500 caracteres'),

  body('estado')
    .optional()
    .isIn(['pendiente', 'confirmado', 'rechazado'])
    .withMessage('Estado inválido'),
]

/**
 * Validación para parámetros de ID
 */
const validatePagoId = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('ID de pago inválido')
    }
    return true
  }),
]

/**
 * Validación para ID de socio en rutas específicas
 */
const validateSocioId = [
  param('socioId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('ID de socio inválido')
    }
    return true
  }),
]

/**
 * Validaciones para query parameters
 */
const validatePagoQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 2000 })
    .withMessage('El límite debe estar entre 1 y 2000'),

  query('socio')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('ID de socio inválido')
      }
      return true
    }),

  query('año')
    .optional()
    .isInt({ min: 2020, max: new Date().getFullYear() + 1 })
    .withMessage('Año inválido'),

  query('mes')
    .optional()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage('El mes debe tener formato YYYY-MM'),

  query('metodoPago')
    .optional()
    .isIn(['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito'])
    .withMessage('Método de pago inválido'),
  query('tipoPago')
    .optional()
    .isIn(['mensual', 'afiliacion', 'campamento', 'otro'])
    .withMessage('Tipo de pago inválido'),

  query('estado')
    .optional()
    .isIn(['pendiente', 'confirmado', 'rechazado'])
    .withMessage('Estado inválido'),

  query('includeDeleted')
    .optional()
    .isBoolean()
    .withMessage('includeDeleted debe ser true o false'),
]

module.exports = {
  validateCreatePago,
  validateUpdatePago,
  validatePagoId,
  validateSocioId,
  validatePagoQuery,
}
