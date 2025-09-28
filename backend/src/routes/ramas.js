const express = require('express')
const {
  getRamas,
  getRamaById,
  createRama,
  updateRama,
  deleteRama
} = require('../controllers/ramaController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router
  .route('/')
  .get(protect, getRamas)
  .post(protect, authorize('administrador'), createRama)

router
  .route('/:id')
  .get(protect, getRamaById)
  .put(protect, authorize('administrador'), updateRama)
  .delete(protect, authorize('administrador'), deleteRama)

module.exports = router
