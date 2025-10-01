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
} = require('../middleware/auth')

const router = express.Router()

router
  .route('/')
  .get(
    protect,
    requirePermission('gestionar_socios'),
    checkRestrictedAccess,
    getPersonas
  )
  .post(
    protect,
    requirePermission('gestionar_socios'),
    checkRamaAccess,
    createPersona
  )

router
  .route('/:id')
  .get(
    protect,
    requirePermission('gestionar_socios'),
    checkRestrictedAccess,
    getPersonaById
  )
  .put(
    protect,
    requirePermission('gestionar_socios'),
    checkRamaAccess,
    updatePersona
  )
  .delete(protect, requireFullAccess, deletePersona)

// Ruta específica para restaurar persona
router.route('/:id/restore').patch(protect, requireFullAccess, restorePersona)

module.exports = router
