// Colores estándar para las ramas del movimiento scout
export const RAMA_COLORS = {
  manada: 'volcano', // Naranja/rojo para lobatos
  unidad: 'green', // Verde para scouts
  caminantes: 'blue', // Azul para caminantes
  rovers: 'purple', // Púrpura para rovers
} as const

// Función helper para obtener el color de una rama
export const getRamaColor = (ramaNombre: string): string => {
  return RAMA_COLORS[ramaNombre as keyof typeof RAMA_COLORS] || 'default'
}

// Nombres de ramas en español
export const RAMA_NAMES = {
  manada: 'Manada',
  unidad: 'Unidad Scout',
  caminantes: 'Caminantes',
  rovers: 'Rovers',
} as const

// Función helper para obtener el nombre formateado de una rama
export const getRamaDisplayName = (ramaNombre: string): string => {
  return RAMA_NAMES[ramaNombre as keyof typeof RAMA_NAMES] || ramaNombre
}
