const Persona = require('../models/Persona')
const Rama = require('../models/Rama')

/**
 * Validar que un DNI no esté duplicado
 * @param {string} dni - DNI a validar
 * @param {string} excludeId - ID a excluir de la búsqueda (para edición)
 * @returns {Promise<boolean>} - true si es válido, false si está duplicado
 */
const validateUniqueDNI = async (dni, excludeId = null) => {
  const filter = { dni, deleted: false }
  if (excludeId) {
    filter._id = { $ne: excludeId }
  }

  const existingPersona = await Persona.findOne(filter)
  return !existingPersona
}

/**
 * Validar que una rama existe
 * @param {string} ramaId - ID de la rama a validar
 * @returns {Promise<boolean>} - true si existe, false si no existe
 */
const validateRamaExists = async (ramaId) => {
  if (!ramaId) return true // Si no se proporciona rama, es válido

  const rama = await Rama.findById(ramaId)
  return !!rama
}

/**
 * Validar campos requeridos para persona
 * @param {Object} data - Datos de la persona
 * @returns {Object} - { isValid: boolean, message: string }
 */
const validateRequiredPersonaFields = (data) => {
  const { nombre, apellido, dni, direccion, telefono } = data

  if (!nombre || !apellido || !dni || !direccion || !telefono) {
    return {
      isValid: false,
      message: 'Nombre, apellido, DNI, dirección y teléfono son requeridos',
    }
  }

  return { isValid: true }
}

module.exports = {
  validateUniqueDNI,
  validateRamaExists,
  validateRequiredPersonaFields,
}
