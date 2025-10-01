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
        .populate({
          path: 'persona',
          populate: {
            path: 'rama',
          },
        })
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

// Middleware para verificar permisos específicos
const requirePermission = (permiso) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    if (!req.user.rol.permisos.includes(permiso)) {
      return res.status(403).json({
        message: `No tiene permiso: ${permiso}`,
      })
    }

    next()
  }
}

// Middleware para verificar acceso a rama específica
const checkRamaAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  const userRole = req.user.rol.nombre
  const userPermissions = req.user.rol.permisos

  // Administrador y Jefe de Grupo tienen acceso completo
  if (userPermissions.includes('acceso_completo')) {
    return next()
  }

  // Jefe de Rama solo puede acceder a su rama
  if (
    userRole === 'jefe de rama' &&
    userPermissions.includes('acceso_rama_propia')
  ) {
    // Verificar si está accediendo a datos de su rama
    const ramaId = req.params.ramaId || req.body.rama || req.query.rama

    if (
      ramaId &&
      req.user.persona?.rama &&
      ramaId !== req.user.persona.rama._id.toString()
    ) {
      return res.status(403).json({
        message: 'Solo puede acceder a datos de su rama asignada',
      })
    }

    // Si está gestionando una persona, verificar que pertenezca a su rama
    if (req.params.id || req.body.personaId || req.body.socio) {
      const Persona = require('../models/Persona')
      const personaId = req.params.id || req.body.personaId || req.body.socio

      try {
        const persona = await Persona.findById(personaId).populate('rama')

        if (
          persona &&
          persona.rama &&
          persona.rama._id.toString() !== req.user.persona.rama._id.toString()
        ) {
          return res.status(403).json({
            message: 'Solo puede gestionar personas de su rama asignada',
          })
        }
      } catch (error) {
        console.error('Error verificando acceso a rama:', error)
      }
    }
  }

  next()
}

// Middleware combinado para verificar acceso completo
const requireFullAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  if (!req.user.rol.permisos.includes('acceso_completo')) {
    return res.status(403).json({
      message: 'Requiere permisos de administrador o jefe de grupo',
    })
  }

  next()
}

// Middleware para usuarios restringidos - aplica a todos EXCEPTO administrador, jefe de grupo y jefe de rama
const checkRestrictedAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  const userRole = req.user.rol.nombre
  const fullAccessRoles = ['administrador', 'jefe de grupo', 'jefe de rama']

  // Si el usuario tiene un rol con acceso completo, permitir sin restricciones
  if (fullAccessRoles.includes(userRole)) {
    return next()
  }

  // Para todos los demás roles (incluido 'socio'), aplicar restricciones
  // Solo pueden acceder a su propia información basada en su DNI

  // Para GET de personas, forzar filtro por DNI del usuario
  if (req.method === 'GET' && req.baseUrl === '/api/personas') {
    if (!req.query.dni) {
      req.query.dni = req.user.persona.dni
    } else if (req.query.dni !== req.user.persona.dni) {
      return res.status(403).json({
        message: 'Solo puede acceder a su propia información',
      })
    }
  }

  // Para acceso a una persona específica por ID
  if (req.params.id && req.baseUrl === '/api/personas') {
    const Persona = require('../models/Persona')
    try {
      const persona = await Persona.findById(req.params.id)
      if (persona && persona.dni !== req.user.persona.dni) {
        return res.status(403).json({
          message: 'Solo puede acceder a su propia información',
        })
      }
    } catch (error) {
      console.error('Error verificando acceso restringido:', error)
    }
  }

  // Para modificaciones (PUT, POST, DELETE), denegar acceso
  if (
    ['PUT', 'POST', 'DELETE'].includes(req.method) &&
    req.baseUrl === '/api/personas'
  ) {
    return res.status(403).json({
      message: 'No tiene permisos para modificar datos',
    })
  }

  next()
}

module.exports = {
  protect,
  authorize,
  requirePermission,
  checkRamaAccess,
  requireFullAccess,
  checkRestrictedAccess,
}
