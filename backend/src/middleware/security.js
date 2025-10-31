const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const logger = require('../utils/logger')

/**
 * Configuración de Helmet para seguridad HTTP
 * @param {Object} config - Objeto de configuración con URLs y orígenes
 * @returns {Function} Middleware de helmet configurado
 */
const createHelmetMiddleware = (config) => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        scriptSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          config.BACKEND_URL,
          config.FRONTEND_URL,
          ...config.CORS_ORIGINS,
        ],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: {
      policy: 'cross-origin', // Permitir acceso cross-origin a recursos
    },
    crossOriginEmbedderPolicy: false, // Permitir embebido de recursos externos
    crossOriginOpenerPolicy: false, // Permitir apertura de ventanas cross-origin
  })
}

/**
 * Configuración de Rate Limiting
 * @param {Object} config - Configuración con límites de rate
 * @returns {Function} Middleware de rate limiting
 */
const createRateLimitMiddleware = (config) => {
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutos por defecto
    max: config.RATE_LIMIT_MAX || 100, // 100 requests por defecto
    message: {
      success: false,
      message:
        'Demasiadas solicitudes desde esta IP. Intenta de nuevo más tarde.',
    },
    standardHeaders: true, // Retorna rate limit info en headers `RateLimit-*`
    legacyHeaders: false, // Desactiva headers `X-RateLimit-*`
    skip: (req) => {
      // Skip rate limiting para health checks
      return req.path === '/api/health'
    },
    handler: (req, res) => {
      logger.warn('Rate limit excedido', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
      })

      res.status(429).json({
        success: false,
        message:
          'Demasiadas solicitudes desde esta IP. Intenta de nuevo más tarde.',
        retryAfter: Math.round(config.RATE_LIMIT_WINDOW / 1000),
      })
    },
  })

  return limiter
}

/**
 * Configuración más estricta de Rate Limiting para autenticación
 * @param {Object} config - Configuración con límites de rate
 * @returns {Function} Middleware de rate limiting para auth
 */
const createAuthRateLimitMiddleware = (config) => {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Solo 5 intentos de login por IP cada 15 minutos
    message: {
      success: false,
      message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit de autenticación excedido', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        body: { username: req.body?.username }, // Log username sin password
      })

      res.status(429).json({
        success: false,
        message:
          'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
        retryAfter: 15 * 60,
      })
    },
  })

  return authLimiter
}

/**
 * Configuración de CORS
 * @param {Object} config - Configuración con orígenes y métodos permitidos
 * @returns {Function} Middleware de CORS
 */
const createCorsMiddleware = (config) => {
  const corsOptions = {
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, postman, etc.)
      if (!origin) return callback(null, true)

      const allowedOrigins =
        process.env.NODE_ENV === 'production'
          ? config.PRODUCTION_ORIGINS
          : config.CORS_ORIGINS

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        logger.warn('Origen CORS no permitido', {
          origin: origin,
          allowedOrigins: allowedOrigins,
          nodeEnv: process.env.NODE_ENV,
        })

        callback(new Error('No permitido por CORS'), false)
      }
    },
    credentials: true,
    methods: config.CORS_METHODS || [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
    ],
    allowedHeaders: config.CORS_HEADERS || [
      'Content-Type',
      'Authorization',
      'x-requested-with',
      'Access-Control-Allow-Origin',
    ],
    exposedHeaders: ['set-cookie'],
    optionsSuccessStatus: 200, // Para soporte de navegadores legacy (IE11, various SmartTVs)
  }

  return cors(corsOptions)
}

/**
 * Middleware para manejar preflight requests manualmente
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const handlePreflightRequests = (req, res) => {
  logger.debug('Preflight request manejado', {
    origin: req.headers.origin,
    method: req.headers['access-control-request-method'],
    headers: req.headers['access-control-request-headers'],
  })

  res.status(200).end()
}

/**
 * Middleware de seguridad adicional
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const additionalSecurity = (req, res, next) => {
  // Remover headers que revelan información del servidor
  res.removeHeader('X-Powered-By')

  // Agregar headers de seguridad adicionales
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Cache control para rutas de API
  if (req.path.startsWith('/api/')) {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  }

  next()
}

module.exports = {
  createHelmetMiddleware,
  createRateLimitMiddleware,
  createAuthRateLimitMiddleware,
  createCorsMiddleware,
  handlePreflightRequests,
  additionalSecurity,
}
