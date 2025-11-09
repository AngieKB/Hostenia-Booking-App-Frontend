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
  usuarioId: number;
  nombreUsuario: string;
  calificacion: number;
  comentario: string;
  fecha: Date;
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
}