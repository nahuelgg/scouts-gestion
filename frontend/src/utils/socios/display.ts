import { Persona } from '../../types'

// Utilidades para mostrar información de socios con colores y formato

export const getFuncionColor = (funcion: string): string => {
  switch (funcion) {
    case 'educador':
      return 'purple'
    case 'ayudante':
      return 'blue'
    case 'beneficiario':
      return 'green'
    default:
      return 'default'
  }
}

export const getFuncionDisplay = (funcion: string): string => {
  switch (funcion) {
    case 'educador':
      return 'Educador'
    case 'ayudante':
      return 'Ayudante'
    case 'beneficiario':
      return 'Beneficiario'
    default:
      return funcion
  }
}

export const getRamaColor = (rama: string): string => {
  switch (rama?.toLowerCase()) {
    case 'manada':
      return 'orange'
    case 'unidad':
      return 'blue'
    case 'caminantes':
      return 'green'
    case 'rovers':
      return 'purple'
    default:
      return 'default'
  }
}

export const getEstadoColor = (activo: boolean): string => {
  return activo ? 'green' : 'red'
}

export const getEstadoDisplay = (activo: boolean): string => {
  return activo ? 'Activo' : 'Inactivo'
}

export const formatAge = (fechaNacimiento: string | Date): string => {
  if (!fechaNacimiento) return 'N/A'

  const today = new Date()
  const birthDate = new Date(fechaNacimiento)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return `${age} años`
}

export const formatFullName = (persona: Persona): string => {
  return `${persona.nombre} ${persona.apellido}`
}

export const formatAddress = (persona: Persona): string => {
  if (!persona.direccion) return 'Sin dirección'

  const { calle, numero, ciudad, codigoPostal } = persona.direccion
  return `${calle} ${numero}, ${ciudad}${
    codigoPostal ? ` (${codigoPostal})` : ''
  }`
}

// Constantes para opciones de filtros
export const FUNCIONES = [
  { value: 'educador', label: 'Educador' },
  { value: 'ayudante', label: 'Ayudante' },
  { value: 'beneficiario', label: 'Beneficiario' },
]

export const ESTADOS = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
]

// Funciones de validación
export const isPersonaMayor = (persona: Persona): boolean => {
  if (!persona.fechaNacimiento) return false

  const today = new Date()
  const birthDate = new Date(persona.fechaNacimiento)
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1 >= 18
  }

  return age >= 18
}

export const canPersonaBeInRama = (persona: Persona, rama: any): boolean => {
  if (!persona.fechaNacimiento || !rama) return true

  const age = parseInt(formatAge(persona.fechaNacimiento))
  return age >= rama.edadMinima && age <= rama.edadMaxima
}
