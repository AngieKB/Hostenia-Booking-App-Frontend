export enum EstadoReserva {
  CONFIRMADA = 'CONFIRMADA',
  PENDIENTE = 'PENDIENTE',
  CANCELADA = 'CANCELADA',
  COMPLETADA = 'COMPLETADA'
}

export interface ReservaAlojamientoDTO {
  id: number;
  idHuesped: number;
  fechaCheckIn: Date;
  fechaCheckOut: Date;
  cantidadHuespedes: number;
  total: number;
  estado: EstadoReserva;
  alojamientoTitulo: string;
  alojamientoCiudad: string;
}
