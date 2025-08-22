const express = require('express');
const {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
} = require('../controllers/personaController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getPersonas)
  .post(protect, authorize('jefe_de_rama', 'administrador'), createPersona);

router.route('/:id')
  .get(protect, getPersonaById)
  .put(protect, authorize('jefe_de_rama', 'administrador'), updatePersona)
  .delete(protect, authorize('administrador'), deletePersona);

module.exports = router;
