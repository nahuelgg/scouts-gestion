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
  tipoPago: 'mensual' | 'afiliacion' | 'campamento' | 'otro'
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

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
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
  tipoPago: 'mensual' | 'afiliacion' | 'campamento' | 'otro'
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
  withoutUser?: boolean
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
  includeDeleted?: boolean
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

// =============================================================================
// INTERFACES PARA ELIMINAR TIPOS 'any'
// =============================================================================

// Interfaces para componentes de tabla (Ant Design)
export interface TableColumnRenderProps<T = unknown> {
  text: unknown
  record: T
  index: number
}

// Interfaces para Upload de Ant Design
export interface UploadFile {
  uid: string
  name: string
  status?: 'uploading' | 'done' | 'error' | 'removed'
  response?: unknown
  url?: string
  preview?: string
  originFileObj?: File
  error?: unknown
}

export interface UploadChangeParam {
  file: UploadFile
  fileList: UploadFile[]
}

// Interfaces específicas para configuración de API
export interface AxiosRequestConfig {
  url?: string
  method?: string
  headers?: Record<string, string>
  data?: unknown
  params?: Record<string, unknown>
  timeout?: number
  responseType?: string
}

// Interfaces para parámetros de filtros
export interface PersonaFilterParams {
  page?: number
  limit?: number
  rama?: string
  search?: string
  includeDeleted?: boolean
  withoutUser?: boolean
  dni?: string
}

export interface PagoFilterParams {
  page?: number
  limit?: number
  socio?: string
  año?: number
  mes?: string
  includeDeleted?: boolean
  tipoPago?: string
  metodoPago?: string
}

// Interface para datos de formulario SocioForm
export interface SocioFormValues {
  nombre: string
  apellido: string
  dni: string
  calle: string
  numero: string
  ciudad: string
  codigoPostal?: string
  telefono: string
  email?: string
  fechaNacimiento?: { toDate(): Date } // Para Ant Design DatePicker
  rama?: string
  funcion: 'ayudante' | 'beneficiario' | 'educador'
}

// Interface para datos de formulario PagoForm
export interface PagoFormValues {
  socio: string
  monto: number | string
  fechaPago: { toISOString(): string } // Para Ant Design DatePicker
  mesCorrespondiente: string
  metodoPago:
    | 'efectivo'
    | 'transferencia'
    | 'tarjeta_debito'
    | 'tarjeta_credito'
  tipoPago: 'mensual' | 'afiliacion' | 'campamento' | 'otro'
  observaciones?: string
  estado?: string
  comprobante?: unknown
}

// Interface para datos de formulario UsuarioForm
export interface UsuarioFormValues {
  username: string
  password: string
  confirmPassword?: string
  persona: string
  rol: string
  activo?: boolean
}

// Interfaces para parámetros de filtros específicos
export interface PersonaFilterParams {
  page?: number
  limit?: number
  rama?: string
  search?: string
  includeDeleted?: boolean
  withoutUser?: boolean
  dni?: string
  estado?: string
  es_mayor?: boolean
  activo?: boolean
}

// Funciones para validación de pagos (sin any)
export interface PagoValidationContext {
  user: User
  userRole: string
  userRamaId?: string
  isAdminOrJefeGrupo: boolean
}
