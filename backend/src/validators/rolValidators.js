const { param } = require('express-validator')
const mongoose = require('mongoose')

/**
 * Validación para parámetros de ID de rol
 */
const validateRolId = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('ID de rol inválido')
    }
    return true
  }),
]

module.exports = {
  validateRolId,
}
