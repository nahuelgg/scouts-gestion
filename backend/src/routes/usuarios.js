const express = require('express');
const router = express.Router();
const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
} = require('../controllers/usuarioController');
const { protect, requireFullAccess } = require('../middleware/auth');

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', protect, requireFullAccess, getUsuarios);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', protect, requireFullAccess, getUsuarioById);

// POST /api/usuarios - Crear nuevo usuario
router.post('/', protect, requireFullAccess, createUsuario);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', protect, requireFullAccess, updateUsuario);

// DELETE /api/usuarios/:id - Desactivar usuario
router.delete('/:id', protect, requireFullAccess, deleteUsuario);

module.exports = router;
