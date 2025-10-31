const express = require('express')
const router = express.Router()
const {
  getMonitoringStats,
  getAlerts,
  forceMonitoringCheck,
  testNotifications,
  sendTestAlert,
  getMonitoringConfig,
} = require('../controllers/monitoringController')

// Middleware de autenticación
const { protect } = require('../middleware/auth')

// Todas las rutas de monitoreo requieren autenticación
router.use(protect)

/**
 * @route   GET /api/monitoring/stats
 * @desc    Estadísticas del sistema de monitoreo
 * @access  Private
 */
router.get('/stats', getMonitoringStats)

/**
 * @route   GET /api/monitoring/alerts
 * @desc    Historial de alertas
 * @access  Private
 */
router.get('/alerts', getAlerts)

/**
 * @route   GET /api/monitoring/config
 * @desc    Configuración del sistema de monitoreo
 * @access  Private
 */
router.get('/config', getMonitoringConfig)

/**
 * @route   POST /api/monitoring/check
 * @desc    Forzar ejecución de health check
 * @access  Private
 */
router.post('/check', forceMonitoringCheck)

/**
 * @route   POST /api/monitoring/test-notifications
 * @desc    Test de conectividad de notificaciones
 * @access  Private
 */
router.post('/test-notifications', testNotifications)

/**
 * @route   POST /api/monitoring/test-alert
 * @desc    Enviar alerta de prueba
 * @access  Private
 */
router.post('/test-alert', sendTestAlert)

module.exports = router
