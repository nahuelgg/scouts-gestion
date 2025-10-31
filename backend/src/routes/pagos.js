const express = require('express')
const {
  getPagos,
  getPagoById,
  createPago,
  updatePago,
  deletePago,
  restorePago,
  getResumenPagosSocio,
} = require('../controllers/pagoController')
const {
  protect,
  authorize,
  requirePermission,
  checkRamaAccess,
  requireFullAccess,
  checkRestrictedAccess,
  requirePermissionOrRestricted,
  requireDeletePagoAccess,
  requireRestorePagoAccess,
} = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const { uploadComprobanteWithErrorHandling } = require('../middleware/upload')
const { validateComprobanteFile } = require('../middleware/fileValidation')
const {
  validateCreatePago,
  validateUpdatePago,
  validatePagoId,
  validateSocioId,
  validatePagoQuery,
} = require('../validators/pagoValidators')

const router = express.Router()

router
  .route('/')
  .get(
    protect,
    checkRestrictedAccess, // Permitir acceso con restricciones apropiadas
    validatePagoQuery,
    handleValidationErrors,
    getPagos
  )
  .post(
    protect,
    requirePermission('gestionar_pagos'),
    uploadComprobanteWithErrorHandling,
    validateComprobanteFile,
    validateCreatePago,
    handleValidationErrors,
    checkRamaAccess,
    createPago
  )

router
  .route('/:id')
  .get(
    protect,
    checkRestrictedAccess, // Permitir acceso con restricciones apropiadas
    validatePagoId,
    handleValidationErrors,
    getPagoById
  )
  .put(
    protect,
    requirePermission('gestionar_pagos'),
    validatePagoId,
    uploadComprobanteWithErrorHandling,
    validateComprobanteFile,
    validateUpdatePago,
    handleValidationErrors,
    checkRamaAccess,
    updatePago
  )
  .delete(
    protect,
    requireDeletePagoAccess,
    validatePagoId,
    handleValidationErrors,
    deletePago
  )

router
  .route('/:id/restore')
  .patch(
    protect,
    requireRestorePagoAccess,
    validatePagoId,
    handleValidationErrors,
    restorePago
  )

router
  .route('/resumen/:socioId')
  .get(protect, validateSocioId, handleValidationErrors, getResumenPagosSocio)

module.exports = router
