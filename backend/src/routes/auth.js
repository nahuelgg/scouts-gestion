const express = require('express')
const {
  login,
  getProfile,
  changePassword,
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/login', login)

router
  .route('/profile')
  .get(protect, getProfile)

router
  .route('/change-password')
  .put(protect, changePassword)

module.exports = router
