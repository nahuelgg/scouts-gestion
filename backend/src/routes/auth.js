const express = require('express')
const {
  login,
  getProfile,
  changePassword,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { handleValidationErrors } = require('../middleware/validation')
const {
  validateLogin,
  validateChangePassword,
} = require('../validators/authValidators')

const router = express.Router()

router.post('/login', validateLogin, handleValidationErrors, login)

router.route('/profile').get(protect, getProfile)

router
  .route('/change-password')
  .put(protect, validateChangePassword, handleValidationErrors, changePassword)

module.exports = router
