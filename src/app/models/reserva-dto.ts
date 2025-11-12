export enum EstadoReserva {
  CONFIRMADA = 'CONFIRMADA',
  PENDIENTE = 'PENDIENTE',
  CANCELADA = 'CANCELADA',
  COMPLETADA = 'COMPLETADA'
}

// DTO para crear una reserva
export interface RealizarReservaDTO {
  fechaCheckIn: string; // ISO LocalDateTime string (YYYY-MM-DDTHH:mm:ss)
  fechaCheckOut: string; // ISO LocalDateTime string (YYYY-MM-DDTHH:mm:ss)
  cantidadHuespedes: number;
  alojamientoId: number;
}

// DTO para editar una reserva
export interface EditarReservaDTO {
  fechaCheckIn: string; // ISO string
  fechaCheckOut: string; // ISO string
  cantidadHuespedes: number;
  total: number;
}

// DTO combinado para editar reserva con ubicación
export interface EditarReservaConUbicacionDTO {
  reserva: EditarReservaDTO;
  ubicacion: UbicacionDTO;
}

// DTO de ubicación
export interface UbicacionDTO {
  direccion: string;
  ciudad: string;
  pais: string;
  latitud: number;
  longitud: number;
}

// DTO para reservas del usuario (huésped)
export interface ReservaUsuarioDTO {
  id: number;
  fechaCheckIn: string;
  fechaCheckOut: string;
  cantidadHuespedes: number;
  total: number;
  estado: EstadoReserva;
  alojamientoId: number;
  alojamientoTitulo: string;
  alojamientoCiudad: string;
  alojamientoImagen: string;
}

// DTO para reservas de un alojamiento (anfitrión)
export interface ReservaAlojamientoDTO {
  id: number;
  idHuesped: number;
  nombreHuesped: string;
  fechaCheckIn: string;
  fechaCheckOut: string;
  cantidadHuespedes: number;
  total: number;
  estado: EstadoReserva;
  alojamientoTitulo: string;
  alojamientoCiudad: string;
}
