const logger = require('../utils/logger')

/**
 * Middleware para validar archivos de comprobante
 * Verifica tipo, tamaño y otras propiedades del archivo subido
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const validateComprobanteFile = (req, res, next) => {
  // Si no hay archivo, continuar (el archivo puede ser opcional en algunos casos)
  if (!req.file) {
    return next()
  }

  const file = req.file

  // Validar tipo de archivo
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
  ]

  if (!allowedMimeTypes.includes(file.mimetype)) {
    logger.warn('Tipo de archivo rechazado en validación', {
      mimetype: file.mimetype,
      originalName: file.originalname,
      size: file.size,
      ip: req.ip,
    })

    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido. Solo se aceptan JPG, PNG y PDF',
      allowedTypes: ['JPG', 'PNG', 'PDF'],
    })
  }

  // Validar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    logger.warn('Archivo demasiado grande', {
      size: file.size,
      maxSize: maxSize,
      originalName: file.originalname,
      mimetype: file.mimetype,
      ip: req.ip,
    })

    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande. Tamaño máximo: 5MB',
      maxSizeBytes: maxSize,
      receivedSizeBytes: file.size,
    })
  }

  // Validar nombre de archivo (evitar caracteres peligrosos)
  const dangerousChars = /[<>:"/\\|?*]/
  if (dangerousChars.test(file.originalname)) {
    logger.warn('Nombre de archivo con caracteres peligrosos', {
      originalName: file.originalname,
      ip: req.ip,
    })

    return res.status(400).json({
      success: false,
      message: 'El nombre del archivo contiene caracteres no permitidos',
    })
  }

  // Log del archivo validado exitosamente
  logger.debug('Archivo validado exitosamente', {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    destination: file.destination,
  })

  next()
}

/**
 * Middleware para validar archivos de imagen específicamente
 * Más restrictivo que validateComprobanteFile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const validateImageFile = (req, res, next) => {
  if (!req.file) {
    return next()
  }

  const file = req.file

  // Solo permitir imágenes
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']

  if (!allowedMimeTypes.includes(file.mimetype)) {
    logger.warn('Tipo de imagen rechazado', {
      mimetype: file.mimetype,
      originalName: file.originalname,
      ip: req.ip,
    })

    return res.status(400).json({
      success: false,
      message: 'Solo se permiten archivos de imagen (JPG, PNG)',
      allowedTypes: ['JPG', 'PNG'],
    })
  }

  // Tamaño más restrictivo para imágenes
  const maxSize = 2 * 1024 * 1024 // 2MB para imágenes
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'La imagen es demasiado grande. Tamaño máximo: 2MB',
      maxSizeBytes: maxSize,
      receivedSizeBytes: file.size,
    })
  }

  next()
}

/**
 * Middleware para validar archivos PDF específicamente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const validatePdfFile = (req, res, next) => {
  if (!req.file) {
    return next()
  }

  const file = req.file

  if (file.mimetype !== 'application/pdf') {
    logger.warn('Archivo no es PDF', {
      mimetype: file.mimetype,
      originalName: file.originalname,
      ip: req.ip,
    })

    return res.status(400).json({
      success: false,
      message: 'Solo se permiten archivos PDF',
    })
  }

  // PDFs pueden ser más grandes
  const maxSize = 10 * 1024 * 1024 // 10MB para PDFs
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'El archivo PDF es demasiado grande. Tamaño máximo: 10MB',
      maxSizeBytes: maxSize,
      receivedSizeBytes: file.size,
    })
  }

  next()
}

/**
 * Middleware para requerir que un archivo esté presente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
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
  validateImageFile,
  validatePdfFile,
  requireFile,
}
