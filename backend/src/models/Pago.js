const mongoose = require('mongoose')

const pagoSchema = new mongoose.Schema(
  {
    socio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Persona',
      required: true,
    },
    monto: {
      type: Number,
      required: true,
      min: [0.01, 'El monto debe ser mayor a 0'],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value > 0
        },
        message: 'El monto debe ser un número válido mayor a 0',
      },
    },
    fechaPago: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mesCorrespondiente: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/, // Formato YYYY-MM
    },
    metodoPago: {
      type: String,
      required: true,
      enum: ['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito'],
    },
    tipoPago: {
      type: String,
      required: true,
      enum: ['mensual', 'afiliacion', 'campamento', 'otro'],
    },
    comprobante: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    observaciones: {
      type: String,
      trim: true,
    },
    registradoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    modificadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmado', 'rechazado'],
      default: 'confirmado',
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
  },
  {
    timestamps: true,
  }
)

// Índices para búsquedas eficientes
pagoSchema.index({ socio: 1, mesCorrespondiente: 1 }) // Removido unique: true
pagoSchema.index({ fechaPago: -1 })
pagoSchema.index({ mesCorrespondiente: 1 })

module.exports = mongoose.model('Pago', pagoSchema)
