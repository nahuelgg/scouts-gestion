const multer = require('multer')
const path = require('path')
const fs = require('fs')
const logger = require('../utils/logger')

/**
 * Configuración de almacenamiento para archivos
 * Organiza los archivos por año en subdirectorios
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const year = new Date().getFullYear()
    const uploadPath = path.join(
      process.env.UPLOAD_PATH || './uploads',
      year.toString()
    )

    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
      logger.info(`Directorio de uploads creado: ${uploadPath}`)
    }

    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const filename =
      'comprobante-' + uniqueSuffix + path.extname(file.originalname)

    logger.debug('Generando archivo de comprobante', {
      originalName: file.originalname,
      generatedName: filename,
      mimetype: file.mimetype,
      size: file.size,
    })

    cb(null, filename)
  },
})

/**
 * Filtro para validar tipos de archivo permitidos
 * @param {Object} req - Request object
 * @param {Object} file - File object from multer
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    logger.warn('Tipo de archivo rechazado', {
      mimetype: file.mimetype,
      originalName: file.originalname,
      ip: req.ip,
    })
    cb(
      new Error('Tipo de archivo no permitido. Solo se aceptan JPG, PNG y PDF'),
      false
    )
  }
}

/**
 * Configuración principal de multer para uploads
 */
const uploadConfig = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1, // Solo un archivo por request
  },
  fileFilter: fileFilter,
})

/**
 * Middleware para subida de comprobantes (archivo único)
 */
const uploadComprobante = uploadConfig.single('comprobante')

/**
 * Middleware para subida múltiple de archivos (si es necesario en el futuro)
 */
const uploadMultiple = uploadConfig.array('archivos', 5) // Máximo 5 archivos

/**
 * Middleware para manejo de errores de multer
 * @param {Error} error - Error de multer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    logger.error('Error de Multer', {
      error: error.message,
      code: error.code,
      field: error.field,
      limit: error.limit,
      ip: req.ip,
    })

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'El archivo es demasiado grande. Máximo 5MB permitido.',
        })
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Demasiados archivos. Solo se permite un archivo.',
        })
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado.',
        })
      default:
        return res.status(400).json({
          success: false,
          message: 'Error al procesar el archivo.',
        })
    }
  } else if (error) {
    logger.error('Error en upload de archivo', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    })

    return res.status(400).json({
      success: false,
      message: error.message || 'Error al procesar el archivo.',
    })
  }

  next()
}

/**
 * Middleware combinado para upload con manejo de errores
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const uploadComprobanteWithErrorHandling = (req, res, next) => {
  uploadComprobante(req, res, (error) => {
    handleUploadError(error, req, res, next)
  })
}

module.exports = {
  uploadComprobante,
  uploadComprobanteWithErrorHandling,
  uploadMultiple,
  handleUploadError,
  storage,
  fileFilter,
}
