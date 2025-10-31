const os = require('os')
const logger = require('../../utils/logger')

/**
 * Servicio de Monitoreo del Sistema
 * Recopila métricas de rendimiento y estado del sistema
 */
class MonitoringService {
  constructor() {
    this.startTime = Date.now()
    this.requestCount = 0
    this.errorCount = 0
    this.responseTimeHistory = []
  }

  /**
   * Incrementar contador de requests
   */
  incrementRequestCount() {
    this.requestCount++
  }

  /**
   * Incrementar contador de errores
   */
  incrementErrorCount() {
    this.errorCount++
  }

  /**
   * Registrar tiempo de respuesta
   */
  recordResponseTime(responseTime) {
    this.responseTimeHistory.push({
      time: Date.now(),
      duration: responseTime,
    })

    // Mantener solo los últimos 1000 registros
    if (this.responseTimeHistory.length > 1000) {
      this.responseTimeHistory.shift()
    }
  }

  /**
   * Obtener estadísticas del sistema
   */
  getSystemStats() {
    const now = Date.now()
    const uptime = now - this.startTime

    // Calcular tiempo de respuesta promedio
    const recentResponses = this.responseTimeHistory.filter(
      (record) => now - record.time < 300000
    ) // Últimos 5 minutos

    const avgResponseTime =
      recentResponses.length > 0
        ? recentResponses.reduce((sum, record) => sum + record.duration, 0) /
          recentResponses.length
        : 0

    return {
      uptime,
      requests: this.requestCount,
      errors: this.errorCount,
      errorRate:
        this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss,
      },
      cpu: {
        loadAverage: os.loadavg(),
        cpuCount: os.cpus().length,
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        freeMem: os.freemem(),
        totalMem: os.totalmem(),
      },
    }
  }

  /**
   * Obtener métricas de salud
   */
  getHealthMetrics() {
    const stats = this.getSystemStats()

    return {
      status: this.getHealthStatus(stats),
      uptime: stats.uptime,
      requests: stats.requests,
      errors: stats.errors,
      errorRate: stats.errorRate,
      avgResponseTime: stats.avgResponseTime,
      memoryUsage: Math.round((stats.memory.used / stats.memory.total) * 100),
      freeMemory: Math.round(
        (stats.system.freeMem / stats.system.totalMem) * 100
      ),
    }
  }

  /**
   * Determinar estado de salud del sistema
   */
  getHealthStatus(stats) {
    const memoryUsagePercent = (stats.memory.used / stats.memory.total) * 100
    const freeMemoryPercent =
      (stats.system.freeMem / stats.system.totalMem) * 100

    // Criterios de salud
    if (
      stats.errorRate > 10 ||
      memoryUsagePercent > 90 ||
      freeMemoryPercent < 10
    ) {
      return 'critical'
    } else if (
      stats.errorRate > 5 ||
      memoryUsagePercent > 75 ||
      freeMemoryPercent < 20
    ) {
      return 'warning'
    } else {
      return 'healthy'
    }
  }

  /**
   * Reset de estadísticas
   */
  resetStats() {
    this.requestCount = 0
    this.errorCount = 0
    this.responseTimeHistory = []
    logger.info('Estadísticas de monitoreo reseteadas')
  }

  /**
   * Iniciar servicio de monitoreo
   */
  start() {
    logger.info('Servicio de monitoreo iniciado correctamente')
    return this
  }
}

// Exportar instancia singleton
const monitoringService = new MonitoringService()
module.exports = monitoringService
