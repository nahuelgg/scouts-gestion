const healthCheckService = require('../services/health/HealthCheckService')
const logger = require('../utils/logger')

const getFullHealth = async (req, res) => {
  try {
    const health = await healthCheckService.getSystemHealth()

    // Log si hay problemas
    if (health.status !== 'healthy') {
      logger.warn('Sistema con problemas detectados:', {
        status: health.status,
        timestamp: health.timestamp,
        checks: Object.keys(health.checks).filter(
          (key) => health.checks[key].status !== 'healthy'
        ),
      })
    }

    // Enviar respuesta con código HTTP apropiado
    const statusCode =
      health.status === 'healthy'
        ? 200
        : health.status === 'warning'
        ? 200
        : 503

    res.status(statusCode).json(health)
  } catch (error) {
    logger.error('Error en health check completo:', error)
    res.status(503).json({
      status: 'critical',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    })
  }
}

const getLiveness = async (req, res) => {
  try {
    const health = await healthCheckService.getQuickHealth()

    const statusCode = health.status === 'healthy' ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    logger.error('Error en liveness check:', error)
    res.status(503).json({
      status: 'critical',
      error: 'Liveness check failed',
    })
  }
}

const getReadiness = async (req, res) => {
  try {
    const health = await healthCheckService.getSystemHealth()

    // Para readiness, solo critical es no-ready
    const isReady = health.status !== 'critical'
    const statusCode = isReady ? 200 : 503

    res.status(statusCode).json({
      status: isReady ? 'ready' : 'not_ready',
      timestamp: health.timestamp,
      summary: health.summary,
      ready: isReady,
    })
  } catch (error) {
    logger.error('Error en readiness check:', error)
    res.status(503).json({
      status: 'not_ready',
      error: 'Readiness check failed',
    })
  }
}

const getHealthHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const history = healthCheckService.getHealthHistory(limit)

    res.json({
      history,
      count: history.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error obteniendo historial de health:', error)
    res.status(500).json({
      error: 'Error obteniendo historial',
      timestamp: new Date().toISOString(),
    })
  }
}

const getMetrics = async (req, res) => {
  try {
    const health = await healthCheckService.getSystemHealth()

    // Extraer solo métricas numéricas para monitoreo
    const metrics = {
      timestamp: health.timestamp,
      status: health.status,
      uptime_seconds: health.summary.uptime,
      database: {
        response_time_ms: health.checks.database?.responseTime || -1,
        collections_count: health.checks.database?.collections || 0,
        indexes_count: health.checks.database?.indexes || 0,
      },
      memory: {
        system_used_mb: health.checks.system?.memory?.used || 0,
        system_usage_percent: health.checks.system?.memory?.usagePercent || 0,
        process_heap_mb: health.checks.system?.process?.heapUsed || 0,
      },
      files: {
        total_files: health.checks.files?.totalFiles || 0,
        total_size_mb: health.checks.files?.totalSize || 0,
      },
    }

    res.json(metrics)
  } catch (error) {
    logger.error('Error obteniendo métricas:', error)
    res.status(500).json({
      error: 'Error obteniendo métricas',
    })
  }
}

module.exports = {
  getFullHealth,
  getLiveness,
  getReadiness,
  getHealthHistory,
  getMetrics,
}
