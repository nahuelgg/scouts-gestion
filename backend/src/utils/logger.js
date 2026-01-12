const winston = require('winston')
const path = require('path')
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`
  })
)
const logsDir = path.join(__dirname, '../../logs')
require('fs').mkdirSync(logsDir, { recursive: true })

// Configuración de transports
const transports = []

// Siempre agregar archivos de log
transports.push(
  // Log de errores
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Log general
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
)

// En desarrollo, agregar consola
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  )
}
const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports,

  // No salir en errores no capturados
  exitOnError: false,
})

// Métodos de conveniencia
const loggerMethods = {
  error: (message, meta = {}) => {
    logger.error(message, meta)
  },

  warn: (message, meta = {}) => {
    logger.warn(message, meta)
  },

  info: (message, meta = {}) => {
    logger.info(message, meta)
  },

  debug: (message, meta = {}) => {
    logger.debug(message, meta)
  },

  // Método para Morgan (HTTP logging)
  http: (message, meta = {}) => {
    logger.info(message, meta)
  },

  // Métodos específicos para la aplicación
  server: (message, meta = {}) => {
    logger.info(`[SERVER] ${message}`, meta)
  },

  database: (message, meta = {}) => {
    logger.info(`[DATABASE] ${message}`, meta)
  },

  auth: (message, meta = {}) => {
    logger.info(`[AUTH] ${message}`, meta)
  },

  api: (message, meta = {}) => {
    logger.debug(`[API] ${message}`, meta)
  },

  // Para requests HTTP
  request: (req, res, responseTime) => {
    const { method, url, ip } = req
    const { statusCode } = res

    logger.info(`${method} ${url}`, {
      method,
      url,
      statusCode,
      responseTime,
      ip,
      userAgent: req.get('User-Agent'),
    })
  },

  // Para errores de seguridad
  security: (message, meta = {}) => {
    logger.warn(`[SECURITY] ${message}`, meta)
  },
}

// Capturar excepciones no manejadas
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat,
    })
  )

  process.on('unhandledRejection', (ex) => {
    throw ex
  })
}

module.exports = loggerMethods
