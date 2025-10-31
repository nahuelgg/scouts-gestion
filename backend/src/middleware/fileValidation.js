const logger = require('../utils/logger')
const FileValidationService = require('../services/file/FileValidationService')

/**
 * Middleware para validar archivos de comprobante
 * Usa el FileValidationService simplificado
 */
const validateComprobanteFile = (req, res, next) => {
  // Si no hay archivo, continuar
  if (!req.file) {
    return next()
  }

  // Usar nuestro servicio simplificado
  const validationResult = FileValidationService.validatePaymentReceipt(
    req.file
  )

  if (!validationResult.isValid) {
    logger.warn('Archivo rechazado en validación', {
      originalName: req.file.originalname,
      errors: validationResult.errors,
      ip: req.ip,
    })

    return res.status(400).json({
      success: false,
      message: 'Archivo no válido',
      errors: validationResult.errors,
    })
  }

  // Log del archivo validado exitosamente
  logger.debug('Archivo validado exitosamente', {
    originalName: req.file.originalname,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
  })

  next()
}

/**
 * Middleware para requerir que un archivo esté presente
 */
const requireFile = (req, res, next) => {
  if (!req.file) {
    logger.warn('Archivo requerido no encontrado', {
      ip: req.ip,
      route: req.route?.path,
      method: req.method,
    })

    return res.status(400).json({
      success: false,
      message: 'Se requiere un archivo para esta operación',
    })
  }

  next()
}

module.exports = {
  validateComprobanteFile,
  requireFile,
}
