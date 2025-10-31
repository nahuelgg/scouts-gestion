const logger = require('../../utils/logger')

/**
 * Servicio de Alertas del Sistema
 * Gestiona alertas críticas y notificaciones
 */
class AlertService {
  constructor() {
    this.alerts = []
    this.alertThresholds = {
      errorRate: 10,
      memoryUsage: 90,
      responseTime: 5000,
      freeMemory: 10,
    }
  }

  /**
   * Crear una nueva alerta
   */
  createAlert(type, message, severity = 'medium', metadata = {}) {
    const alert = {
      id: this.generateAlertId(),
      type,
      message,
      severity, // 'low', 'medium', 'high', 'critical'
      timestamp: Date.now(),
      status: 'active',
      metadata,
    }

    this.alerts.push(alert)

    // Mantener solo las últimas 100 alertas
    if (this.alerts.length > 100) {
      this.alerts.shift()
    }

    logger.warn(
      `Alerta creada: [${severity.toUpperCase()}] ${type} - ${message}`
    )
    return alert
  }

  /**
   * Obtener todas las alertas activas
   */
  getActiveAlerts() {
    return this.alerts.filter((alert) => alert.status === 'active')
  }

  /**
   * Obtener todas las alertas
   */
  getAllAlerts() {
    return this.alerts
  }

  /**
   * Resolver una alerta
   */
  resolveAlert(alertId) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.status = 'resolved'
      alert.resolvedAt = Date.now()
      logger.info(`Alerta resuelta: ${alertId}`)
      return alert
    }
    return null
  }

  /**
   * Verificar métricas y crear alertas si es necesario
   */
  checkMetrics(stats) {
    const alerts = []

    // Verificar rate de errores
    if (stats.errorRate > this.alertThresholds.errorRate) {
      alerts.push(
        this.createAlert(
          'HIGH_ERROR_RATE',
          `Tasa de errores alta: ${stats.errorRate.toFixed(2)}%`,
          'high',
          {
            errorRate: stats.errorRate,
            threshold: this.alertThresholds.errorRate,
          }
        )
      )
    }

    // Verificar uso de memoria
    const memoryUsagePercent = (stats.memory.used / stats.memory.total) * 100
    if (memoryUsagePercent > this.alertThresholds.memoryUsage) {
      alerts.push(
        this.createAlert(
          'HIGH_MEMORY_USAGE',
          `Uso de memoria alto: ${memoryUsagePercent.toFixed(2)}%`,
          'critical',
          {
            memoryUsage: memoryUsagePercent,
            threshold: this.alertThresholds.memoryUsage,
          }
        )
      )
    }

    // Verificar tiempo de respuesta
    if (stats.avgResponseTime > this.alertThresholds.responseTime) {
      alerts.push(
        this.createAlert(
          'SLOW_RESPONSE_TIME',
          `Tiempo de respuesta lento: ${stats.avgResponseTime}ms`,
          'medium',
          {
            responseTime: stats.avgResponseTime,
            threshold: this.alertThresholds.responseTime,
          }
        )
      )
    }

    // Verificar memoria libre del sistema
    const freeMemoryPercent =
      (stats.system.freeMem / stats.system.totalMem) * 100
    if (freeMemoryPercent < this.alertThresholds.freeMemory) {
      alerts.push(
        this.createAlert(
          'LOW_SYSTEM_MEMORY',
          `Memoria libre del sistema baja: ${freeMemoryPercent.toFixed(2)}%`,
          'critical',
          {
            freeMemory: freeMemoryPercent,
            threshold: this.alertThresholds.freeMemory,
          }
        )
      )
    }

    return alerts
  }

  /**
   * Obtener resumen de alertas por severidad
   */
  getAlertSummary() {
    const activeAlerts = this.getActiveAlerts()

    return {
      total: activeAlerts.length,
      critical: activeAlerts.filter((a) => a.severity === 'critical').length,
      high: activeAlerts.filter((a) => a.severity === 'high').length,
      medium: activeAlerts.filter((a) => a.severity === 'medium').length,
      low: activeAlerts.filter((a) => a.severity === 'low').length,
    }
  }

  /**
   * Configurar umbrales de alerta
   */
  setThresholds(newThresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds }
    logger.info('Umbrales de alerta actualizados:', this.alertThresholds)
  }

  /**
   * Limpiar alertas resueltas más antiguas
   */
  cleanupResolvedAlerts(olderThanHours = 24) {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000
    const initialCount = this.alerts.length

    this.alerts = this.alerts.filter((alert) => {
      return (
        alert.status === 'active' ||
        (alert.status === 'resolved' && alert.resolvedAt > cutoffTime)
      )
    })

    const removed = initialCount - this.alerts.length
    if (removed > 0) {
      logger.info(`Limpieza de alertas: ${removed} alertas antiguas eliminadas`)
    }
  }

  /**
   * Generar ID único para alerta
   */
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Exportar instancia singleton
const alertService = new AlertService()
module.exports = alertService
