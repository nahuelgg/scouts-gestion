const os = require('os')
const logger = require('../../utils/logger')

class MonitoringService {
  constructor() {
    this.startTime = Date.now()
    this.requestCount = 0
    this.errorCount = 0
    this.responseTimeHistory = []
  }

  incrementRequestCount() {
    this.requestCount++
  }

  incrementErrorCount() {
    this.errorCount++
  }

  recordResponseTime(responseTime) {
    this.responseTimeHistory.push({
      time: Date.now(),
      duration: responseTime,
    })

    if (this.responseTimeHistory.length > 1000) {
      this.responseTimeHistory.shift()
    }
  }

  getSystemStats() {
    const now = Date.now()
    const uptime = now - this.startTime

    const recentResponses = this.responseTimeHistory.filter(
      (record) => now - record.time < 300000
    )

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

  getHealthStatus(stats) {
    const memoryUsagePercent = (stats.memory.used / stats.memory.total) * 100
    const freeMemoryPercent =
      (stats.system.freeMem / stats.system.totalMem) * 100

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

  resetStats() {
    this.requestCount = 0
    this.errorCount = 0
    this.responseTimeHistory = []
    logger.info('Estadísticas de monitoreo reseteadas')
  }

  start() {
    logger.info('Servicio de monitoreo iniciado correctamente')
    return this
  }
}

const monitoringService = new MonitoringService()
module.exports = monitoringService
