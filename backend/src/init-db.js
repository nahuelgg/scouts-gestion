const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const connectDB = require('./config/database')

const initializeDatabase = async () => {
  try {
    await connectDB()

    // Importar modelos después de conectar a la DB
    const Rol = require('./models/Rol')
    const Rama = require('./models/Rama')
    const Persona = require('./models/Persona')
    const Usuario = require('./models/Usuario')

    // Limpiar datos existentes (opcional)
    console.log('Limpiando datos existentes...')
    await Rol.deleteMany({})
    await Rama.deleteMany({})
    await Usuario.deleteMany({})
    await Persona.deleteMany({})

    // Crear roles
    console.log('Creando roles...')
    const roles = [
      {
        nombre: 'administrador',
        descripcion: 'Administrador del sistema con acceso completo',
        permisos: [
          'gestionar_usuarios',
          'gestionar_socios',
          'gestionar_pagos',
          'ver_reportes',
          'administrar_sistema',
          'acceso_completo',
        ],
      },
      {
        nombre: 'jefe de grupo',
        descripcion: 'Jefe de grupo con acceso completo al sistema',
        permisos: [
          'gestionar_usuarios',
          'gestionar_socios',
          'gestionar_pagos',
          'ver_reportes',
          'administrar_sistema',
          'acceso_completo',
        ],
      },
      {
        nombre: 'jefe de rama',
        descripcion: 'Jefe de rama con acceso limitado a su rama',
        permisos: [
          'gestionar_socios',
          'gestionar_pagos',
          'ver_reportes',
          'acceso_rama_propia',
        ],
      },
      {
        nombre: 'socio',
        descripcion: 'Socio del grupo scout con acceso limitado',
        permisos: [
          'ver_reportes',
          'acceso_limitado',
        ],
      },
    ]

    const rolesCreados = await Rol.insertMany(roles)
    console.log('Roles creados exitosamente')

    // Crear ramas
    console.log('Creando ramas...')
    const ramas = [
      {
        nombre: 'manada',
        descripcion: 'Lobatos y lobeznas (7-10 años)',
        edadMinima: 7,
        edadMaxima: 10,
      },
      {
        nombre: 'unidad',
        descripcion: 'Scouts (10-14 años)',
        edadMinima: 10,
        edadMaxima: 14,
      },
      {
        nombre: 'caminantes',
        descripcion: 'Caminantes (14-18 años)',
        edadMinima: 14,
        edadMaxima: 18,
      },
      {
        nombre: 'rovers',
        descripcion: 'Rovers (18-22 años)',
        edadMinima: 18,
        edadMaxima: 22,
      },
    ]

    const ramasCreadas = await Rama.insertMany(ramas)
    console.log('Ramas creadas exitosamente')

    // Crear persona administrador
    console.log('Creando persona administrador...')
    const personaAdmin = await Persona.create({
      nombre: 'Administrador',
      apellido: 'Sistema',
      dni: '00000000',
      direccion: {
        calle: 'Sistema',
        numero: '0',
        ciudad: 'Sistema',
        codigoPostal: '0000',
      },
      telefono: '000-000-0000',
      email: 'admin@scouts.com',
      fechaNacimiento: new Date('1990-01-01'),
      funcion: 'educador',
      activo: true,
      deleted: false,
    })

    // Crear usuario administrador
    console.log('Creando usuario administrador...')
    const rolAdmin = rolesCreados.find((rol) => rol.nombre === 'administrador')

    const usuarioAdmin = await Usuario.create({
      username: 'admin',
      password: 'admin123', // Se hasheará automáticamente
      persona: personaAdmin._id,
      rol: rolAdmin._id,
    })

    console.log('✅ Base de datos inicializada exitosamente')
    console.log('📋 Datos creados:')
    console.log('   - Roles: 4')
    console.log('   - Ramas: 4')
    console.log('   - Usuario administrador: admin / admin123')
    console.log('')
    console.log('🚀 Puedes iniciar el servidor con: npm run dev')
  } catch (error) {
    console.error('Error inicializando la base de datos:', error)
  } finally {
    process.exit()
  }
}

initializeDatabase()
