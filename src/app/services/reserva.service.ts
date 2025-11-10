import { Injectable } from '@angular/core';
import { ReservaAlojamientoDTO, EstadoReserva } from '../models/reserva-dto';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private reservas: ReservaAlojamientoDTO[] = [];

  constructor() {
    this.initializeTestData();
  }

  // Obtener todas las reservas
  public getAll(): ReservaAlojamientoDTO[] {
    return this.reservas;
  }

  // Obtener todas las reservas de un huésped
  public getByHuespedId(huespedId: number): ReservaAlojamientoDTO[] {
    return this.reservas.filter(r => r.idHuesped === huespedId);
  }

  // Obtener reservas por estado
  public getByEstado(huespedId: number, estado: EstadoReserva): ReservaAlojamientoDTO[] {
    return this.reservas.filter(r => r.idHuesped === huespedId && r.estado === estado);
  }

  // Crear una nueva reserva
  public create(reserva: Omit<ReservaAlojamientoDTO, 'id'>): ReservaAlojamientoDTO {
    const newReserva: ReservaAlojamientoDTO = {
      ...reserva,
      id: this.generateId()
    };
    
    this.reservas.push(newReserva);
    return newReserva;
  }

  // Cancelar una reserva
  public cancelar(reservaId: number): boolean {
    const reserva = this.reservas.find(r => r.id === reservaId);
    if (!reserva) return false;

    reserva.estado = EstadoReserva.CANCELADA;
    return true;
  }

  // Generar un ID único
  private generateId(): number {
    return Math.max(0, ...this.reservas.map(r => r.id)) + 1;
  }

  // Inicializar datos de prueba
  private initializeTestData(): void {
    this.reservas = [
      {
        id: 1,
        idHuesped: 1,
        fechaCheckIn: new Date('2021-03-13'),
        fechaCheckOut: new Date('2021-03-15'),
        cantidadHuespedes: 2,
        total: 1000000,
        estado: EstadoReserva.CONFIRMADA,
        alojamientoTitulo: 'Casa Moderna en el Centro',
        alojamientoCiudad: 'Bogotá'
      },
      {
        id: 2,
        idHuesped: 1,
        fechaCheckIn: new Date('2021-04-20'),
        fechaCheckOut: new Date('2021-04-22'),
        cantidadHuespedes: 4,
        total: 1000000,
        estado: EstadoReserva.CONFIRMADA,
        alojamientoTitulo: 'Apartamento Acogedor',
        alojamientoCiudad: 'Medellín'
      },
      {
        id: 3,
        idHuesped: 1,
        fechaCheckIn: new Date('2021-02-10'),
        fechaCheckOut: new Date('2021-02-12'),
        cantidadHuespedes: 2,
        total: 800000,
        estado: EstadoReserva.PENDIENTE,
        alojamientoTitulo: 'Casa de Playa',
        alojamientoCiudad: 'Cartagena'
      }
    ];
  }
}
