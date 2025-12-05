const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')
const logger = require('../utils/logger')

// =============================================================================
// FUNCIONES HELPER COMUNES
// =============================================================================

/**
 * Verifica si un usuario tiene acceso completo (administrador o jefe de grupo)
 */
const hasFullAccess = (user) => {
  return user?.rol?.permisos?.includes('acceso_completo')
}

/**
 * Verifica si un usuario es jefe de rama con acceso a su rama
 */
const isJefeDeRamaWithAccess = (user) => {
  return (
    user?.rol?.nombre === 'jefe de rama' &&
    user?.rol?.permisos?.includes('acceso_rama_propia')
  )
}

/**
 * Obtiene los roles con acceso completo
 */
const getFullAccessRoles = () => {
  return ['administrador', 'jefe de grupo', 'jefe de rama']
}

/**
 * Verifica ownership de rama para un pago específico
 */
const checkPagoRamaOwnership = async (pagoId, userRamaId) => {
  const Pago = require('../models/Pago')

  try {
    const pago = await Pago.findById(pagoId).populate({
      path: 'socio',
      populate: {
        path: 'rama',
      },
    })

    if (!pago) {
      return { error: 'Pago no encontrado', status: 404 }
    }

    if (!pago.socio?.rama) {
      return { error: 'El pago no tiene rama asignada', status: 400 }
    }

    if (pago.socio.rama._id.toString() !== userRamaId.toString()) {
      return {
        error: 'Solo puede acceder a pagos de su rama asignada',
        status: 403,
      }
    }

    return { success: true, pago }
  } catch (error) {
    logger.error('Error verificando ownership de rama para pago:', { error: error.message, stack: error.stack })
    return { error: 'Error interno del servidor', status: 500 }
  }
}

/**
 * Verifica acceso restringido para personas
 */
const checkPersonaRestrictedAccess = async (req) => {
  const { method, params, query, user, baseUrl } = req

  if (baseUrl !== '/api/personas') return { allowed: true }

  // Para GET de personas, forzar filtro por DNI del usuario
  if (method === 'GET' && !params.id) {
    if (!query.dni) {
      req.query.dni = user.persona.dni
    } else if (query.dni !== user.persona.dni) {
      return {
        allowed: false,
        error: 'Solo puede acceder a su propia información',
        status: 403,
      }
    }
  }

  // Para acceso a una persona específica por ID
  if (params.id) {
    const Persona = require('../models/Persona')
    try {
      const persona = await Persona.findById(params.id)
      if (persona && persona.dni !== user.persona.dni) {
        return {
          allowed: false,
          error: 'Solo puede acceder a su propia información',
          status: 403,
        }
      }
    } catch (error) {
      logger.error('Error verificando acceso restringido a persona:', { error: error.message, stack: error.stack })
      return {
        allowed: false,
        error: 'Error interno del servidor',
        status: 500,
      }
    }
  }

  // Para modificaciones (PUT, POST, DELETE), denegar acceso
  if (['PUT', 'POST', 'DELETE'].includes(method)) {
    return {
      allowed: false,
      error: 'No tiene permisos para modificar datos',
      status: 403,
    }
  }

  return { allowed: true }
}

/**
 * Verifica acceso restringido para pagos
 */
const checkPagoRestrictedAccess = async (req) => {
  const { method, params, query, user, baseUrl } = req

  if (baseUrl !== '/api/pagos') return { allowed: true }

  // Para GET de lista de pagos, filtrar por su propio socio
  if (method === 'GET' && !params.id) {
    req.query.socio = user.persona._id.toString()
    req.query.includeDeleted = 'false' // Los socios no ven pagos eliminados
  }

  // Para GET de pago específico por ID, verificar que sea su propio pago
  if (method === 'GET' && params.id) {
    const Pago = require('../models/Pago')
    try {
      const pago = await Pago.findById(params.id).populate('socio')
      if (!pago) {
        return {
          allowed: false,
          error: 'Pago no encontrado',
          status: 404,
        }
      }

      if (pago.socio._id.toString() !== user.persona._id.toString()) {
        return {
          allowed: false,
          error: 'Solo puede acceder a sus propios pagos',
          status: 403,
        }
      }
    } catch (error) {
      logger.error('Error verificando acceso restringido a pago:', { error: error.message, stack: error.stack })
      return {
        allowed: false,
        error: 'Error interno del servidor',
        status: 500,
      }
    }
  }

  // Para modificaciones (PUT, POST, DELETE), denegar acceso
  if (['PUT', 'POST', 'DELETE'].includes(method)) {
    return {
      allowed: false,
      error: 'No tiene permisos para esta acción',
      status: 403,
    }
  }

  return { allowed: true }
}

// =============================================================================
// MIDDLEWARES PRINCIPALES
// =============================================================================

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
      logger.error('Error en autenticación:', { error: error.message, stack: error.stack })
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
        logger.error('Error verificando acceso a rama:', { error: error.message, stack: error.stack })
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

  if (!hasFullAccess(req.user)) {
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
  const fullAccessRoles = getFullAccessRoles()

  // Si el usuario tiene un rol con acceso completo, permitir sin restricciones
  if (fullAccessRoles.includes(userRole)) {
    return next()
  }

  // Para todos los demás roles (incluido 'socio'), aplicar restricciones
  // Verificar acceso a personas
  const personaCheck = await checkPersonaRestrictedAccess(req)
  if (!personaCheck.allowed) {
    return res.status(personaCheck.status).json({
      message: personaCheck.error,
    })
  }

  // Verificar acceso a pagos
  const pagoCheck = await checkPagoRestrictedAccess(req)
  if (!pagoCheck.allowed) {
    return res.status(pagoCheck.status).json({
      message: pagoCheck.error,
    })
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

// =============================================================================
// FACTORY FUNCTIONS PARA MIDDLEWARES ESPECIALIZADOS
// =============================================================================

/**
 * Factory function para crear middlewares de acceso a pagos
 * Elimina duplicación entre requireDeletePagoAccess y requireRestorePagoAccess
 */
const createPagoAccessMiddleware = (action) => {
  const actionMessages = {
    delete: {
      error: 'Solo puede eliminar pagos de su rama asignada',
      permission: 'eliminar pagos',
    },
    restore: {
      error: 'Solo puede restaurar pagos de su rama asignada',
      permission: 'restaurar pagos',
    },
    update: {
      error: 'Solo puede actualizar pagos de su rama asignada',
      permission: 'actualizar pagos',
    },
  }

  const messages = actionMessages[action] || actionMessages.delete

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    // Acceso completo para administradores y jefes de grupo
    if (hasFullAccess(req.user)) {
      return next()
    }

    // Jefe de rama puede acceder a pagos de su rama específica
    if (isJefeDeRamaWithAccess(req.user)) {
      const result = await checkPagoRamaOwnership(
        req.params.id,
        req.user.persona.rama._id
      )

      if (result.error) {
        return res.status(result.status).json({ message: result.error })
      }

      return next()
    }

    // Para todos los demás casos, denegar acceso
    return res.status(403).json({
      message: `No tiene permisos para ${messages.permission}`,
    })
  }
}

// Crear middlewares específicos usando la factory function
const requireDeletePagoAccess = createPagoAccessMiddleware('delete')
const requireRestorePagoAccess = createPagoAccessMiddleware('restore')

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
