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
  // Solo pueden acceder a su propia información

  // RESTRICCIONES PARA PERSONAS
  if (req.baseUrl === '/api/personas') {
    // Para GET de personas, forzar filtro por DNI del usuario
    if (req.method === 'GET' && !req.params.id) {
      if (!req.query.dni) {
        req.query.dni = req.user.persona.dni
      } else if (req.query.dni !== req.user.persona.dni) {
        return res.status(403).json({
          message: 'Solo puede acceder a su propia información',
        })
      }
    }

    // Para acceso a una persona específica por ID
    if (req.params.id) {
      const Persona = require('../models/Persona')
      try {
        const persona = await Persona.findById(req.params.id)
        if (persona && persona.dni !== req.user.persona.dni) {
          return res.status(403).json({
            message: 'Solo puede acceder a su propia información',
          })
        }
      } catch (error) {
        console.error('Error verificando acceso restringido a persona:', error)
        return res.status(500).json({ message: 'Error interno del servidor' })
      }
    }

    // Para modificaciones (PUT, POST, DELETE), denegar acceso
    if (['PUT', 'POST', 'DELETE'].includes(req.method)) {
      return res.status(403).json({
        message: 'No tiene permisos para modificar datos',
      })
    }
  }

  // RESTRICCIONES PARA PAGOS
  if (req.baseUrl === '/api/pagos') {
    // Para GET de lista de pagos, filtrar por su propio socio
    if (req.method === 'GET' && !req.params.id) {
      req.query.socio = req.user.persona._id.toString()
      req.query.includeDeleted = 'false' // Los socios no ven pagos eliminados
    }

    // Para GET de pago específico por ID, verificar que sea su propio pago
    if (req.method === 'GET' && req.params.id) {
      const Pago = require('../models/Pago')
      try {
        const pago = await Pago.findById(req.params.id).populate('socio')
        if (!pago) {
          return res.status(404).json({ message: 'Pago no encontrado' })
        }

        if (pago.socio._id.toString() !== req.user.persona._id.toString()) {
          return res.status(403).json({
            message: 'Solo puede acceder a sus propios pagos',
          })
        }
      } catch (error) {
        console.error('Error verificando acceso restringido a pago:', error)
        return res.status(500).json({ message: 'Error interno del servidor' })
      }
    }

    // Para modificaciones (PUT, POST, DELETE), denegar acceso
    if (['PUT', 'POST', 'DELETE'].includes(req.method)) {
      return res.status(403).json({
        message: 'No tiene permisos para esta acción',
      })
    }
  }

  next()
}

// Middleware combinado que verifica permisos o aplica restricciones
const requirePermissionOrRestricted = (permiso) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const userPermissions = req.user.rol.permisos

    // Si tiene el permiso requerido, permitir acceso completo
    if (userPermissions.includes(permiso)) {
      return next()
    }

    // Si no tiene el permiso pero tiene acceso limitado, aplicar restricciones
    if (userPermissions.includes('acceso_limitado')) {
      return checkRestrictedAccess(req, res, next)
    }

    // Si no tiene ningún permiso relevante, denegar acceso
    return res.status(403).json({
      message: `No tiene permiso: ${permiso}`,
    })
  }
}

// Middleware para permitir eliminación de pagos con control por rama
const requireDeletePagoAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  const userRole = req.user.rol.nombre
  const userPermissions = req.user.rol.permisos

  // Administrador y Jefe de Grupo tienen acceso completo para eliminar
  if (userPermissions.includes('acceso_completo')) {
    return next()
  }

  // Jefe de Rama puede eliminar pagos de su rama específica
  if (
    userRole === 'jefe de rama' &&
    userPermissions.includes('acceso_rama_propia')
  ) {
    try {
      const Pago = require('../models/Pago')
      const pago = await Pago.findById(req.params.id).populate({
        path: 'socio',
        populate: {
          path: 'rama',
        },
      })

      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' })
      }

      // Verificar que el pago pertenezca a la rama del jefe
      if (
        !pago.socio?.rama ||
        pago.socio.rama._id.toString() !== req.user.persona.rama._id.toString()
      ) {
        return res.status(403).json({
          message: 'Solo puede eliminar pagos de su rama asignada',
        })
      }

      return next()
    } catch (error) {
      console.error('Error verificando acceso para eliminar pago:', error)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  // Para todos los demás casos, denegar acceso
  return res.status(403).json({
    message: 'No tiene permisos para eliminar pagos',
  })
}

// Middleware para permitir restauración de pagos con control por rama
const requireRestorePagoAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  const userRole = req.user.rol.nombre
  const userPermissions = req.user.rol.permisos

  // Administrador y Jefe de Grupo tienen acceso completo para restaurar
  if (userPermissions.includes('acceso_completo')) {
    return next()
  }

  // Jefe de Rama puede restaurar pagos de su rama específica
  if (
    userRole === 'jefe de rama' &&
    userPermissions.includes('acceso_rama_propia')
  ) {
    try {
      const Pago = require('../models/Pago')
      const pago = await Pago.findById(req.params.id).populate({
        path: 'socio',
        populate: {
          path: 'rama',
        },
      })

      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' })
      }

      // Verificar que el pago pertenezca a la rama del jefe
      if (
        !pago.socio?.rama ||
        pago.socio.rama._id.toString() !== req.user.persona.rama._id.toString()
      ) {
        return res.status(403).json({
          message: 'Solo puede restaurar pagos de su rama asignada',
        })
      }

      return next()
    } catch (error) {
      console.error('Error verificando acceso para restaurar pago:', error)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  // Para todos los demás casos, denegar acceso
  return res.status(403).json({
    message: 'No tiene permisos para restaurar pagos',
  })
}

module.exports = {
  protect,
  authorize,
  requirePermission,
  checkRamaAccess,
  requireFullAccess,
  checkRestrictedAccess,
  requirePermissionOrRestricted,
  requireDeletePagoAccess,
  requireRestorePagoAccess,
}
