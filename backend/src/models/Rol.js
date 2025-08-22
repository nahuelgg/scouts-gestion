const mongoose = require('mongoose');

const rolSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    enum: ['administrador', 'jefe_de_rama', 'jefe_de_grupo', 'socio']
  },
  descripcion: {
    type: String,
    required: true
  },
  permisos: [{
    type: String,
    enum: [
      'gestionar_usuarios',
      'gestionar_socios', 
      'gestionar_pagos',
      'ver_reportes',
      'administrar_sistema'
    ]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Rol', rolSchema);
