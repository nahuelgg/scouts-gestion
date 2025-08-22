const express = require('express');
const Usuario = require('../models/Usuario');
const Persona = require('../models/Persona');
const Rol = require('../models/Rol');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Private (administrador)
router.get('/', protect, authorize('administrador'), async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .populate('persona')
      .populate('rol')
      .select('-password');

    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// @desc    Crear nuevo usuario
// @route   POST /api/usuarios
// @access  Private (administrador)
router.post('/', protect, authorize('administrador'), async (req, res) => {
  try {
    const { username, password, persona, rol } = req.body;

    if (!username || !password || !persona || !rol) {
      return res.status(400).json({ 
        message: 'Username, password, persona y rol son requeridos' 
      });
    }

    // Verificar que no existe el username
    const usuarioExistente = await Usuario.findOne({ username });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El username ya existe' });
    }

    // Verificar que la persona y rol existen
    const personaExistente = await Persona.findById(persona);
    const rolExistente = await Rol.findById(rol);

    if (!personaExistente) {
      return res.status(400).json({ message: 'Persona no encontrada' });
    }

    if (!rolExistente) {
      return res.status(400).json({ message: 'Rol no encontrado' });
    }

    const usuario = await Usuario.create({
      username,
      password,
      persona,
      rol
    });

    const usuarioCreado = await Usuario.findById(usuario._id)
      .populate('persona')
      .populate('rol')
      .select('-password');

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioCreado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
