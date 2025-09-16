const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')

const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1]

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Obtener usuario del token
      req.user = await Usuario.findById(decoded.id)
        .populate('persona')
        .populate('rol')
        .select('-password')

      if (!req.user) {
        return res
          .status(401)
          .json({ message: 'No autorizado, usuario no encontrado' })
      }

      if (!req.user.activo) {
        return res.status(401).json({ message: 'Usuario inactivo' })
      }

      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: 'No autorizado, token inválido' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, sin token' })
  }
}

// Middleware para verificar roles específicos
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    if (!roles.includes(req.user.rol.nombre)) {
      return res.status(403).json({
        message: `Rol ${req.user.rol.nombre} no tiene permisos para esta acción`,
      })
    }

    next()
  }
}

module.exports = { protect, authorize }
