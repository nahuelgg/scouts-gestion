
const path = require('path')

const fileSecurityConfig = {
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

  allowedMimeTypes: {
    images: ['image/jpeg', 'image/png'],
    documents: ['application/pdf'],
  },

  sizeLimits: {
    'image/jpeg': {
      maxSize: 2 * 1024 * 1024,
      minSize: 1024,
      description: 'Imagen JPEG',
    },
    'image/png': {
      maxSize: 2 * 1024 * 1024,
      minSize: 1024,
      description: 'Imagen PNG',
    },
    'application/pdf': {
      maxSize: 10 * 1024 * 1024,
      minSize: 1024,
      description: 'Documento PDF',
    },
    default: {
      maxSize: 5 * 1024 * 1024,
      minSize: 1024,
      description: 'Archivo genérico',
    },
  },

  quarantine: {
    enabled: process.env.ENABLE_FILE_QUARANTINE !== 'false',
    retentionDays: parseInt(process.env.QUARANTINE_RETENTION_DAYS) || 30,
    baseDirectory:
      process.env.QUARANTINE_BASE_DIR || path.join(process.cwd(), 'quarantine'),
    autoQuarantineRiskLevels: ['MEDIUM'],
    blockRiskLevels: ['HIGH'],
    allowRiskLevels: ['MINIMAL', 'LOW'],
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
    cleanup: {
      enabled: process.env.ENABLE_QUARANTINE_CLEANUP !== 'false',
      intervalHours:
        parseInt(process.env.QUARANTINE_CLEANUP_INTERVAL_HOURS) || 24,
      maxRetentionDays:
        parseInt(process.env.QUARANTINE_MAX_RETENTION_DAYS) || 90,
    },
  },
  validation: {
    magicNumbers: {
      'image/jpeg': [
        [0xff, 0xd8, 0xff, 0xe0],
        [0xff, 0xd8, 0xff, 0xe1],
        [0xff, 0xd8, 0xff, 0xdb],
        [0xff, 0xd8, 0xff, 0xfe],
      ],
      'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
      'application/pdf': [
        [0x25, 0x50, 0x44, 0x46],
        [0x25, 0x46, 0x44, 0x46],
      ],
    },
    maliciousPatterns: [
      /<script[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?<\/iframe>/gi,
      /<object[\s\S]*?<\/object>/gi,
      /<embed[\s\S]*?<\/embed>/gi,
      /<form[\s\S]*?<\/form>/gi,
      /on(load|error|click|mouseover|focus|blur|change|submit)\s*=/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /data:application\/javascript/gi,
      /%3Cscript/gi,
      /%3C%2Fscript%3E/gi,
      /&lt;script/gi,
      /&lt;%2Fscript&gt;/gi,
      /<\?php/gi,
      /<\?=/gi,
      /<%[\s\S]*?%>/gi,
      /<!--\s*#(include|exec|config|set)/gi,
      /eval\s*\(/gi,
      /document\.write/gi,
      /window\.location/gi,
      /\.exe["'\s]/gi,
      /\.scr["'\s]/gi,
      /\.bat["'\s]/gi,
      /\.cmd["'\s]/gi,
      /\.com["'\s]/gi,
      /\.pif["'\s]/gi,
    ],
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
    dangerousFilenameChars: /[<>:"/\\|?*\x00-\x1f\x80-\x9f]/g,
    filename: {
      maxLength: 255,
      minLength: 1,
      allowUnicode: false,
      requireExtension: true,
    },
  },
  riskAssessment: {
    weights: {
      magicNumberMismatch: 30,
      maliciousContent: 40,
      invalidStructure: 25,
      oversizedFile: 15,
      suspiciousFilename: 20,
      forbiddenExtension: 50,
      metadataAnomalies: 10,
    },
    thresholds: {
      minimal: 0,
      low: 20,
      medium: 40,
      high: 70,
    },

    // Factores de riesgo por tipo de archivo
    typeFactors: {
      'image/jpeg': 1.0, // Factor base
      'image/png': 1.0, // Factor base
      'application/pdf': 1.2, // PDFs tienen mayor riesgo por complejidad
    },
  },
  logging: {
    enabled: process.env.ENABLE_FILE_SECURITY_LOGGING !== 'false',
    levels: {
      fileValidated: 'info',
      fileQuarantined: 'warn',
      fileBlocked: 'error',
      maliciousContentDetected: 'error',
      validationError: 'error',
      quarantineApproved: 'info',
      quarantineRejected: 'warn',
    },
    includeMetadata: {
      userInfo: true,
      ipAddress: true,
      userAgent: true,
      fileHash: true,
      validationDetails: true,
      timingInformation: true,
    },
    audit: {
      enabled: true,
      includeFileContent: false,
      retentionDays: 365,
      compressAfterDays: 30,
    },
  },
  performance: {
    maxConcurrentValidations: 5,
    validationTimeoutMs: 30000,
    maxScanSizeBytes: 64 * 1024,
    enableValidationCache: true,
    cacheExpiryMinutes: 60,
    maxCacheEntries: 1000,

    // Optimizaciones
    enableParallelValidation: true,
    skipValidationForKnownSafe: false,
    enableFileDeduplication: true,
  },

  // CONFIGURACIÓN DE AMBIENTE
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

function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development'
  return {
    ...fileSecurityConfig,
    ...fileSecurityConfig.environment[env],
  }
}

function validateConfig() {
  const config = getEnvironmentConfig()
  const errors = []
  if (config.quarantine.enabled) {
    const fs = require('fs')
    if (!fs.existsSync(config.quarantine.baseDirectory)) {
      errors.push(
        `Directorio de cuarentena no existe: ${config.quarantine.baseDirectory}`
      )
    }
  }
  for (const [mimeType, limits] of Object.entries(config.sizeLimits)) {
    if (limits.maxSize < limits.minSize) {
      errors.push(`Límite máximo menor que mínimo para ${mimeType}`)
    }
  }
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

function getSizeLimitsForType(mimeType) {
  const config = getEnvironmentConfig()
  return config.sizeLimits[mimeType] || config.sizeLimits.default
}

function getQuarantineConfig() {
  const config = getEnvironmentConfig()
  return config.quarantine
}

function getValidationPatterns() {
  const config = getEnvironmentConfig()
  return config.validation
}

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
