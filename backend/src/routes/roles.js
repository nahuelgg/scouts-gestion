const express = require('express');
const router = express.Router();
const { getRoles, getRolById } = require('../controllers/rolController');
const { protect } = require('../middleware/auth');

// GET /api/roles - Obtener todos los roles
router.get('/', protect, getRoles);

// GET /api/roles/:id - Obtener rol por ID
router.get('/:id', protect, getRolById);

module.exports = router;