import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';
import { MainHeader } from '../../components/main-header/main-header';
import { ReservaUsuarioDTO, EstadoReserva } from '../../models/reserva-dto';
import { ReservaService } from '../../services/reserva.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, MainHeader, Footer],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.css',
})
export class MisReservas implements OnInit {
  reservas: ReservaUsuarioDTO[] = [];
  todasReservas: ReservaUsuarioDTO[] = [];
  filtroActivo: EstadoReserva | 'TODAS' = EstadoReserva.CONFIRMADA;
  EstadoReserva = EstadoReserva;
  cargando: boolean = false;

  constructor(
    private reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this.loadReservas();
  }

  private loadReservas(): void {
    this.cargando = true;
    
    this.reservaService.obtenerMisReservas(0, 100).subscribe({
      next: (page) => {
        this.todasReservas = page.content;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las reservas',
          confirmButtonColor: '#4CB0A6'
        });
        this.cargando = false;
      }
    });
  }

  cambiarFiltro(filtro: EstadoReserva | 'TODAS'): void {
    this.filtroActivo = filtro;
    this.loadReservas();
  }

  private aplicarFiltro(): void {
    if (this.filtroActivo === 'TODAS') {
      this.reservas = this.todasReservas;
    } else {
      this.reservas = this.todasReservas.filter(r => r.estado === this.filtroActivo);
    }
  }

  cancelarReserva(reservaId: number): void {
    Swal.fire({
      title: '¿Cancelar reserva?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservaService.cancelar(reservaId).subscribe({
          next: (mensaje) => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: mensaje,
              confirmButtonColor: '#4CB0A6'
            });
            this.loadReservas();
          },
          error: (error) => {
            console.error('Error al cancelar reserva:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cancelar la reserva',
              confirmButtonColor: '#4CB0A6'
            });
          }
        });
      }
    });
  }

  formatearFecha(fecha: string): string {
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

  // Manejar error de imagen
  onImageError(event: any): void {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjODBjYmM0Ii8+CjxwYXRoIGQ9Ik0zMCA0MEg3MFY2MEgzMFY0MFoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNTAiIHI9IjMiIGZpbGw9IiM4MGNiYzQiLz4KPC9zdmc+';
  }
}
