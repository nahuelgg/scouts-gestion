const express = require('express')
const router = express.Router()
const {
  getFullHealth,
  getLiveness,
  getReadiness,
  getHealthHistory,
  getMetrics,
} = require('../controllers/healthController')

// Middleware de autenticación (solo para endpoints privados)
const { protect } = require('../middleware/auth')

/**
 * Rutas públicas de health check
 * Estas pueden ser usadas por load balancers, monitores externos, etc.
 */

// @route   GET /api/health
// @desc    Health check completo del sistema
// @access  Public
router.get('/', getFullHealth)

// @route   GET /api/health/live
// @desc    Liveness probe - verificar si la app está viva
// @access  Public
router.get('/live', getLiveness)

// @route   GET /api/health/ready
// @desc    Readiness probe - verificar si la app está lista para recibir tráfico
// @access  Public
router.get('/ready', getReadiness)

/**
 * Rutas privadas de health check
 * Requieren autenticación para acceder
 */

// @route   GET /api/health/history
// @desc    Historial de health checks
// @access  Private
router.get('/history', protect, getHealthHistory)

// @route   GET /api/health/metrics
// @desc    Métricas del sistema para monitoreo
// @access  Private
router.get('/metrics', protect, getMetrics)

module.exports = router
