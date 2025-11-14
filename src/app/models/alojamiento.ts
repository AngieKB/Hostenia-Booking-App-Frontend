// Enums
export enum EstadoAlojamiento {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE'
}

// Interfaces
export interface UbicacionDTO {
  direccion: string;
  ciudad: string;
  pais: string;
  latitud: number;
  longitud: number;
}

export interface Comentario {
  id: number;
  texto: string;
  calificacion: number;
  fecha: Date;
  nombreHuesped: string;
  nombreAnfitrion: string;
  fotoHuesped: string;
  fotoAnfitrion: string;
  textoRespuesta: string;
}

export interface Reserva {
  id: number;
  usuarioId: number;
  fechaInicio: Date;
  fechaFin: Date;
  precioTotal: number;
  estado: string;
}

export interface AlojamientoDTO {
  id: number;
  titulo: string;
  descripcion: string;
  servicios: string[];
  galeria: string[];
  ubicacion: UbicacionDTO;
  precioNoche: number;
  capacidadMax: number;
  comentarios: Comentario[];
  reservas: Reserva[];
  estado: EstadoAlojamiento;
  idAnfitrion: number;
  nombreAnfitrion: string;
}

export interface CrearAlojamientoDTO {
  titulo: string;
  descripcion: string;
  servicios: string[];
  galeria: File[];
  ciudad: string;
  direccion: string;
  latitud: number;
  longitud: number;
  precioNoche: number;
  capacidadMax: number;
  pais: string;
}

export interface EditarAlojamientoDTO {
  titulo?: string;
  descripcion?: string;
  servicios?: string[];
  galeria?: string[];
  ciudad?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  precioNoche?: number;
  capacidadMax?: number;
}

export interface EditarAlojamientoRequest {
  alojamientoDTO: EditarAlojamientoDTO;
  ubicacionDTO: UbicacionDTO;
}

export interface MetricasDTO {
  totalReservas: number;
  ingresosTotales: number;
  promedioCalificacion: number;
  tasaOcupacion: number;
}

export interface DesactivarAlojamientoDTO {
  alojamiento: AlojamientoDTO;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}