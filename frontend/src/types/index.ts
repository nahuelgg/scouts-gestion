export interface User {
  _id: string
  username: string
  persona: Persona
  rol: Rol
  activo: boolean
  ultimoLogin?: Date
  token?: string
  deleted?: boolean
  deletedAt?: Date
  deletedBy?: User
}

export interface Persona {
  _id: string
  nombre: string
  apellido: string
  dni: string
  direccion: {
    calle: string
    numero: string
    ciudad: string
    codigoPostal?: string
  }
  telefono: string
  email?: string
  fechaNacimiento?: Date
  rama?: Rama
  funcion: 'ayudante' | 'beneficiario' | 'educador'
  activo: boolean
  deleted?: boolean
  deletedAt?: Date
  deletedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface Rol {
  _id: string
  nombre: 'administrador' | 'jefe de rama' | 'jefe de grupo' | 'socio'
  descripcion: string
  permisos: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Rama {
  _id: string
  nombre: 'manada' | 'unidad' | 'caminantes' | 'rovers'
  descripcion: string
  edadMinima: number
  edadMaxima: number
  jefeRama?: User
  createdAt: Date
  updatedAt: Date
}

export interface Pago {
  _id: string
  socio: Persona
  monto: number
  fechaPago: Date
  mesCorrespondiente: string
  metodoPago:
    | 'efectivo'
    | 'transferencia'
    | 'tarjeta_debito'
    | 'tarjeta_credito'
  comprobante?: {
    filename: string
    originalName: string
    path: string
    size: number
    mimetype: string
  }
  observaciones?: string
  registradoPor: User
  modificadoPor?: User
  estado: 'pendiente' | 'confirmado' | 'rechazado'
  deleted?: boolean
  deletedAt?: Date
  deletedBy?: User
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface ApiResponse<T> {
  message?: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalPages: number
  currentPage: number
  total: number
}

export interface PersonaFormData {
  nombre: string
  apellido: string
  dni: string
  direccion: {
    calle: string
    numero: string
    ciudad: string
    codigoPostal?: string
  }
  telefono: string
  email?: string
  fechaNacimiento?: Date
  rama?: string
  funcion?: string
}

export interface PagoFormData {
  socio: string
  monto: number
  fechaPago: Date
  mesCorrespondiente: string
  metodoPago:
    | 'efectivo'
    | 'transferencia'
    | 'tarjeta_debito'
    | 'tarjeta_credito'
  observaciones?: string
  comprobante?: File
}

// Tipos para parámetros de API
export interface FetchPersonasParams {
  page?: number
  limit?: number
  rama?: string
  search?: string
  includeDeleted?: boolean
}

export interface FetchPagosParams {
  page?: number
  limit?: number
  socio?: string
  año?: number
  mes?: string
  includeDeleted?: boolean
}

// Interfaces para formularios adicionales
export interface RamaFormData {
  nombre: 'manada' | 'unidad' | 'caminantes' | 'rovers'
  descripcion: string
  edadMinima: number
  edadMaxima: number
  jefeRama?: string
}

// Interfaces para usuarios
export interface UsuarioFormData {
  username: string
  password: string
  persona: string
  rol: string
  activo?: boolean
}

// Tipos para parámetros de API de usuarios
export interface FetchUsuariosParams {
  page?: number
  limit?: number
  rol?: string
  activo?: boolean
  search?: string
}

// Tipos para respuestas específicas de usuarios
export interface UsuarioResponse {
  usuario: User
  message: string
}

export interface UsuariosListResponse {
  usuarios: User[]
  totalPages: number
  currentPage: number
  total: number
}

// Tipos para manejo de errores de API
export interface ApiError {
  response?: {
    data?: {
      message?: string
      error?: string
    }
    status?: number
  }
  message?: string
}
