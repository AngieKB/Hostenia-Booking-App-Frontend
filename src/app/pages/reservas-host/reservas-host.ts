import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { ReservaAlojamientoDTO, EstadoReserva } from '../../models/reserva-dto';
import { ReservaService } from '../../services/reserva.service';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas-host',
  standalone: true,
  imports: [CommonModule, FormsModule, MainHeaderHost, Footer],
  templateUrl: './reservas-host.html',
  styleUrl: './reservas-host.css',
})
export class ReservasHost implements OnInit {
  reservas: ReservaAlojamientoDTO[] = [];
  reservasFiltradas: ReservaAlojamientoDTO[] = [];
  filtroActivo: EstadoReserva = EstadoReserva.PENDIENTE;
  alojamientoId: number | null = null;
  cargando: boolean = false;
  
  // Filtros de fecha
  fechaInicio: string = '';
  fechaFin: string = '';
  showDateFilter: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el ID del alojamiento de la ruta
    this.route.params.subscribe(params => {
      this.alojamientoId = params['id'] ? +params['id'] : null;
      if (this.alojamientoId) {
        this.cargarReservas();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se especificó un alojamiento',
          confirmButtonColor: '#4CB0A6'
        });
      }
    });
  }

  cargarReservas(): void {
    if (!this.alojamientoId) return;
    
    this.cargando = true;
    this.reservaService.obtenerReservasPorAlojamiento(this.alojamientoId, 0, 100).subscribe({
      next: (page) => {
        this.reservas = page.content;
        this.aplicarFiltros();
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
    // Nota: El backend no tiene un endpoint específico para aprobar
    // Podrías usar el endpoint de editar para cambiar el estado
    //TODO: Implementar endpoint para aprobar reservas, o cambiar el editarReservaDTO para que acepte el estado
    Swal.fire({
      icon: 'info',
      title: 'Función no disponible',
      text: 'La aprobación de reservas requiere un endpoint específico en el backend',
      confirmButtonColor: '#4CB0A6'
    });
  }

  denegarReserva(id: number): void {
    Swal.fire({
      title: '¿Cancelar reserva?',
      text: 'Esta acción cancelará la reserva del huésped',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reservaService.cancelar(id).subscribe({
          next: (mensaje) => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: mensaje,
              confirmButtonColor: '#4CB0A6'
            });
            this.cargarReservas();
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

  get EstadoReserva() {
    return EstadoReserva;
  }
}
