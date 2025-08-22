export interface User {
  _id: string;
  username: string;
  persona: Persona;
  rol: Rol;
  activo: boolean;
  ultimoLogin?: Date;
  token?: string;
}

export interface Persona {
  _id: string;
  nombre: string;
  apellido: string;
  dni: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    codigoPostal?: string;
  };
  telefono: string;
  email?: string;
  fechaNacimiento?: Date;
  rama?: Rama;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rol {
  _id: string;
  nombre: 'administrador' | 'jefe_de_rama' | 'jefe_de_grupo' | 'socio';
  descripcion: string;
  permisos: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Rama {
  _id: string;
  nombre: 'manada' | 'unidad' | 'caminantes' | 'rovers';
  descripcion: string;
  edadMinima: number;
  edadMaxima: number;
  jefeRama?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pago {
  _id: string;
  socio: Persona;
  monto: number;
  fechaPago: Date;
  mesCorrespondiente: string;
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito';
  comprobante?: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
  };
  observaciones?: string;
  registradoPor: User;
  estado: 'pendiente' | 'confirmado' | 'rechazado';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface PersonaFormData {
  nombre: string;
  apellido: string;
  dni: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    codigoPostal?: string;
  };
  telefono: string;
  email?: string;
  fechaNacimiento?: Date;
  rama?: string;
}

export interface PagoFormData {
  socio: string;
  monto: number;
  fechaPago: Date;
  mesCorrespondiente: string;
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta_debito' | 'tarjeta_credito';
  observaciones?: string;
  comprobante?: File;
}
