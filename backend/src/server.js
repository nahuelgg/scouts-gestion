const express = require('express')
const path = require('path')
require('dotenv').config()

const connectDB = require('./config/database')
const { showConfigStatus } = require('./utils/configValidator')
const logger = require('./utils/logger')

// Middlewares centralizados
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

// Validar configuración antes de iniciar el servidor
showConfigStatus()

// Configuración centralizada
const CONFIG = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
  CORS_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  CORS_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  CORS_HEADERS: ['Content-Type', 'Authorization', 'x-requested-with'],
  CACHE_MAX_AGE: process.env.CACHE_MAX_AGE || '31536000', // 1 año por defecto

  // Configuración de rate limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // 1000 requests

  // Configuración de body parser
  BODY_LIMIT: process.env.BODY_LIMIT || '10mb',

  // Configuración de producción
  PRODUCTION_ORIGINS: process.env.PRODUCTION_ORIGINS?.split(',') || [
    'https://tu-dominio.com',
  ],
}

// Función helper para configurar headers CORS
const setCorsHeaders = (res, methods = ['GET', 'OPTIONS']) => {
  res.header('Access-Control-Allow-Origin', CONFIG.FRONTEND_URL)
  res.header('Access-Control-Allow-Methods', methods.join(', '))
  res.header('Access-Control-Allow-Headers', CONFIG.CORS_HEADERS.join(', '))
  res.header('Access-Control-Allow-Credentials', 'true')
}

// Función helper para configurar Content-Type basado en extensión
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

// Importar rutas
const authRoutes = require('./routes/auth')
const personaRoutes = require('./routes/personas')
const pagoRoutes = require('./routes/pagos')
const ramaRoutes = require('./routes/ramas')
const usuarioRoutes = require('./routes/usuarios')

const app = express()

// Conectar a la base de datos
connectDB()

// Middleware de seguridad
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
    // Configurar headers CORS específicos para archivos estáticos
    setCorsHeaders(res)

    // Headers específicos para permitir el acceso cross-origin a imágenes
    res.header('Cross-Origin-Resource-Policy', 'cross-origin')
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none')

    // Configurar headers de cache
    res.header('Cache-Control', `public, max-age=${CONFIG.CACHE_MAX_AGE}`)
    res.header(
      'Expires',
      new Date(Date.now() + parseInt(CONFIG.CACHE_MAX_AGE) * 1000).toUTCString()
    )

    // Configurar Content-Type basado en la extensión del archivo
    setContentType(res, req.path)

    next()
  },
  express.static(path.join(__dirname, '../uploads'))
)

// Rutas con rate limiting específico
app.use('/api/auth', createAuthRateLimitMiddleware(CONFIG), authRoutes)
app.use('/api/personas', personaRoutes)
app.use('/api/pagos', pagoRoutes)
app.use('/api/ramas', ramaRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/roles', require('./routes/roles'))

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Sistema de gestión Scouts API funcionando',
    timestamp: new Date().toISOString(),
  })
})

// Middleware de manejo de errores
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

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  logger.server(`Servidor ejecutándose en puerto ${PORT}`)
  logger.info(`Entorno: ${process.env.NODE_ENV}`)
  logger.info(`Frontend URL: ${CONFIG.FRONTEND_URL}`)
})
