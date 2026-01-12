const Usuario = require('../models/Usuario')
const Persona = require('../models/Persona')
const bcrypt = require('bcryptjs')

const getUsuarios = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      rol,
      activo,
      search,
      includeDeleted = true,
    } = req.query

    let filter = {}

    // Por defecto mostrar todos (incluidos eliminados)
    // Solo excluir eliminados si se solicita específicamente
    if (includeDeleted === 'false') {
      filter.deleted = { $ne: true }
    }

    if (rol && rol !== '') {
      filter.rol = rol
    }

    if (activo !== undefined) {
      filter.activo = activo === 'true'
    }

    if (search) {
      // Buscar personas que coincidan con el término de búsqueda
      const personas = await Persona.find({
        $or: [
          { nombre: new RegExp(search, 'i') },
          { apellido: new RegExp(search, 'i') },
          { dni: new RegExp(search, 'i') },
        ],
      }).select('_id')

      const personaIds = personas.map((p) => p._id)

      // Buscar por username o por ID de persona encontrada
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { persona: { $in: personaIds } },
      ]
    }

    const usuarios = await Usuario.find(filter)
      .populate({
        path: 'persona',
        select: 'nombre apellido dni telefono email',
        populate: {
          path: 'rama',
          select: 'nombre',
        },
      })
      .populate('rol', 'nombre descripcion permisos')
      .populate('deletedBy', 'username')
      .sort({ username: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Usuario.countDocuments(filter)

    res.json({
      usuarios,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = await Usuario.findById(id)
      .populate(
        'persona',
        'nombre apellido dni direccion telefono email fechaNacimiento rama funcion'
      )
      .populate('rol', 'nombre descripcion permisos')
      .populate({
        path: 'persona',
        populate: {
          path: 'rama',
          select: 'nombre descripcion edadMinima edadMaxima',
        },
      })

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json(usuario)
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const createUsuario = async (req, res) => {
  try {
    const { username, password, persona, rol, activo = true } = req.body
    const existingUser = await Usuario.findOne({ username })
    if (existingUser) {
      return res.status(400).json({
        message: 'El nombre de usuario ya está en uso',
      })
    }
    const existingPersonaUser = await Usuario.findOne({ persona })
    if (existingPersonaUser) {
      return res.status(400).json({
        message: 'Esta persona ya tiene un usuario asociado',
      })
    }
    const usuario = new Usuario({
      username,
      password, // Sin hashear, el middleware lo hará
      persona,
      rol,
      activo,
    })

    await usuario.save()
    const usuarioCompleto = await Usuario.findById(usuario._id)
      .populate('persona', 'nombre apellido dni')
      .populate('rol', 'nombre descripcion')

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioCompleto,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { username, password, persona, rol, activo } = req.body

    const usuario = await Usuario.findById(id)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    if (username && username !== usuario.username) {
      const existingUser = await Usuario.findOne({
        username,
        _id: { $ne: id },
      })
      if (existingUser) {
        return res.status(400).json({
          message: 'El nombre de usuario ya está en uso',
        })
      }
    }
    if (persona && persona !== usuario.persona.toString()) {
      const existingPersonaUser = await Usuario.findOne({
        persona,
        _id: { $ne: id },
      })
      if (existingPersonaUser) {
        return res.status(400).json({
          message: 'Esta persona ya tiene un usuario asociado',
        })
      }
    }
    if (username) usuario.username = username
    if (persona) usuario.persona = persona
    if (rol) usuario.rol = rol
    if (activo !== undefined) usuario.activo = activo

    // Asignar nueva contraseña si se proporciona (el middleware se encargará del hash)
    if (password && password.length > 0) {
      usuario.password = password
    }

    await usuario.save()
    const usuarioActualizado = await Usuario.findById(id)
      .populate('persona', 'nombre apellido dni')
      .populate('rol', 'nombre descripcion')

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params

    const usuario = await Usuario.findById(id).populate('rol', 'nombre')
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (usuario.deleted) {
      return res.status(400).json({ message: 'El usuario ya está eliminado' })
    }
    if (usuario._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'No puedes eliminar tu propio usuario',
      })
    }

    // Jefe de grupo no puede eliminar administradores
    if (
      req.user.rol.nombre === 'jefe de grupo' &&
      usuario.rol.nombre === 'administrador'
    ) {
      return res.status(403).json({
        message: 'No tienes permisos para eliminar administradores',
      })
    }
    if (usuario.rol.nombre === 'administrador') {
      const adminCount = await Usuario.countDocuments({
        rol: usuario.rol._id,
        deleted: { $ne: true },
      })

      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'No se puede eliminar el último administrador del sistema',
        })
      }
    }

    // Eliminación lógica
    usuario.deleted = true
    usuario.deletedAt = new Date()
    usuario.deletedBy = req.user._id
    usuario.activo = false

    await usuario.save()
    const usuarioEliminado = await Usuario.findById(id)
      .populate({
        path: 'persona',
        populate: {
          path: 'rama',
          select: 'nombre',
        },
      })
      .populate('rol', 'nombre descripcion')
      .populate('deletedBy', 'username')

    res.json({
      message: 'Usuario eliminado exitosamente',
      usuario: usuarioEliminado,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const restoreUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (!usuario.deleted) {
      return res.status(400).json({ message: 'El usuario no está eliminado' })
    }
    const usernameExistente = await Usuario.findOne({
      username: usuario.username,
      _id: { $ne: req.params.id },
      deleted: { $ne: true },
    })

    if (usernameExistente) {
      return res.status(400).json({
        message: 'No se puede restaurar: el username ya está en uso',
      })
    }

    // Restaurar usuario
    usuario.deleted = false
    usuario.deletedAt = undefined
    usuario.deletedBy = undefined
    usuario.activo = true

    await usuario.save()

    const usuarioRestaurado = await Usuario.findById(usuario._id)
      .populate({
        path: 'persona',
        populate: {
          path: 'rama',
          select: 'nombre',
        },
      })
      .populate('rol', 'nombre descripcion')

    res.json({
      message: 'Usuario restaurado exitosamente',
      usuario: usuarioRestaurado,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  restoreUsuario,
}
