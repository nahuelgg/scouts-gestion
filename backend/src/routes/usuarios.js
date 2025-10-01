const express = require('express')
const router = express.Router()
const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  restoreUsuario,
} = require('../controllers/usuarioController')
const { protect, requireFullAccess } = require('../middleware/auth')

router
  .route('/')
  .get(protect, requireFullAccess, getUsuarios)
  .post(protect, requireFullAccess, createUsuario)

router
  .route('/:id')
  .get(protect, requireFullAccess, getUsuarioById)
  .put(protect, requireFullAccess, updateUsuario)
  .delete(protect, requireFullAccess, deleteUsuario)

router.route('/:id/restore').patch(protect, requireFullAccess, restoreUsuario)

module.exports = router
