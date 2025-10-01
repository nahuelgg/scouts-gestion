const Persona = require('../models/Persona')
const Rama = require('../models/Rama')

// @desc    Obtener todas las personas
// @route   GET /api/personas
// @access  Private
const getPersonas = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      rama = '',
      dni = '',
      includeDeleted = true,
    } = req.query

    // Construir filtros
    let filter = {}

    // Por defecto mostrar todas (incluidas eliminadas)
    // Solo excluir eliminadas si se solicita específicamente
    if (includeDeleted === 'false') {
      filter.deleted = false
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
    console.error('Error en getPersonas:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Obtener una persona por ID
// @route   GET /api/personas/:id
// @access  Private
const getPersonaById = async (req, res) => {
  try {
    const persona = await Persona.findOne({
      _id: req.params.id,
      deleted: false,
    }).populate('rama')

    if (!persona) {
      return res.status(404).json({ message: 'Persona no encontrada' })
    }

    res.json(persona)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Crear nueva persona
// @route   POST /api/personas
// @access  Private (jefe de rama, administrador)
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

    // Validar campos requeridos
    if (!nombre || !apellido || !dni || !direccion || !telefono) {
      return res.status(400).json({
        message: 'Nombre, apellido, DNI, dirección y teléfono son requeridos',
      })
    }

    // Verificar si el DNI ya existe
    const personaExistente = await Persona.findOne({ dni, deleted: false })
    if (personaExistente) {
      return res
        .status(400)
        .json({ message: 'Ya existe una persona con ese DNI' })
    }

    // Verificar que la rama existe
    if (rama) {
      const ramaExistente = await Rama.findById(rama)
      if (!ramaExistente) {
        return res.status(400).json({ message: 'Rama no válida' })
      }
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

    res.status(201).json({
      message: 'Persona creada exitosamente',
      persona: personaCreada,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Actualizar persona
// @route   PUT /api/personas/:id
// @access  Private (jefe de rama, administrador)
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

    // Verificar si el DNI ya existe en otra persona
    if (dni && dni !== persona.dni) {
      const personaExistente = await Persona.findOne({ dni, deleted: false })
      if (personaExistente) {
        return res
          .status(400)
          .json({ message: 'Ya existe una persona con ese DNI' })
      }
    }

    // Verificar que la rama existe
    if (rama) {
      const ramaExistente = await Rama.findById(rama)
      if (!ramaExistente) {
        return res.status(400).json({ message: 'Rama no válida' })
      }
    }

    // Actualizar campos
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
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Eliminar persona (soft delete)
// @route   DELETE /api/personas/:id
// @access  Private (administrador)
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
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Restaurar persona eliminada
// @route   PATCH /api/personas/:id/restore
// @access  Private (administrador)
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
    console.error(error)
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
