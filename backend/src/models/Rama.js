const mongoose = require('mongoose');

const ramaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    enum: ['manada', 'unidad', 'caminantes', 'rovers']
  },
  descripcion: {
    type: String,
    required: true
  },
  edadMinima: {
    type: Number,
    required: true
  },
  edadMaxima: {
    type: Number,
    required: true
  },
  jefeRama: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rama', ramaSchema);
