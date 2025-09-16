const mongoose = require('mongoose')

const personaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    apellido: {
      type: String,
      required: true,
      trim: true,
    },
    dni: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    direccion: {
      calle: {
        type: String,
        required: true,
      },
      numero: {
        type: String,
        required: true,
      },
      ciudad: {
        type: String,
        required: true,
      },
      codigoPostal: {
        type: String,
      },
    },
    telefono: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    fechaNacimiento: {
      type: Date,
    },
    rama: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rama',
    },
    funcion: {
      type: String,
      enum: ['ayudante', 'beneficiario', 'educador'],
      required: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Índice compuesto para búsquedas
personaSchema.index({ nombre: 1, apellido: 1 })
personaSchema.index({ dni: 1 })

module.exports = mongoose.model('Persona', personaSchema)
