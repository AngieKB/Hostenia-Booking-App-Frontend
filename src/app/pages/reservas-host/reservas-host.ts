import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaAlojamientoDTO, EstadoReserva } from '../../models/reserva-dto';
import { ReservaService } from '../../services/reserva.service';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';

@Component({
  selector: 'app-reservas-host',
  standalone: true,
  imports: [CommonModule, FormsModule, MainHeaderHost],
  templateUrl: './reservas-host.html',
  styleUrl: './reservas-host.css',
})
export class ReservasHost implements OnInit {
  reservas: ReservaAlojamientoDTO[] = [];
  reservasFiltradas: ReservaAlojamientoDTO[] = [];
  filtroActivo: EstadoReserva = EstadoReserva.PENDIENTE;
  
  // Filtros de fecha
  fechaInicio: string = '';
  fechaFin: string = '';
  showDateFilter: boolean = false;

  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    // Aquí cargarías las reservas del host desde el backend
    this.reservas = this.reservaService.getAll();
    this.aplicarFiltros();
  }

  cambiarFiltro(estado: EstadoReserva): void {
    this.filtroActivo = estado;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let reservasFiltradas = this.reservas.filter(r => r.estado === this.filtroActivo);

    // Aplicar filtro de fechas si están definidas
    if (this.fechaInicio && this.fechaFin) {
      const inicio = new Date(this.fechaInicio);
      const fin = new Date(this.fechaFin);
      
      reservasFiltradas = reservasFiltradas.filter(r => {
        const fechaCheckIn = new Date(r.fechaCheckIn);
        return fechaCheckIn >= inicio && fechaCheckIn <= fin;
      });
    }

    this.reservasFiltradas = reservasFiltradas;
  }

  toggleDateFilter(): void {
    this.showDateFilter = !this.showDateFilter;
  }

  buscarPorFechas(): void {
    this.aplicarFiltros();
  }

  cancelarFiltroFechas(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.showDateFilter = false;
    this.aplicarFiltros();
  }

  aprobarReserva(id: number): void {
    console.log('Aprobar reserva:', id);
    // Implementar lógica para aprobar
  }

  denegarReserva(id: number): void {
    console.log('Denegar reserva:', id);
    // Implementar lógica para denegar
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  get EstadoReserva() {
    return EstadoReserva;
  }
}
