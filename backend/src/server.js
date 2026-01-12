const express = require('express')
const path = require('path')
require('dotenv').config()

const connectDB = require('./config/database')
const logger = require('./utils/logger')

const {
  createHelmetMiddleware,
  createRateLimitMiddleware,
  createAuthRateLimitMiddleware,
  createCorsMiddleware,
  handlePreflightRequests,
  additionalSecurity,
} = require('./middleware/security')
const {
  getRequestLogger,
  addRequestTiming,
} = require('./middleware/requestLogger')

const CONFIG = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
  CORS_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost',
    'http://localhost:80',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  CORS_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  CORS_HEADERS: ['Content-Type', 'Authorization', 'x-requested-with'],
  CACHE_MAX_AGE: process.env.CACHE_MAX_AGE || '31536000',
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
  BODY_LIMIT: process.env.BODY_LIMIT || '10mb',
  PRODUCTION_ORIGINS: process.env.PRODUCTION_ORIGINS?.split(',') || [
    'https://tu-dominio.com',
  ],
}

const setCorsHeaders = (res, methods = ['GET', 'OPTIONS']) => {
  res.header('Access-Control-Allow-Origin', CONFIG.FRONTEND_URL)
  res.header('Access-Control-Allow-Methods', methods.join(', '))
  res.header('Access-Control-Allow-Headers', CONFIG.CORS_HEADERS.join(', '))
  res.header('Access-Control-Allow-Credentials', 'true')
}

const setContentType = (res, filePath) => {
  if (filePath.endsWith('.png')) {
    res.setHeader('Content-Type', 'image/png')
  } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
    res.setHeader('Content-Type', 'image/jpeg')
  } else if (filePath.endsWith('.pdf')) {
    res.setHeader('Content-Type', 'application/pdf')
  } else if (filePath.endsWith('.gif')) {
    res.setHeader('Content-Type', 'image/gif')
  } else if (filePath.endsWith('.webp')) {
    res.setHeader('Content-Type', 'image/webp')
  }
}

const authRoutes = require('./routes/auth')
const personaRoutes = require('./routes/personas')
const pagoRoutes = require('./routes/pagos')
const ramaRoutes = require('./routes/ramas')
const usuarioRoutes = require('./routes/usuarios')

const app = express()

connectDB()
app.use(additionalSecurity)
app.use(createHelmetMiddleware(CONFIG))

// Rate limiting
app.use(createRateLimitMiddleware(CONFIG))

// CORS
app.use(createCorsMiddleware(CONFIG))

// Body parsing middleware
app.use(express.json({ limit: CONFIG.BODY_LIMIT }))
app.use(express.urlencoded({ extended: true }))

// Middleware adicional para manejar preflight requests
app.options('*', handlePreflightRequests)

// Request timing y logging
app.use(addRequestTiming)
app.use(getRequestLogger())

// Servir archivos estáticos (uploads) con configuración CORS específica
app.use(
  '/uploads',
  (req, res, next) => {
    setCorsHeaders(res)
    res.header('Cross-Origin-Resource-Policy', 'cross-origin')
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none')
    res.header('Cache-Control', `public, max-age=${CONFIG.CACHE_MAX_AGE}`)
    res.header(
      'Expires',
      new Date(Date.now() + parseInt(CONFIG.CACHE_MAX_AGE) * 1000).toUTCString()
    )
    setContentType(res, req.path)

    next()
  },
  express.static(path.join(__dirname, '../uploads'))
)

app.use('/api/auth', createAuthRateLimitMiddleware(CONFIG), authRoutes)
app.use('/api/personas', personaRoutes)
app.use('/api/pagos', pagoRoutes)
app.use('/api/ramas', ramaRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/roles', require('./routes/roles'))
app.use('/api/health', require('./routes/health'))
app.use('/api/monitoring', require('./routes/monitoring'))
app.use((err, req, res, next) => {
  logger.error('Error no manejado:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  })

  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  })
})

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  logger.server(`Servidor ejecutándose en puerto ${PORT}`)
  logger.info(`Entorno: ${process.env.NODE_ENV}`)
  logger.info(`Frontend URL: ${CONFIG.FRONTEND_URL}`)

  setTimeout(() => {
    const monitoringService = require('./services/monitoring/MonitoringService')
    monitoringService.start()
  }, 2000)
})
