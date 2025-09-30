const Usuario = require('../models/Usuario')
const bcrypt = require('bcryptjs')

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Private (administrador, jefe de grupo)
const getUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 10, rol, activo, search } = req.query

    let filter = {}

    if (rol && rol !== '') {
      filter.rol = rol
    }

    if (activo !== undefined) {
      filter.activo = activo === 'true'
    }

    if (search) {
      // Buscar por username o datos de la persona
      filter.$or = [{ username: new RegExp(search, 'i') }]
    }

    const usuarios = await Usuario.find(filter)
      .populate('persona', 'nombre apellido dni telefono email')
      .populate('rol', 'nombre descripcion permisos')
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
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Obtener un usuario por ID
// @route   GET /api/usuarios/:id
// @access  Private (administrador, jefe de grupo)
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
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Crear nuevo usuario
// @route   POST /api/usuarios
// @access  Private (administrador, jefe de grupo)
const createUsuario = async (req, res) => {
  try {
    const { username, password, persona, rol, activo = true } = req.body

    // Verificar si el username ya existe
    const existingUser = await Usuario.findOne({ username })
    if (existingUser) {
      return res.status(400).json({
        message: 'El nombre de usuario ya está en uso',
      })
    }

    // Verificar si la persona ya tiene un usuario
    const existingPersonaUser = await Usuario.findOne({ persona })
    if (existingPersonaUser) {
      return res.status(400).json({
        message: 'Esta persona ya tiene un usuario asociado',
      })
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const usuario = new Usuario({
      username,
      password: hashedPassword,
      persona,
      rol,
      activo,
    })

    await usuario.save()

    // Obtener el usuario con datos poblados
    const usuarioCompleto = await Usuario.findById(usuario._id)
      .populate('persona', 'nombre apellido dni')
      .populate('rol', 'nombre descripcion')

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioCompleto,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Actualizar usuario
// @route   PUT /api/usuarios/:id
// @access  Private (administrador, jefe de grupo)
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { username, password, persona, rol, activo } = req.body

    const usuario = await Usuario.findById(id)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Verificar username único (excluyendo el usuario actual)
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

    // Verificar persona única (excluyendo el usuario actual)
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

    // Actualizar campos
    if (username) usuario.username = username
    if (persona) usuario.persona = persona
    if (rol) usuario.rol = rol
    if (activo !== undefined) usuario.activo = activo

    // Hash nueva contraseña si se proporciona
    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10)
      usuario.password = await bcrypt.hash(password, salt)
    }

    await usuario.save()

    // Obtener usuario actualizado con datos poblados
    const usuarioActualizado = await Usuario.findById(id)
      .populate('persona', 'nombre apellido dni')
      .populate('rol', 'nombre descripcion')

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

// @desc    Desactivar usuario (soft delete)
// @route   DELETE /api/usuarios/:id
// @access  Private (administrador, jefe de grupo)
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params

    const usuario = await Usuario.findById(id)
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    // Soft delete - marcar como inactivo
    usuario.activo = false
    await usuario.save()

    res.json({ message: 'Usuario desactivado exitosamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
}
