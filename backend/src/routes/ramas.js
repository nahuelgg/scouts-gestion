const express = require('express');
const Rama = require('../models/Rama');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Obtener todas las ramas
// @route   GET /api/ramas
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const ramas = await Rama.find().populate('jefeRama', 'username');
    res.json(ramas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// @desc    Obtener una rama por ID
// @route   GET /api/ramas/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const rama = await Rama.findById(req.params.id).populate('jefeRama', 'username');
    
    if (!rama) {
      return res.status(404).json({ message: 'Rama no encontrada' });
    }

    res.json(rama);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// @desc    Crear nueva rama
// @route   POST /api/ramas
// @access  Private (administrador)
router.post('/', protect, authorize('administrador'), async (req, res) => {
  try {
    const { nombre, descripcion, edadMinima, edadMaxima, jefeRama } = req.body;

    if (!nombre || !descripcion || !edadMinima || !edadMaxima) {
      return res.status(400).json({ 
        message: 'Nombre, descripción, edad mínima y máxima son requeridos' 
      });
    }

    const rama = await Rama.create({
      nombre,
      descripcion,
      edadMinima,
      edadMaxima,
      jefeRama
    });

    const ramaCreada = await Rama.findById(rama._id).populate('jefeRama', 'username');

    res.status(201).json({
      message: 'Rama creada exitosamente',
      rama: ramaCreada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// @desc    Actualizar rama
// @route   PUT /api/ramas/:id
// @access  Private (administrador)
router.put('/:id', protect, authorize('administrador'), async (req, res) => {
  try {
    const { nombre, descripcion, edadMinima, edadMaxima, jefeRama } = req.body;

    const rama = await Rama.findById(req.params.id);

    if (!rama) {
      return res.status(404).json({ message: 'Rama no encontrada' });
    }

    rama.nombre = nombre || rama.nombre;
    rama.descripcion = descripcion || rama.descripcion;
    rama.edadMinima = edadMinima || rama.edadMinima;
    rama.edadMaxima = edadMaxima || rama.edadMaxima;
    rama.jefeRama = jefeRama || rama.jefeRama;

    await rama.save();

    const ramaActualizada = await Rama.findById(rama._id).populate('jefeRama', 'username');

    res.json({
      message: 'Rama actualizada exitosamente',
      rama: ramaActualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
