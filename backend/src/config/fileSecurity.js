/**
 * Configuración centralizada de seguridad de archivos
 * Define políticas, límites y reglas de validación empresarial
 *
 * @module FileSecurityConfig
 * @author Sistema de Gestión Scouts
 * @version 1.0.0
 */

const path = require('path')

/**
 * Configuración base de seguridad
 */
const fileSecurityConfig = {
  // ============================
  // CONFIGURACIÓN GENERAL
  // ============================
  general: {
    enableAdvancedValidation:
      process.env.ENABLE_ADVANCED_FILE_VALIDATION !== 'false',
    enableQuarantine: process.env.ENABLE_FILE_QUARANTINE !== 'false',
    enableLogging: process.env.ENABLE_FILE_SECURITY_LOGGING !== 'false',
    maxConcurrentValidations:
      parseInt(process.env.MAX_CONCURRENT_FILE_VALIDATIONS) || 5,
    validationTimeoutMs:
      parseInt(process.env.FILE_VALIDATION_TIMEOUT_MS) || 30000,
  },

  // ============================
  // TIPOS DE ARCHIVO PERMITIDOS
  // ============================
  allowedMimeTypes: {
    images: ['image/jpeg', 'image/png'],
    documents: ['application/pdf'],
  },

  // ============================
  // LÍMITES DE TAMAÑO POR TIPO
  // ============================
  sizeLimits: {
    // Imágenes
    'image/jpeg': {
      maxSize: 2 * 1024 * 1024, // 2MB
      minSize: 1024, // 1KB mínimo
      description: 'Imagen JPEG',
    },
    'image/png': {
      maxSize: 2 * 1024 * 1024, // 2MB
      minSize: 1024, // 1KB mínimo
      description: 'Imagen PNG',
    },

    // Documentos
    'application/pdf': {
      maxSize: 10 * 1024 * 1024, // 10MB
      minSize: 1024, // 1KB mínimo
      description: 'Documento PDF',
    },

    // Límite global por defecto
    default: {
      maxSize: 5 * 1024 * 1024, // 5MB
      minSize: 1024, // 1KB
      description: 'Archivo genérico',
    },
  },

  // ============================
  // CONFIGURACIÓN DE CUARENTENA
  // ============================
  quarantine: {
    enabled: process.env.ENABLE_FILE_QUARANTINE !== 'false',
    retentionDays: parseInt(process.env.QUARANTINE_RETENTION_DAYS) || 30,
    baseDirectory:
      process.env.QUARANTINE_BASE_DIR || path.join(process.cwd(), 'quarantine'),

    // Niveles de riesgo que van a cuarentena automáticamente
    autoQuarantineRiskLevels: ['MEDIUM'],

    // Niveles de riesgo que se bloquean inmediatamente
    blockRiskLevels: ['HIGH'],

    // Niveles de riesgo que se permiten sin cuarentena
    allowRiskLevels: ['MINIMAL', 'LOW'],

    // Notificaciones
    notifications: {
      enabled: process.env.ENABLE_QUARANTINE_NOTIFICATIONS !== 'false',
      adminEmails: (process.env.QUARANTINE_ADMIN_EMAILS || '')
        .split(',')
        .filter((email) => email.trim()),
      notifyOnRiskLevel: ['MEDIUM', 'HIGH'],
      notifyOnQuarantine: true,
      notifyOnApproval: false,
      notifyOnRejection: true,
    },

    // Limpieza automática
    cleanup: {
      enabled: process.env.ENABLE_QUARANTINE_CLEANUP !== 'false',
      intervalHours:
        parseInt(process.env.QUARANTINE_CLEANUP_INTERVAL_HOURS) || 24,
      maxRetentionDays:
        parseInt(process.env.QUARANTINE_MAX_RETENTION_DAYS) || 90,
    },
  },

  // ============================
  // PATRONES DE VALIDACIÓN
  // ============================
  validation: {
    // Magic numbers para validación de tipos reales
    magicNumbers: {
      'image/jpeg': [
        [0xff, 0xd8, 0xff, 0xe0], // JFIF
        [0xff, 0xd8, 0xff, 0xe1], // EXIF
        [0xff, 0xd8, 0xff, 0xdb], // JPEG
        [0xff, 0xd8, 0xff, 0xfe], // JPEG comentario
      ],
      'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
      'application/pdf': [
        [0x25, 0x50, 0x44, 0x46], // %PDF
        [0x25, 0x46, 0x44, 0x46], // %FDF
      ],
    },

    // Patrones maliciosos conocidos
    maliciousPatterns: [
      // Scripts embebidos
      /<script[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?<\/iframe>/gi,
      /<object[\s\S]*?<\/object>/gi,
      /<embed[\s\S]*?<\/embed>/gi,
      /<form[\s\S]*?<\/form>/gi,

      // Event handlers peligrosos
      /on(load|error|click|mouseover|focus|blur|change|submit)\s*=/gi,

      // URLs y esquemas peligrosos
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /data:application\/javascript/gi,

      // Variantes codificadas
      /%3Cscript/gi,
      /%3C%2Fscript%3E/gi,
      /&lt;script/gi,
      /&lt;%2Fscript&gt;/gi,

      // Inyección de código servidor
      /<\?php/gi,
      /<\?=/gi,
      /<%[\s\S]*?%>/gi,

      // Server-side includes
      /<!--\s*#(include|exec|config|set)/gi,

      // Metadatos sospechosos en imágenes
      /eval\s*\(/gi,
      /document\.write/gi,
      /window\.location/gi,

      // Patrones específicos de malware
      /\.exe["'\s]/gi,
      /\.scr["'\s]/gi,
      /\.bat["'\s]/gi,
      /\.cmd["'\s]/gi,
      /\.com["'\s]/gi,
      /\.pif["'\s]/gi,
    ],

    // Extensiones prohibidas
    forbiddenExtensions: [
      'exe',
      'bat',
      'cmd',
      'com',
      'pif',
      'scr',
      'vbs',
      'js',
      'jar',
      'sh',
      'py',
      'pl',
      'php',
      'asp',
      'aspx',
      'jsp',
      'war',
      'ear',
      'msi',
      'deb',
      'rpm',
      'dmg',
      'pkg',
      'app',
      'ipa',
      'apk',
    ],

    // Caracteres peligrosos en nombres de archivo
    dangerousFilenameChars: /[<>:"/\\|?*\x00-\x1f\x80-\x9f]/g,

    // Límites de nombre de archivo
    filename: {
      maxLength: 255,
      minLength: 1,
      allowUnicode: false,
      requireExtension: true,
    },
  },

  // ============================
  // CONFIGURACIÓN DE RIESGO
  // ============================
  riskAssessment: {
    // Pesos para cálculo de puntuación de riesgo
    weights: {
      magicNumberMismatch: 30, // Tipo de archivo no coincide
      maliciousContent: 40, // Contenido sospechoso encontrado
      invalidStructure: 25, // Estructura de archivo inválida
      oversizedFile: 15, // Archivo demasiado grande
      suspiciousFilename: 20, // Nombre de archivo sospechoso
      forbiddenExtension: 50, // Extensión prohibida
      metadataAnomalies: 10, // Anomalías en metadatos
    },

    // Umbrales para niveles de riesgo
    thresholds: {
      minimal: 0, // 0-19: MINIMAL
      low: 20, // 20-39: LOW
      medium: 40, // 40-69: MEDIUM
      high: 70, // 70+: HIGH
    },

    // Factores de riesgo por tipo de archivo
    typeFactors: {
      'image/jpeg': 1.0, // Factor base
      'image/png': 1.0, // Factor base
      'application/pdf': 1.2, // PDFs tienen mayor riesgo por complejidad
    },
  },

  // ============================
  // CONFIGURACIÓN DE LOGGING
  // ============================
  logging: {
    enabled: process.env.ENABLE_FILE_SECURITY_LOGGING !== 'false',

    // Niveles de log por tipo de evento
    levels: {
      fileValidated: 'info',
      fileQuarantined: 'warn',
      fileBlocked: 'error',
      maliciousContentDetected: 'error',
      validationError: 'error',
      quarantineApproved: 'info',
      quarantineRejected: 'warn',
    },

    // Información a incluir en logs
    includeMetadata: {
      userInfo: true,
      ipAddress: true,
      userAgent: true,
      fileHash: true,
      validationDetails: true,
      timingInformation: true,
    },

    // Configuración para logs de auditoría
    audit: {
      enabled: true,
      includeFileContent: false, // Por privacidad y rendimiento
      retentionDays: 365,
      compressAfterDays: 30,
    },
  },

  // ============================
  // CONFIGURACIÓN DE RENDIMIENTO
  // ============================
  performance: {
    // Límites de procesamiento
    maxConcurrentValidations: 5,
    validationTimeoutMs: 30000,
    maxScanSizeBytes: 64 * 1024, // Solo escanear primeros 64KB

    // Cache de validaciones
    enableValidationCache: true,
    cacheExpiryMinutes: 60,
    maxCacheEntries: 1000,

    // Optimizaciones
    enableParallelValidation: true,
    skipValidationForKnownSafe: false,
    enableFileDeduplication: true,
  },

  // ============================
  // CONFIGURACIÓN DE AMBIENTE
  // ============================
  environment: {
    // Configuración por ambiente
    development: {
      strictValidation: false,
      allowTestFiles: true,
      verboseLogging: true,
      enableDebugMode: true,
    },

    staging: {
      strictValidation: true,
      allowTestFiles: false,
      verboseLogging: true,
      enableDebugMode: false,
    },

    production: {
      strictValidation: true,
      allowTestFiles: false,
      verboseLogging: false,
      enableDebugMode: false,
    },
  },
}

/**
 * Obtiene configuración específica para el ambiente actual
 */
function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development'
  return {
    ...fileSecurityConfig,
    ...fileSecurityConfig.environment[env],
  }
}

/**
 * Valida que la configuración sea coherente
 */
function validateConfig() {
  const config = getEnvironmentConfig()
  const errors = []

  // Validar que los directorios existen
  if (config.quarantine.enabled) {
    const fs = require('fs')
    if (!fs.existsSync(config.quarantine.baseDirectory)) {
      errors.push(
        `Directorio de cuarentena no existe: ${config.quarantine.baseDirectory}`
      )
    }
  }

  // Validar límites de tamaño
  for (const [mimeType, limits] of Object.entries(config.sizeLimits)) {
    if (limits.maxSize < limits.minSize) {
      errors.push(`Límite máximo menor que mínimo para ${mimeType}`)
    }
  }

  // Validar configuración de notificaciones
  if (
    config.quarantine.notifications.enabled &&
    config.quarantine.notifications.adminEmails.length === 0
  ) {
    errors.push('Notificaciones habilitadas pero sin emails de administrador')
  }

  if (errors.length > 0) {
    throw new Error(
      `Errores en configuración de seguridad:\n${errors.join('\n')}`
    )
  }

  return true
}

/**
 * Obtiene límites de tamaño para un tipo MIME específico
 */
function getSizeLimitsForType(mimeType) {
  const config = getEnvironmentConfig()
  return config.sizeLimits[mimeType] || config.sizeLimits.default
}

/**
 * Obtiene configuración de cuarentena activa
 */
function getQuarantineConfig() {
  const config = getEnvironmentConfig()
  return config.quarantine
}

/**
 * Obtiene patrones de validación activos
 */
function getValidationPatterns() {
  const config = getEnvironmentConfig()
  return config.validation
}

/**
 * Obtiene configuración de evaluación de riesgo
 */
function getRiskAssessmentConfig() {
  const config = getEnvironmentConfig()
  return config.riskAssessment
}

module.exports = {
  fileSecurityConfig,
  getEnvironmentConfig,
  validateConfig,
  getSizeLimitsForType,
  getQuarantineConfig,
  getValidationPatterns,
  getRiskAssessmentConfig,
}
