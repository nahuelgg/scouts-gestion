/**
 * Manejo estandarizado de errores del servidor
 * @param {Object} res - Response object de Express
 * @param {Error} error - Error object
 * @param {string} customMessage - Mensaje personalizado (opcional)
 * @param {number} statusCode - Código de estado HTTP (default: 500)
 */
const handleServerError = (
  res,
  error,
  customMessage = 'Error del servidor',
  statusCode = 500
) => {
  // En desarrollo, logear el error completo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error)
  } else {
    // En producción, logear solo el mensaje
    console.error('Server error:', customMessage)
  }

  res.status(statusCode).json({
    message: customMessage,
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  })
}

/**
 * Manejo de errores de validación
 * @param {Object} res - Response object de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP (default: 400)
 */
const handleValidationError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ message })
}

/**
 * Manejo de recursos no encontrados
 * @param {Object} res - Response object de Express
 * @param {string} resource - Nombre del recurso no encontrado
 */
const handleNotFound = (res, resource = 'Recurso') => {
  res.status(404).json({ message: `${resource} no encontrado` })
}

/**
 * Respuesta de éxito estandarizada
 * @param {Object} res - Response object de Express
 * @param {Object} data - Datos a enviar
 * @param {string} message - Mensaje de éxito
 * @param {number} statusCode - Código de estado HTTP (default: 200)
 */
const sendSuccessResponse = (
  res,
  data,
  message = 'Operación exitosa',
  statusCode = 200
) => {
  res.status(statusCode).json({
    message,
    ...data,
  })
}

module.exports = {
  handleServerError,
  handleValidationError,
  handleNotFound,
  sendSuccessResponse,
}
