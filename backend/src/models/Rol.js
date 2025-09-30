const mongoose = require('mongoose')

const rolSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      enum: ['administrador', 'jefe de rama', 'jefe de grupo', 'socio'],
    },
    descripcion: {
      type: String,
      required: true,
    },
    permisos: [
      {
        type: String,
        enum: [
          'gestionar_usuarios',
          'gestionar_socios',
          'gestionar_pagos',
          'ver_reportes',
          'administrar_sistema',
          'acceso_completo', // Administrador y Jefe de Grupo
          'acceso_rama_propia', // Jefe de Rama solo a su rama
          'acceso_limitado', // Socio solo a su información
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Rol', rolSchema)
