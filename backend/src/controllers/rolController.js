const Rol = require('../models/Rol')

// @desc    Obtener todos los roles
// @route   GET /api/roles
// @access  Private
const getRoles = async (req, res) => {
  try {
    const roles = await Rol.find({ activo: { $ne: false } })
      .sort({ nombre: 1 })
    
    res.json(roles)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
};

// @desc    Obtener un rol por ID
// @route   GET /api/roles/:id
// @access  Private
const getRolById = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await Rol.findById(id);
    
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    res.json(rol);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error del servidor' })
  }
};

module.exports = {
  getRoles,
  getRolById
}