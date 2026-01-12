const logger = require('../../utils/logger')

class AlertService {
  constructor() {
    this.alerts = []
    this.alertThresholds = {
      errorRate: 10,
      memoryUsage: 90,
      responseTime: 5000,
      freeMemory: 10
    }
  }

  createAlert(type, message, severity = 'medium', metadata = {}) {
    const alert = {
      id: this.generateAlertId(),
      type,
      message,
      severity,
      timestamp: Date.now(),
      status: 'active',
      metadata
    }

    this.alerts.push(alert)
    
    if (this.alerts.length > 100) {
      this.alerts.shift()
    }

    logger.warn(`Alerta creada: [${severity.toUpperCase()}] ${type} - ${message}`)
    return alert
  }

  getActiveAlerts() {
    return this.alerts.filter(alert => alert.status === 'active')
  }

  getAllAlerts() {
    return this.alerts
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'resolved'
      alert.resolvedAt = Date.now()
      logger.info(`Alerta resuelta: ${alertId}`)
      return alert
    }
    return null
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

const alertService = new AlertService()
module.exports = alertService
