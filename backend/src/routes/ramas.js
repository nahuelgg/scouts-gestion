const express = require('express')
const {
  getRamas,
  getRamaById,
  createRama,
  updateRama,
  deleteRama,
} = require('../controllers/ramaController')
const { protect, authorize } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const {
  validateCreateRama,
  validateUpdateRama,
  validateRamaId,
} = require('../validators/ramaValidators')

const router = express.Router()

router
  .route('/')
  .get(protect, getRamas)
  .post(
    protect,
    authorize('administrador'),
    validateCreateRama,
    handleValidationErrors,
    createRama
  )

router
  .route('/:id')
  .get(protect, validateRamaId, handleValidationErrors, getRamaById)
  .put(
    protect,
    authorize('administrador'),
    validateRamaId,
    validateUpdateRama,
    handleValidationErrors,
    updateRama
  )
  .delete(
    protect,
    authorize('administrador'),
    validateRamaId,
    handleValidationErrors,
    deleteRama
  )

module.exports = router
