const Persona = require('../models/Persona')
const Rama = require('../models/Rama')

/**
 * Validadores de Negocio para Entidad Persona
 * Responsabilidad única: Validaciones de reglas de negocio específicas de Persona
 *
 * Funcionalidades:
 * - Validación de unicidad de DNI
 * - Validación de existencia de Rama
 * - Validación de campos requeridos de negocio
 *
 * @author Sistema de Gestión Scouts
 * @version 2.0.0 (Movido desde utils/ siguiendo principios SOLID)
 */

/**
 * Validar que un DNI no esté duplicado en el sistema
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
 * Validar que una rama existe y está activa
 * @param {string} ramaId - ID de la rama a validar
 * @returns {Promise<boolean>} - true si existe, false si no existe
 */
const validateRamaExists = async (ramaId) => {
  if (!ramaId) return true // Si no se proporciona rama, es válido

  const rama = await Rama.findById(ramaId)
  return !!rama
}

/**
 * Validar campos requeridos para persona según reglas de negocio
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

/**
 * Validar formato de DNI según reglas del negocio
 * @param {string} dni - DNI a validar
 * @returns {Object} - { isValid: boolean, message: string }
 */
const validateDNIFormat = (dni) => {
  if (!dni || typeof dni !== 'string') {
    return {
      isValid: false,
      message: 'DNI es requerido',
    }
  }

  // Remover espacios y puntos
  const cleanDNI = dni.replace(/[\s.-]/g, '')

  // Validar longitud (7-8 dígitos)
  if (!/^\d{7,8}$/.test(cleanDNI)) {
    return {
      isValid: false,
      message: 'DNI debe tener entre 7 y 8 dígitos',
    }
  }

  return { isValid: true }
}

/**
 * Validar edad mínima para scouts
 * @param {Date} fechaNacimiento - Fecha de nacimiento
 * @returns {Object} - { isValid: boolean, message: string, age: number }
 */
const validateMinimumAge = (fechaNacimiento) => {
  if (!fechaNacimiento) {
    return {
      isValid: false,
      message: 'Fecha de nacimiento es requerida',
    }
  }

  const today = new Date()
  const birthDate = new Date(fechaNacimiento)
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  // Ajustar edad si no ha cumplido años este año
  const actualAge =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ? age - 1
      : age

  // Edad mínima para scouts: 5 años
  const minimumAge = 5

  if (actualAge < minimumAge) {
    return {
      isValid: false,
      message: `Edad mínima requerida: ${minimumAge} años`,
      age: actualAge,
    }
  }

  return {
    isValid: true,
    age: actualAge,
  }
}

module.exports = {
  validateUniqueDNI,
  validateRamaExists,
  validateRequiredPersonaFields,
  validateDNIFormat,
  validateMinimumAge,
}
