// Utilidades para mostrar información de pagos con colores y formato

export const getMetodoPagoColor = (metodo: string): string => {
  switch (metodo) {
    case 'efectivo':
      return 'green'
    case 'transferencia':
      return 'blue'
    case 'tarjeta_debito':
      return 'orange'
    case 'tarjeta_credito':
      return 'purple'
    default:
      return 'default'
  }
}

export const getMetodoPagoDisplay = (metodo: string): string => {
  switch (metodo) {
    case 'efectivo':
      return 'Efectivo'
    case 'transferencia':
      return 'Transferencia'
    case 'tarjeta_debito':
      return 'Tarjeta Débito'
    case 'tarjeta_credito':
      return 'Tarjeta Crédito'
    default:
      return metodo
  }
}

export const getTipoPagoColor = (tipo: string): string => {
  switch (tipo) {
    case 'mensual':
      return 'blue'
    case 'afiliacion':
      return 'green'
    case 'campamento':
      return 'orange'
    case 'otro':
      return 'purple'
    default:
      return 'default'
  }
}

export const getTipoPagoDisplay = (tipo: string): string => {
  switch (tipo) {
    case 'mensual':
      return 'Mensual'
    case 'afiliacion':
      return 'Afiliación'
    case 'campamento':
      return 'Campamento'
    case 'otro':
      return 'Otro'
    default:
      return tipo
  }
}

export const getEstadoColor = (estado: string): string => {
  switch (estado) {
    case 'confirmado':
      return 'green'
    case 'pendiente':
      return 'orange'
    case 'rechazado':
      return 'red'
    default:
      return 'default'
  }
}

export const getEstadoDisplay = (estado: string): string => {
  switch (estado) {
    case 'confirmado':
      return 'Confirmado'
    case 'pendiente':
      return 'Pendiente'
    case 'rechazado':
      return 'Rechazado'
    default:
      return estado
  }
}

// Constantes para opciones de filtros
export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta_debito', label: 'Tarjeta Débito' },
  { value: 'tarjeta_credito', label: 'Tarjeta Crédito' },
]

export const TIPOS_PAGO = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'afiliacion', label: 'Afiliación' },
  { value: 'campamento', label: 'Campamento' },
  { value: 'otro', label: 'Otro' },
]

export const ESTADOS_PAGO = [
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'rechazado', label: 'Rechazado' },
]

export const MESES = [
  { value: '2024-01', label: 'Enero 2024' },
  { value: '2024-02', label: 'Febrero 2024' },
  { value: '2024-03', label: 'Marzo 2024' },
  { value: '2024-04', label: 'Abril 2024' },
  { value: '2024-05', label: 'Mayo 2024' },
  { value: '2024-06', label: 'Junio 2024' },
  { value: '2024-07', label: 'Julio 2024' },
  { value: '2024-08', label: 'Agosto 2024' },
  { value: '2024-09', label: 'Septiembre 2024' },
  { value: '2024-10', label: 'Octubre 2024' },
  { value: '2024-11', label: 'Noviembre 2024' },
  { value: '2024-12', label: 'Diciembre 2024' },
]
