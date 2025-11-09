import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainHeader } from '../../components/main-header/main-header';
import { ReservaAlojamientoDTO, EstadoReserva } from '../../models/reserva-dto';
import { ReservaService } from '../../services/reserva.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, MainHeader],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.css',
})
export class MisReservas implements OnInit {
  reservas: ReservaAlojamientoDTO[] = [];
  filtroActivo: EstadoReserva | 'TODAS' = EstadoReserva.CONFIRMADA;
  EstadoReserva = EstadoReserva;

  constructor(
    private reservaService: ReservaService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadReservas();
  }

  private loadReservas(): void {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) return;

    const todasReservas = this.reservaService.getByHuespedId(currentUser.id!);
    this.aplicarFiltro(todasReservas);
  }

  cambiarFiltro(filtro: EstadoReserva | 'TODAS'): void {
    this.filtroActivo = filtro;
    this.loadReservas();
  }

  private aplicarFiltro(reservas: ReservaAlojamientoDTO[]): void {
    if (this.filtroActivo === 'TODAS') {
      this.reservas = reservas;
    } else {
      this.reservas = reservas.filter(r => r.estado === this.filtroActivo);
    }
  }

  cancelarReserva(reservaId: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservaService.cancelar(reservaId);
      this.loadReservas();
    }
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
}
