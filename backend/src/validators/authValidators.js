const { body } = require('express-validator')

/**
 * Validaciones para el endpoint de login
 */
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage(
      'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos'
    ),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
]

/**
 * Validaciones para el endpoint de cambio de contraseña
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'
    )
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual')
      }
      return true
    }),
]

module.exports = {
  validateLogin,
  validateChangePassword,
}
