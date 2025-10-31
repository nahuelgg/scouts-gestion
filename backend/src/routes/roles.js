const express = require('express')
const router = express.Router()
const { getRoles, getRolById } = require('../controllers/rolController')
const { protect } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const { validateRolId } = require('../validators/rolValidators')

router.route('/').get(protect, getRoles)

router
  .route('/:id')
  .get(protect, validateRolId, handleValidationErrors, getRolById)

module.exports = router
