const morgan = require('morgan')
const logger = require('../utils/logger')

/**
 * Stream personalizado para integrar Morgan con Winston
 */
const morganStream = {
  write: (message) => {
    // Remover el salto de línea final de Morgan
    logger.http(message.trim())
  },
}

/**
 * Formato personalizado para logs de desarrollo
 */
const developmentFormat =
  ':remote-addr :method :url :status :res[content-length] - :response-time ms'

/**
 * Formato personalizado para logs de producción (más detallado)
 */
const productionFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'

/**
 * Formato JSON estructurado para producción
 */
morgan.token('json', (req, res) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode,
    contentLength: res.getHeader('content-length'),
    responseTime: res.responseTime,
    remoteAddr: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    referrer: req.get('Referrer'),
    userId: req.user?.id || null,
    route: req.route?.path || null,
  })
})

/**
 * Middleware de logging para desarrollo
 * @returns {Function} Middleware de Morgan para desarrollo
 */
const developmentLogger = () => {
  return morgan(developmentFormat, {
    stream: morganStream,
    skip: (req, res) => {
      // Skip en desarrollo solo para health checks muy frecuentes
      return (
        req.url === '/api/health' && process.env.SKIP_HEALTH_LOGS === 'true'
      )
    },
  })
}

/**
 * Middleware de logging para producción
 * @returns {Function} Middleware de Morgan para producción
 */
const productionLogger = () => {
  return morgan(':json', {
    stream: morganStream,
    skip: (req, res) => {
      // En producción, skip health checks y requests exitosos a archivos estáticos
      if (req.url === '/api/health') return true
      if (req.url.startsWith('/uploads/') && res.statusCode < 400) return true
      return false
    },
  })
}

/**
 * Middleware de logging estándar (fallback)
 * @returns {Function} Middleware de Morgan estándar
 */
const standardLogger = () => {
  return morgan('combined', {
    stream: morganStream,
    skip: (req, res) => {
      return req.url === '/api/health'
    },
  })
}

/**
 * Middleware de logging solo para errores
 * @returns {Function} Middleware de Morgan solo para errores
 */
const errorOnlyLogger = () => {
  return morgan('combined', {
    stream: morganStream,
    skip: (req, res) => {
      return res.statusCode < 400
    },
  })
}

/**
 * Middleware para agregar información de timing a las requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const addRequestTiming = (req, res, next) => {
  req.startTime = Date.now()

  // Interceptar el final de la response para calcular tiempo
  const originalSend = res.send
  res.send = function (data) {
    res.responseTime = Date.now() - req.startTime
    return originalSend.call(this, data)
  }

  next()
}

/**
 * Middleware para logging de requests específicos (autenticación, uploads, etc.)
 * @param {string} category - Categoría del log
 * @returns {Function} Middleware de logging específico
 */
const categoryLogger = (category) => {
  return (req, res, next) => {
    const startTime = Date.now()

    // Log del inicio de la request
    logger.info(`${category} request iniciada`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || null,
      category,
    })

    // Interceptar el final de la response
    const originalSend = res.send
    res.send = function (data) {
      const responseTime = Date.now() - startTime

      // Log del final de la request
      logger.info(`${category} request completada`, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
        userId: req.user?.id || null,
        category,
      })

      return originalSend.call(this, data)
    }

    next()
  }
}

/**
 * Obtener el middleware de logging apropiado según el entorno
 * @param {string} environment - Entorno de ejecución
 * @returns {Function} Middleware de logging apropiado
 */
const getRequestLogger = (environment = process.env.NODE_ENV) => {
  switch (environment) {
    case 'production':
      return productionLogger()
    case 'development':
      return developmentLogger()
    case 'test':
      return errorOnlyLogger()
    default:
      return standardLogger()
  }
}

module.exports = {
  developmentLogger,
  productionLogger,
  standardLogger,
  errorOnlyLogger,
  addRequestTiming,
  categoryLogger,
  getRequestLogger,
  morganStream,
}
