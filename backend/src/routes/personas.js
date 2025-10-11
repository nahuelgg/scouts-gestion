const express = require('express')
const {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  restorePersona,
} = require('../controllers/personaController')
const {
  protect,
  authorize,
  requirePermission,
  checkRamaAccess,
  requireFullAccess,
  checkRestrictedAccess,
  requirePermissionOrRestricted,
} = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const {
  validateCreatePersona,
  validateUpdatePersona,
  validatePersonaId,
  validatePersonaQuery,
} = require('../validators/personaValidators')

const router = express.Router()

router
  .route('/')
  .get(
    protect,
    checkRestrictedAccess, // Permitir acceso con restricciones apropiadas
    validatePersonaQuery,
    handleValidationErrors,
    getPersonas
  )
  .post(
    protect,
    requirePermission('gestionar_socios'),
    validateCreatePersona,
    handleValidationErrors,
    checkRamaAccess,
    createPersona
  )

router
  .route('/:id')
  .get(
    protect,
    checkRestrictedAccess, // Permitir acceso con restricciones apropiadas
    validatePersonaId,
    handleValidationErrors,
    getPersonaById
  )
  .put(
    protect,
    requirePermission('gestionar_socios'),
    validatePersonaId,
    validateUpdatePersona,
    handleValidationErrors,
    checkRamaAccess,
    updatePersona
  )
  .delete(
    protect,
    requireFullAccess,
    validatePersonaId,
    handleValidationErrors,
    deletePersona
  )

// Ruta específica para restaurar persona
router
  .route('/:id/restore')
  .patch(
    protect,
    requireFullAccess,
    validatePersonaId,
    handleValidationErrors,
    restorePersona
  )

module.exports = router
