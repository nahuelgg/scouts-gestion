const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

const connectDB = require('./config/database')

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
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Máximo 1000 requests por ventana de tiempo (aumentado para desarrollo)
  message: 'Demasiadas solicitudes desde esta IP',
})
app.use(limiter)

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://tu-dominio.com']
        : ['http://localhost:3000'],
    credentials: true,
  })
)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Rutas
app.use('/api/auth', authRoutes)
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
  console.error(err.stack)
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
  console.log(`Servidor ejecutándose en puerto ${PORT}`)
})
