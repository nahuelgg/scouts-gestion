const { validationResult } = require('express-validator')

/**
 * Middleware para manejar errores de validación de express-validator
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 * @returns {void}
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Formatear errores para respuesta más limpia
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }))

    return res.status(400).json({
      message: 'Errores de validación',
      errors: formattedErrors,
    })
  }

  next()
}

module.exports = {
  handleValidationErrors,
}
