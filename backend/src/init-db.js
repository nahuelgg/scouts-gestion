const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/database');
const Rol = require('./models/Rol');
const Rama = require('./models/Rama');
const Persona = require('./models/Persona');
const Usuario = require('./models/Usuario');

const initializeDatabase = async () => {
  try {
    await connectDB();

    // Limpiar datos existentes (opcional)
    console.log('Limpiando datos existentes...');
    await Rol.deleteMany({});
    await Rama.deleteMany({});
    await Usuario.deleteMany({});
    await Persona.deleteMany({});

    // Crear roles
    console.log('Creando roles...');
    const roles = [
      {
        nombre: 'administrador',
        descripcion: 'Administrador del sistema con acceso completo',
        permisos: ['gestionar_usuarios', 'gestionar_socios', 'gestionar_pagos', 'ver_reportes', 'administrar_sistema']
      },
      {
        nombre: 'jefe_de_rama',
        descripcion: 'Jefe de rama con permisos para gestionar socios y pagos',
        permisos: ['gestionar_socios', 'gestionar_pagos', 'ver_reportes']
      },
      {
        nombre: 'jefe_de_grupo',
        descripcion: 'Jefe de grupo con permisos limitados',
        permisos: ['ver_reportes']
      },
      {
        nombre: 'socio',
        descripcion: 'Socio del grupo scout',
        permisos: []
      }
    ];

    const rolesCreados = await Rol.insertMany(roles);
    console.log('Roles creados exitosamente');

    // Crear ramas
    console.log('Creando ramas...');
    const ramas = [
      {
        nombre: 'manada',
        descripcion: 'Lobatos y lobeznas (6-8 años)',
        edadMinima: 6,
        edadMaxima: 8
      },
      {
        nombre: 'unidad',
        descripcion: 'Scouts (9-14 años)',
        edadMinima: 9,
        edadMaxima: 14
      },
      {
        nombre: 'caminantes',
        descripcion: 'Caminantes (15-17 años)',
        edadMinima: 15,
        edadMaxima: 17
      },
      {
        nombre: 'rovers',
        descripcion: 'Rovers (18-21 años)',
        edadMinima: 18,
        edadMaxima: 21
      }
    ];

    const ramasCreadas = await Rama.insertMany(ramas);
    console.log('Ramas creadas exitosamente');

    // Crear persona administrador
    console.log('Creando persona administrador...');
    const personaAdmin = await Persona.create({
      nombre: 'Administrador',
      apellido: 'Sistema',
      dni: '00000000',
      direccion: {
        calle: 'Sistema',
        numero: '0',
        ciudad: 'Sistema',
        codigoPostal: '0000'
      },
      telefono: '000-000-0000',
      email: 'admin@scouts.com'
    });

    // Crear usuario administrador
    console.log('Creando usuario administrador...');
    const rolAdmin = rolesCreados.find(rol => rol.nombre === 'administrador');
    
    const usuarioAdmin = await Usuario.create({
      username: 'admin',
      password: 'admin123', // Se hasheará automáticamente
      persona: personaAdmin._id,
      rol: rolAdmin._id
    });

    console.log('✅ Base de datos inicializada exitosamente');
    console.log('📋 Datos creados:');
    console.log('   - Roles: 4');
    console.log('   - Ramas: 4');
    console.log('   - Usuario administrador: admin / admin123');
    console.log('');
    console.log('🚀 Puedes iniciar el servidor con: npm run dev');

  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
  } finally {
    process.exit();
  }
};

initializeDatabase();
