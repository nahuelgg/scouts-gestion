const monitoringService = require('../services/monitoring/MonitoringService')
const alertService = require('../services/monitoring/AlertService')
const logger = require('../utils/logger')

const getMonitoringStats = async (req, res) => {
  try {
    const stats = monitoringService.getStats()
    const alertStats = alertService.getAlertStats(24)

    res.json({
      monitoring: stats,
      alerts: alertStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error obteniendo stats de monitoreo:', error)
    res.status(500).json({ error: 'Error obteniendo estadísticas' })
  }
}

const getAlerts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const level = req.query.level

    const alerts = alertService.getAlertHistory(limit, level)
    const stats = alertService.getAlertStats(24)

    res.json({
      alerts,
      stats,
      total: alerts.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error obteniendo alertas:', error)
    res.status(500).json({ error: 'Error obteniendo alertas' })
  }
}

const forceMonitoringCheck = async (req, res) => {
  try {
    await monitoringService.forceHealthCheck()

    res.json({
      message: 'Health check forzado ejecutado',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error forzando health check:', error)
    res.status(500).json({ error: 'Error ejecutando health check' })
  }
}

const testNotifications = async (req, res) => {
  try {
    const results = await alertService.testNotifications()

    res.json({
      message: 'Test de notificaciones completado',
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error en test de notificaciones:', error)
    res.status(500).json({ error: 'Error testando notificaciones' })
  }
}

const sendTestAlert = async (req, res) => {
  try {
    const { level = 'warning', title, message } = req.body

    if (!title || !message) {
      return res.status(400).json({
        error: 'title y message son requeridos',
      })
    }

    const alertData = {
      source: 'manual-test',
      title,
      message,
      details: {
        triggeredBy: req.user?.username || 'unknown',
        timestamp: new Date().toISOString(),
        test: true,
      },
    }

    let alert
    if (level === 'critical') {
      alert = await alertService.sendCriticalAlert(alertData)
    } else {
      alert = await alertService.sendWarningAlert(alertData)
    }

    res.json({
      message: 'Alerta de test enviada',
      alert,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error enviando alerta de test:', error)
    res.status(500).json({ error: 'Error enviando alerta' })
  }
}

const getMonitoringConfig = async (req, res) => {
  try {
    const config = {
      alerts: {
        email: {
          enabled: !!process.env.SMTP_HOST,
          recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
        },
        slack: {
          enabled: !!process.env.SLACK_WEBHOOK_URL,
        },
      },
      thresholds: {
        memoryUsagePercent: parseInt(process.env.MEMORY_ALERT_THRESHOLD) || 85,
        diskUsagePercent: parseInt(process.env.DISK_ALERT_THRESHOLD) || 90,
        databaseResponseTime:
          parseInt(process.env.DB_RESPONSE_THRESHOLD) || 1000,
      },
      intervals: {
        healthCheckInterval:
          parseInt(process.env.HEALTH_CHECK_INTERVAL) || 60000,
        alertCheckInterval: parseInt(process.env.ALERT_CHECK_INTERVAL) || 30000,
      },
    }

    res.json({
      config,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error obteniendo configuración:', error)
    res.status(500).json({ error: 'Error obteniendo configuración' })
  }
}

module.exports = {
  getMonitoringStats,
  getAlerts,
  forceMonitoringCheck,
  testNotifications,
  sendTestAlert,
  getMonitoringConfig,
}
