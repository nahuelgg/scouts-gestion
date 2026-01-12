const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')
const logger = require('../utils/logger')

const hasFullAccess = (user) => {
  return user?.rol?.permisos?.includes('acceso_completo')
}

const isJefeDeRamaWithAccess = (user) => {
  return (
    user?.rol?.nombre === 'jefe de rama' &&
    user?.rol?.permisos?.includes('acceso_rama_propia')
  )
}

const getFullAccessRoles = () => {
  return ['administrador', 'jefe de grupo', 'jefe de rama']
}

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

const checkPersonaRestrictedAccess = async (req) => {
  const { method, params, query, user, baseUrl } = req

  if (baseUrl !== '/api/personas') return { allowed: true }

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

const checkPagoRestrictedAccess = async (req) => {
  const { method, params, query, user, baseUrl } = req

  if (baseUrl !== '/api/pagos') return { allowed: true }

  if (method === 'GET' && !params.id) {
    req.query.socio = user.persona._id.toString()
    req.query.includeDeleted = 'false'
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

const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
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
    return res
      .status(401)
      .json({ message: 'No autorizado, sin token' })
  }
}

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

const checkRamaAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  const userRole = req.user.rol.nombre
  const userPermissions = req.user.rol.permisos

  if (userPermissions.includes('acceso_completo')) {
    return next()
  }

  if (
    userRole === 'jefe de rama' &&
    userPermissions.includes('acceso_rama_propia')
  ) {
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

const checkRestrictedAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  const userRole = req.user.rol.nombre
  const fullAccessRoles = getFullAccessRoles()

  if (fullAccessRoles.includes(userRole)) {
    return next()
  }

  const personaCheck = await checkPersonaRestrictedAccess(req)
  if (!personaCheck.allowed) {
    return res.status(personaCheck.status).json({
      message: personaCheck.error,
    })
  }
  const pagoCheck = await checkPagoRestrictedAccess(req)
  if (!pagoCheck.allowed) {
    return res.status(pagoCheck.status).json({
      message: pagoCheck.error,
    })
  }

  next()
}

const requirePermissionOrRestricted = (permiso) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const userPermissions = req.user.rol.permisos

    if (userPermissions.includes(permiso)) {
      return next()
    }

    if (userPermissions.includes('acceso_limitado')) {
      return checkRestrictedAccess(req, res, next)
    }

    return res.status(403).json({
      message: `No tiene permiso: ${permiso}`,
    })
  }
}

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

    if (hasFullAccess(req.user)) {
      return next()
    }

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

    return res.status(403).json({
      message: `No tiene permisos para ${messages.permission}`,
    })
  }
}
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
