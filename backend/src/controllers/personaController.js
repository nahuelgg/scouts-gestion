const Persona = require('../models/Persona')
const Rama = require('../models/Rama')
const {
  validateUniqueDNI,
  validateRamaExists,
  validateRequiredPersonaFields,
} = require('../validators/personaBusinessValidators')
const {
  handleServerError,
  handleValidationError,
  handleNotFound,
  sendSuccessResponse,
} = require('../utils/errorHandlers')

const getPersonas = async (req, res) => {
  try {
    const {
      page = 1,
      limit: requestedLimit = 10,
      search = '',
      rama = '',
      funcion = '',
      activo = '',
      dni = '',
      includeDeleted = true,
      withoutUser = false,
    } = req.query

    const limit = Math.min(parseInt(requestedLimit) || 10, 100)

    // Construir filtros
    let filter = {}

    // Por defecto mostrar todas (incluidas eliminadas)
    // Solo excluir eliminadas si se solicita específicamente
    if (includeDeleted === 'false') {
      filter.deleted = false
    }

    // Filtro para excluir personas que ya tienen usuario
    if (withoutUser === 'true') {
      const Usuario = require('../models/Usuario')
      const personasConUsuario = await Usuario.find(
        { deleted: { $ne: true } },
        'persona'
      ).distinct('persona')

      filter._id = { $nin: personasConUsuario }
    }

    // Filtro por DNI exacto (para usuarios tipo 'socio')
    if (dni) {
      filter.dni = dni
    } else if (search) {
      // Solo buscar si no hay filtro de DNI específico
      filter.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { apellido: { $regex: search, $options: 'i' } },
        { dni: { $regex: search, $options: 'i' } },
      ]
    }

    if (rama) {
      filter.rama = rama
    }

    if (funcion) {
      filter.funcion = funcion
    }

    if (activo !== undefined && activo !== '') {
      filter.activo = activo === 'true'
    }

    if (req.query.es_mayor === 'true') {
      const eighteenYearsAgo = new Date()
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18)
      filter.fechaNacimiento = { $lte: eighteenYearsAgo }
    }

    const personas = await Persona.find(filter)
      .populate('rama')
      .sort({ apellido: 1, nombre: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Persona.countDocuments(filter)

    res.json({
      personas,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const getPersonaById = async (req, res) => {
  try {
    const persona = await Persona.findOne({
      _id: req.params.id,
      deleted: false,
    }).populate('rama')

    if (!persona) {
      return handleNotFound(res, 'Persona')
    }

    res.json(persona)
  } catch (error) {
    handleServerError(res, error, 'Error obteniendo persona')
  }
}

const createPersona = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      dni,
      direccion,
      telefono,
      email,
      fechaNacimiento,
      rama,
      funcion,
    } = req.body
    const validation = validateRequiredPersonaFields(req.body)
    if (!validation.isValid) {
      return handleValidationError(res, validation.message)
    }
    const isDNIUnique = await validateUniqueDNI(dni)
    if (!isDNIUnique) {
      return handleValidationError(res, 'Ya existe una persona con ese DNI')
    }
    const isRamaValid = await validateRamaExists(rama)
    if (!isRamaValid) {
      return handleValidationError(res, 'Rama no válida')
    }

    const persona = await Persona.create({
      nombre,
      apellido,
      dni,
      direccion,
      telefono,
      email,
      fechaNacimiento,
      rama,
      funcion,
    })

    const personaCreada = await Persona.findById(persona._id).populate('rama')

    sendSuccessResponse(
      res,
      { persona: personaCreada },
      'Persona creada exitosamente',
      201
    )
  } catch (error) {
    handleServerError(res, error, 'Error creando persona')
  }
}

const updatePersona = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      dni,
      direccion,
      telefono,
      email,
      fechaNacimiento,
      rama,
      funcion,
    } = req.body

    const persona = await Persona.findOne({
      _id: req.params.id,
      deleted: false,
    })

    if (!persona) {
      return res.status(404).json({ message: 'Persona no encontrada' })
    }
    if (dni && dni !== persona.dni) {
      const personaExistente = await Persona.findOne({ dni, deleted: false })
      if (personaExistente) {
        return res
          .status(400)
          .json({ message: 'Ya existe una persona con ese DNI' })
      }
    }
    if (rama) {
      const ramaExistente = await Rama.findById(rama)
      if (!ramaExistente) {
        return res.status(400).json({ message: 'Rama no válida' })
      }
    }
    persona.nombre = nombre || persona.nombre
    persona.apellido = apellido || persona.apellido
    persona.dni = dni || persona.dni
    persona.direccion = direccion || persona.direccion
    persona.telefono = telefono || persona.telefono
    persona.email = email || persona.email
    persona.fechaNacimiento = fechaNacimiento || persona.fechaNacimiento
    persona.rama = rama || persona.rama
    persona.funcion = funcion || persona.funcion

    await persona.save()

    const personaActualizada = await Persona.findById(persona._id).populate(
      'rama'
    )

    res.json({
      message: 'Persona actualizada exitosamente',
      persona: personaActualizada,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const deletePersona = async (req, res) => {
  try {
    const persona = await Persona.findOne({
      _id: req.params.id,
      deleted: false,
    })

    if (!persona) {
      return res.status(404).json({ message: 'Persona no encontrada' })
    }

    // Soft delete - marcar como eliminada
    persona.deleted = true
    persona.activo = false // Marcar también como inactiva
    persona.deletedAt = new Date()
    await persona.save()

    // Repoblar para enviar respuesta completa
    await persona.populate({
      path: 'rama',
      select: 'nombre color',
    })

    res.json({
      message: 'Persona eliminada exitosamente',
      persona: persona,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const restorePersona = async (req, res) => {
  try {
    const persona = await Persona.findOne({
      _id: req.params.id,
      deleted: true,
    })

    if (!persona) {
      return res
        .status(404)
        .json({ message: 'Persona eliminada no encontrada' })
    }

    // Restaurar persona
    persona.deleted = false
    persona.activo = true // Marcar también como activa
    await persona.save()

    // Repoblar para enviar respuesta completa
    await persona.populate({
      path: 'rama',
      select: 'nombre color',
    })

    res.json({
      message: 'Persona restaurada exitosamente',
      persona: persona,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

module.exports = {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  restorePersona,
}
