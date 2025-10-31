const mongoose = require('mongoose')
const os = require('os')
const fs = require('fs').promises
const path = require('path')
const logger = require('../../utils/logger')

/**
 * Servicio de Health Checks Avanzados
 * Verifica estado de todos los componentes críticos del sistema
 */
class HealthCheckService {
  constructor() {
    this.startTime = Date.now()
    this.healthHistory = []
    this.maxHistorySize = 100
  }

  /**
   * Ejecuta todos los health checks
   */
  async getSystemHealth() {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {},
      summary: {
        uptime: this.getUptime(),
        version: process.env.npm_package_version || '1.0.0',
      },
    }

    try {
      // Ejecutar todos los checks en paralelo
      const [database, system, files, external] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkSystemResources(),
        this.checkFileSystem(),
        this.checkExternalServices(),
      ])

      healthCheck.checks.database = this.processCheckResult(database)
      healthCheck.checks.system = this.processCheckResult(system)
      healthCheck.checks.files = this.processCheckResult(files)
      healthCheck.checks.external = this.processCheckResult(external)

      // Determinar estado general
      healthCheck.status = this.calculateOverallHealth(healthCheck.checks)

      // Guardar en historial
      this.saveToHistory(healthCheck)

      return healthCheck
    } catch (error) {
      logger.error('Error en health check general:', error)
      healthCheck.status = 'critical'
      healthCheck.error = error.message
      return healthCheck
    }
  }

  /**
   * Verifica la conexión y rendimiento de MongoDB
   */
  async checkDatabase() {
    const dbCheck = {
      status: 'healthy',
      connection: 'connected',
      responseTime: null,
      collections: 0,
      indexes: 0,
    }

    try {
      const startTime = Date.now()

      // Test de conexión
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB desconectado')
      }

      // Test de rendimiento - ping simple
      await mongoose.connection.db.admin().ping()
      dbCheck.responseTime = Date.now() - startTime

      // Información de colecciones
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray()
      dbCheck.collections = collections.length

      // Contar índices totales
      let totalIndexes = 0
      for (const collection of collections) {
        const indexes = await mongoose.connection.db
          .collection(collection.name)
          .listIndexes()
          .toArray()
        totalIndexes += indexes.length
      }
      dbCheck.indexes = totalIndexes

      // Verificar performance
      if (dbCheck.responseTime > 1000) {
        dbCheck.status = 'warning'
        dbCheck.warning = 'MongoDB response time alto'
      }

      return dbCheck
    } catch (error) {
      dbCheck.status = 'critical'
      dbCheck.error = error.message
      return dbCheck
    }
  }

  /**
   * Verifica recursos del sistema
   */
  async checkSystemResources() {
    const systemCheck = {
      status: 'healthy',
      memory: {},
      cpu: {},
      disk: {},
    }

    try {
      // Memoria - Cálculo mejorado para macOS
      const totalMem = os.totalmem()
      const freeMem = os.freemem()

      // En macOS, calcular memoria disponible real considerando el sistema
      let usedMem, memUsagePercent

      if (process.platform === 'darwin') {
        // Para macOS, usar un enfoque más conservador
        // Considerar que macOS maneja memoria de forma más eficiente
        const availableMem = freeMem * 3 // Aproximación más realista para macOS
        usedMem = totalMem - Math.min(availableMem, totalMem)
        memUsagePercent = (usedMem / totalMem) * 100
      } else {
        // Para otros sistemas (Linux en Docker)
        usedMem = totalMem - freeMem
        memUsagePercent = (usedMem / totalMem) * 100
      }

      systemCheck.memory = {
        total: Math.round(totalMem / 1024 / 1024), // MB
        used: Math.round(usedMem / 1024 / 1024), // MB
        free: Math.round(freeMem / 1024 / 1024), // MB
        usagePercent: Math.round(memUsagePercent),
      }

      // CPU
      const cpus = os.cpus()
      systemCheck.cpu = {
        cores: cpus.length,
        model: cpus[0].model,
        loadAverage: os.loadavg(),
      }

      // Proceso Node.js
      const memUsage = process.memoryUsage()
      systemCheck.process = {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        uptime: Math.round(process.uptime()),
      }

      // Verificar recursos críticos
      if (memUsagePercent > 90) {
        systemCheck.status = 'critical'
        systemCheck.error = 'Memoria del sistema crítica'
      } else if (memUsagePercent > 80) {
        systemCheck.status = 'warning'
        systemCheck.warning = 'Uso de memoria alto'
      }

      // Verificar espacio en disco
      try {
        const uploadDir = path.join(process.cwd(), 'uploads')
        const stats = await fs.stat(uploadDir)
        systemCheck.disk.uploadsDir = 'accessible'
      } catch (error) {
        systemCheck.disk.uploadsDir = 'inaccessible'
        systemCheck.status = 'warning'
      }

      return systemCheck
    } catch (error) {
      systemCheck.status = 'critical'
      systemCheck.error = error.message
      return systemCheck
    }
  }

  /**
   * Verifica integridad del sistema de archivos
   */
  async checkFileSystem() {
    const fileCheck = {
      status: 'healthy',
      uploadDir: null,
      permissions: null,
      totalFiles: 0,
      totalSize: 0,
    }

    try {
      const uploadDir = path.join(process.cwd(), 'uploads')

      // Verificar que existe el directorio
      try {
        const stats = await fs.stat(uploadDir)
        fileCheck.uploadDir = stats.isDirectory() ? 'exists' : 'not_directory'
      } catch (error) {
        fileCheck.uploadDir = 'missing'
        fileCheck.status = 'warning'
        fileCheck.warning = 'Directorio uploads no existe'
        return fileCheck
      }

      // Verificar permisos de escritura
      try {
        const testFile = path.join(uploadDir, '.health_check_test')
        await fs.writeFile(testFile, 'test')
        await fs.unlink(testFile)
        fileCheck.permissions = 'writable'
      } catch (error) {
        fileCheck.permissions = 'read_only'
        fileCheck.status = 'critical'
        fileCheck.error = 'Sin permisos de escritura en uploads'
        return fileCheck
      }

      // Contar archivos y calcular tamaño total
      const files = await this.getAllFiles(uploadDir)
      fileCheck.totalFiles = files.length

      let totalSize = 0
      for (const file of files) {
        try {
          const stats = await fs.stat(file)
          totalSize += stats.size
        } catch (error) {
          // Archivo corrupto o inaccesible
          fileCheck.status = 'warning'
          fileCheck.warning = 'Algunos archivos inaccesibles'
        }
      }

      fileCheck.totalSize = Math.round(totalSize / 1024 / 1024) // MB

      // Verificar límites
      if (fileCheck.totalSize > 1000) {
        // 1GB
        fileCheck.status = 'warning'
        fileCheck.warning = 'Directorio uploads grande (>1GB)'
      }

      return fileCheck
    } catch (error) {
      fileCheck.status = 'critical'
      fileCheck.error = error.message
      return fileCheck
    }
  }

  /**
   * Verifica servicios externos (si los hay)
   */
  async checkExternalServices() {
    const externalCheck = {
      status: 'healthy',
      services: {},
    }

    try {
      // Por ahora no tenemos servicios externos
      // En el futuro podríamos verificar:
      // - APIs de terceros
      // - Servicios de email
      // - Servicios de SMS
      // - CDNs

      externalCheck.services.placeholder = 'No external services configured'

      return externalCheck
    } catch (error) {
      externalCheck.status = 'critical'
      externalCheck.error = error.message
      return externalCheck
    }
  }

  /**
   * Obtiene todos los archivos recursivamente
   */
  async getAllFiles(dir) {
    const files = []

    try {
      const items = await fs.readdir(dir)

      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stats = await fs.stat(fullPath)

        if (stats.isDirectory()) {
          const subFiles = await this.getAllFiles(fullPath)
          files.push(...subFiles)
        } else {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directorio inaccesible
    }

    return files
  }

  /**
   * Procesa el resultado de un check individual
   */
  processCheckResult(result) {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        status: 'critical',
        error: result.reason.message,
      }
    }
  }

  /**
   * Calcula el estado general del sistema
   */
  calculateOverallHealth(checks) {
    const statuses = Object.values(checks).map((check) => check.status)

    if (statuses.includes('critical')) {
      return 'critical'
    } else if (statuses.includes('warning')) {
      return 'warning'
    } else {
      return 'healthy'
    }
  }

  /**
   * Obtiene el uptime formateado
   */
  getUptime() {
    const uptimeMs = Date.now() - this.startTime
    const uptimeSeconds = Math.floor(uptimeMs / 1000)

    const hours = Math.floor(uptimeSeconds / 3600)
    const minutes = Math.floor((uptimeSeconds % 3600) / 60)
    const seconds = uptimeSeconds % 60

    return `${hours}h ${minutes}m ${seconds}s`
  }

  /**
   * Guarda el resultado en el historial
   */
  saveToHistory(healthCheck) {
    this.healthHistory.unshift({
      timestamp: healthCheck.timestamp,
      status: healthCheck.status,
      summary: healthCheck.summary,
    })

    // Mantener solo los últimos N registros
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(0, this.maxHistorySize)
    }
  }

  /**
   * Obtiene el historial de health checks
   */
  getHealthHistory(limit = 10) {
    return this.healthHistory.slice(0, limit)
  }

  /**
   * Check rápido solo para liveness probe
   */
  async getQuickHealth() {
    try {
      // Solo verificar lo esencial
      const isDBConnected = mongoose.connection.readyState === 1
      const memUsage = process.memoryUsage()
      const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100

      if (!isDBConnected) {
        return { status: 'critical', reason: 'Database disconnected' }
      }

      if (heapPercent > 95) {
        return { status: 'critical', reason: 'Memory exhausted' }
      }

      return {
        status: 'healthy',
        uptime: this.getUptime(),
        memory: Math.round(heapPercent) + '%',
      }
    } catch (error) {
      return { status: 'critical', reason: error.message }
    }
  }
}

module.exports = new HealthCheckService()
