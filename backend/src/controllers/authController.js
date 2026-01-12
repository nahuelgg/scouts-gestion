const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')
const Persona = require('../models/Persona')
const Rol = require('../models/Rol')
const logger = require('../utils/logger')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  })
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Por favor proporciona username y password' })
    }

    const usuario = await Usuario.findOne({ username })
      .populate({
        path: 'persona',
        populate: { path: 'rama' },
      })
      .populate('rol')

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }
    if (!usuario.activo) {
      return res.status(401).json({ message: 'Usuario inactivo' })
    }
    if (await usuario.matchPassword(password)) {
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
    res.status(500).json({ message: 'Error del servidor' })
  }
}

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
    res.status(500).json({ message: 'Error del servidor' })
  }
}

module.exports = {
  login,
  getProfile,
  changePassword,
}
