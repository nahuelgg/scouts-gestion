/**
 * Utilidades para formateo de números y moneda
 */

/**
 * Formatea un número como moneda con formato personalizado:
 * - Punto (.) como separador de miles
 * - Coma (,) como separador de decimales
 * @param amount - El monto a formatear
 * @param decimals - Número de decimales (por defecto 2)
 * @returns String formateado como moneda
 */
export const formatCurrency = (
  amount: number,
  decimals: number = 2
): string => {
  if (isNaN(amount)) {
    return '$0,00'
  }

  // Convertir a número fijo con decimales especificados
  const fixed = amount.toFixed(decimals)

  // Separar parte entera y decimal
  const [integerPart, decimalPart] = fixed.split('.')

  // Formatear parte entera con puntos como separadores de miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  // Combinar con coma como separador decimal
  return `$${formattedInteger},${decimalPart}`
}

/**
 * Formatea un número sin el símbolo de moneda
 * @param amount - El monto a formatear
 * @param decimals - Número de decimales (por defecto 2)
 * @returns String formateado sin símbolo de moneda
 */
export const formatNumber = (amount: number, decimals: number = 2): string => {
  if (isNaN(amount)) {
    return '0,00'
  }

  const fixed = amount.toFixed(decimals)
  const [integerPart, decimalPart] = fixed.split('.')
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${formattedInteger},${decimalPart}`
}

/**
 * Parsea un string de moneda a número
 * Acepta formatos: "1.234,56", "1234,56", "1234.56", "1234"
 * @param value - String a parsear
 * @returns Número parseado
 */
export const parseCurrency = (value: string): number => {
  if (!value || typeof value !== 'string') {
    return 0
  }

  // Remover símbolos de moneda y espacios
  let cleaned = value.replace(/[$\s]/g, '')

  // Si hay tanto punto como coma, asumir que el último es decimal
  if (cleaned.includes('.') && cleaned.includes(',')) {
    const lastDot = cleaned.lastIndexOf('.')
    const lastComma = cleaned.lastIndexOf(',')

    if (lastComma > lastDot) {
      // La coma es el separador decimal
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      // El punto es el separador decimal
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes(',')) {
    // Solo hay comas - verificar si es separador decimal o de miles
    const parts = cleaned.split(',')
    if (parts.length === 2 && parts[1].length <= 2) {
      // Probablemente separador decimal
      cleaned = cleaned.replace(',', '.')
    } else {
      // Probablemente separador de miles
      cleaned = cleaned.replace(/,/g, '')
    }
  }

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
