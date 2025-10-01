const express = require('express')
const {
  getPagos,
  getPagoById,
  createPago,
  updatePago,
  deletePago,
  restorePago,
  getResumenPagosSocio,
  upload,
} = require('../controllers/pagoController')
const {
  protect,
  authorize,
  requirePermission,
  checkRamaAccess,
  requireFullAccess,
} = require('../middleware/auth')

const router = express.Router()

router
  .route('/')
  .get(protect, requirePermission('gestionar_pagos'), getPagos)
  .post(
    protect,
    requirePermission('gestionar_pagos'),
    checkRamaAccess,
    upload.single('comprobante'),
    createPago
  )

router
  .route('/:id')
  .get(
    protect,
    requirePermission('gestionar_pagos'),
    checkRamaAccess,
    getPagoById
  )
  .put(
    protect,
    requirePermission('gestionar_pagos'),
    checkRamaAccess,
    upload.single('comprobante'),
    updatePago
  )
  .delete(protect, requireFullAccess, deletePago)

router.route('/:id/restore').patch(protect, requireFullAccess, restorePago)

router.route('/resumen/:socioId').get(protect, getResumenPagosSocio)

module.exports = router
