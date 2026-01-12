const Persona = require('../models/Persona')
const Rama = require('../models/Rama')

const validateUniqueDNI = async (dni, excludeId = null) => {
  const filter = { dni, deleted: false }
  if (excludeId) {
    filter._id = { $ne: excludeId }
  }

  const existingPersona = await Persona.findOne(filter)
  return !existingPersona
}

const validateRamaExists = async (ramaId) => {
  if (!ramaId) return true // Si no se proporciona rama, es válido

  const rama = await Rama.findById(ramaId)
  return !!rama
}

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

const validateDNIFormat = (dni) => {
  if (!dni || typeof dni !== 'string') {
    return {
      isValid: false,
      message: 'DNI es requerido',
    }
  }

  // Remover espacios y puntos
  const cleanDNI = dni.replace(/[\s.-]/g, '')
  if (!/^\d{7,8}$/.test(cleanDNI)) {
    return {
      isValid: false,
      message: 'DNI debe tener entre 7 y 8 dígitos',
    }
  }

  return { isValid: true }
}

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
