const express = require('express')
const {
  getPagos,
  getPagoById,
  createPago,
  updatePago,
  deletePago,
  getResumenPagosSocio,
  upload,
} = require('../controllers/pagoController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

// Rutas principales
router
  .route('/')
  .get(protect, getPagos)
  .post(
    protect,
    authorize('jefe_de_rama', 'administrador'),
    upload.single('comprobante'),
    createPago
  )

router
  .route('/:id')
  .get(protect, getPagoById)
  .put(
    protect,
    authorize('jefe_de_rama', 'administrador'),
    upload.single('comprobante'),
    updatePago
  )
  .delete(protect, authorize('administrador'), deletePago)

// Ruta para resumen de pagos por socio
router.get('/resumen/:socioId', protect, getResumenPagosSocio)

module.exports = router
