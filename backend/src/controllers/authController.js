const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')
const Persona = require('../models/Persona')
const Rol = require('../models/Rol')
const logger = require('../utils/logger')

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  })
}

// @desc    Autenticar usuario
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Validar datos de entrada
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Por favor proporciona username y password' })
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ username })
      .populate({
        path: 'persona',
        populate: { path: 'rama' },
      })
      .populate('rol')

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({ message: 'Usuario inactivo' })
    }

    // Verificar password
    if (await usuario.matchPassword(password)) {
      // Actualizar último login
      usuario.ultimoLogin = new Date()
      await usuario.save()

      logger.auth(`Login exitoso: ${username}`, {
        userId: usuario._id,
        username,
        rol: usuario.rol.nombre,
      })

      res.json({
        _id: usuario._id,
        username: usuario.username,
        persona: usuario.persona,
        rol: usuario.rol,
        token: generateToken(usuario._id),
      })
    } else {
      logger.security(`Intento de login fallido: ${username}`, {
        username,
        ip: req.ip,
      })
      res.status(401).json({ message: 'Credenciales inválidas' })
    }
  } catch (error) {
    logger.error('Error en login:', {
      error: error.message,
      stack: error.stack,
      username: req.body.username,
      ip: req.ip,
    })
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user._id)
      .populate({
        path: 'persona',
        populate: { path: 'rama' },
      })
      .populate('rol')
      .select('-password')

    res.json(usuario)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Cambiar password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Se requiere password actual y nuevo' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      })
    }

    const usuario = await Usuario.findById(req.user._id)

    if (!(await usuario.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Password actual incorrecto' })
    }

    usuario.password = newPassword
    await usuario.save()

    res.json({ message: 'Password actualizado exitosamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

module.exports = {
  login,
  getProfile,
  changePassword,
}
