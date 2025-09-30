const express = require('express')
const router = express.Router()
const { getRoles, getRolById } = require('../controllers/rolController')
const { protect } = require('../middleware/auth')

router.route('/').get(protect, getRoles)

router.route('/:id').get(protect, getRolById)

module.exports = router
