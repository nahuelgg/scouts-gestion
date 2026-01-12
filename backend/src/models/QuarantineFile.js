const mongoose = require('mongoose')
const {
  applyQuarantineMiddleware,
} = require('../middleware/quarantineMiddleware')

const quarantineFileSchema = new mongoose.Schema(
  {
    // Identificador único de la cuarentena
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      maxLength: 255,
    },

    sanitizedName: {
      type: String,
      required: true,
      maxLength: 255,
    },

    mimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png', 'application/pdf'],
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },

    fileHash: {
      type: String,
      required: true,
      index: true, // Para detección de duplicados
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH'],
    },

    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    validationErrors: [
      {
        type: String,
      },
    ],

    validationWarnings: [
      {
        type: String,
      },
    ],

    // Estado y fechas
    status: {
      type: String,
      required: true,
      enum: ['pending_review', 'approved', 'rejected', 'expired'],
      default: 'pending_review',
      index: true,
    },

    quarantineDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    expirationDate: {
      type: Date,
      required: true,
      index: true,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    // Contexto de seguridad del usuario
    securityContext: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        index: true,
      },

      username: {
        type: String,
        required: true,
      },

      ip: {
        type: String,
        required: true,
      },

      userAgent: {
        type: String,
        required: true,
      },

      timestamp: {
        type: Date,
        required: true,
      },
    },

    // Rutas de archivos
    paths: {
      quarantineDir: {
        type: String,
        required: true,
      },

      originalFile: {
        type: String,
        required: true,
      },

      metadataFile: {
        type: String,
        required: true,
      },

      logFile: {
        type: String,
        required: true,
      },
    },
    processingInfo: {
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
      },

      processedByUsername: {
        type: String,
      },

      processedDate: {
        type: Date,
      },

      action: {
        type: String,
        enum: ['approved', 'rejected', 'expired'],
      },

      reason: {
        type: String,
        maxLength: 500,
      },

      notes: {
        type: String,
        maxLength: 1000,
      },
    },
    approvalInfo: {
      finalPath: {
        type: String,
      },

      integratedIntoSystem: {
        type: Boolean,
        default: false,
      },

      relatedRecordId: {
        type: mongoose.Schema.Types.ObjectId,
      },

      relatedRecordType: {
        type: String,
        enum: ['Pago', 'Persona'],
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Índices compuestos para consultas eficientes
quarantineFileSchema.index({ status: 1, quarantineDate: -1 })
quarantineFileSchema.index({ riskLevel: 1, status: 1 })
quarantineFileSchema.index({ expirationDate: 1, status: 1 })
quarantineFileSchema.index({ 'securityContext.userId': 1, quarantineDate: -1 })
quarantineFileSchema.index({ fileHash: 1, status: 1 })

// Virtual para tiempo en cuarentena
quarantineFileSchema.virtual('timeInQuarantine').get(function () {
  const now = new Date()
  const quarantineStart = new Date(this.quarantineDate)
  return now - quarantineStart
})

// Virtual para días hasta expiración
quarantineFileSchema.virtual('daysUntilExpiration').get(function () {
  const now = new Date()
  const expiration = new Date(this.expirationDate)
  const diffTime = expiration - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual para información de riesgo humanizada
quarantineFileSchema.virtual('riskInfo').get(function () {
  const riskDescriptions = {
    MINIMAL: 'Riesgo mínimo - archivo seguro',
    LOW: 'Riesgo bajo - verificación estándar',
    MEDIUM: 'Riesgo medio - requiere revisión',
    HIGH: 'Riesgo alto - requiere atención inmediata',
  }

  return {
    level: this.riskLevel,
    score: this.riskScore,
    description:
      riskDescriptions[this.riskLevel] || 'Nivel de riesgo desconocido',
  }
})
quarantineFileSchema.set('toJSON', { virtuals: true })
quarantineFileSchema.set('toObject', { virtuals: true })

// Aplicar middleware del modelo
applyQuarantineMiddleware(quarantineFileSchema)

const QuarantineFile = mongoose.model('QuarantineFile', quarantineFileSchema)

module.exports = QuarantineFile
