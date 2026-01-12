const Rol = require('../models/Rol')

const getRoles = async (req, res) => {
  try {
    const roles = await Rol.find({ activo: { $ne: false } }).sort({ nombre: 1 })

    res.json(roles)
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

const getRolById = async (req, res) => {
  try {
    const { id } = req.params
    const rol = await Rol.findById(id)

    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' })
    }

    res.json(rol)
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' })
  }
}

module.exports = {
  getRoles,
  getRolById,
}
