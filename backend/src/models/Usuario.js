const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const usuarioSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    persona: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Persona',
      required: true,
    },
    rol: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rol',
      required: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    ultimoLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Método para comparar passwords
usuarioSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('Usuario', usuarioSchema)
