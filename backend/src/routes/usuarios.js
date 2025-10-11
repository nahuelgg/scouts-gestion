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
const { handleValidationErrors } = require('../middleware/validation')
const {
  validateCreateUsuario,
  validateUpdateUsuario,
  validateUsuarioId,
  validateUsuarioQuery,
} = require('../validators/usuarioValidators')

router
  .route('/')
  .get(
    protect,
    requireFullAccess,
    validateUsuarioQuery,
    handleValidationErrors,
    getUsuarios
  )
  .post(
    protect,
    requireFullAccess,
    validateCreateUsuario,
    handleValidationErrors,
    createUsuario
  )

router
  .route('/:id')
  .get(
    protect,
    requireFullAccess,
    validateUsuarioId,
    handleValidationErrors,
    getUsuarioById
  )
  .put(
    protect,
    requireFullAccess,
    validateUsuarioId,
    validateUpdateUsuario,
    handleValidationErrors,
    updateUsuario
  )
  .delete(
    protect,
    requireFullAccess,
    validateUsuarioId,
    handleValidationErrors,
    deleteUsuario
  )

router
  .route('/:id/restore')
  .patch(
    protect,
    requireFullAccess,
    validateUsuarioId,
    handleValidationErrors,
    restoreUsuario
  )

module.exports = router
