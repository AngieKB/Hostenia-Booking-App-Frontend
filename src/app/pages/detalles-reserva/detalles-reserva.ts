import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { MainHeader } from '../../components/main-header/main-header';
import { EditarReservaDTO, ReservaUsuarioDTO } from '../../models/reserva-dto';
import { ReservaService } from '../../services/reserva.service';
import { EditarReservaModal } from '../../components/editar-reserva-modal/editar-reserva-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles-reserva',
  standalone: true,
  imports: [CommonModule, MainHeader, Footer,EditarReservaModal],
  templateUrl: './detalles-reserva.html',
  styleUrl: './detalles-reserva.css'
})
export class DetallesReserva implements OnInit {
  // ==============================
  // 🔹 Propiedades
  // ==============================
  reserva: ReservaUsuarioDTO | null = null;
  editarReserva: EditarReservaDTO | null = null;
  cargando: boolean = false;
   showEditModal: boolean = false;

  // ==============================
  // 🔹 Inyección de dependencias
  // ==============================
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService
  ) {}

  // ==============================
  // 🔹 Ciclo de vida
  // ==============================
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de reserva inválido',
        confirmButtonColor: '#4CB0A6'
      });
      this.router.navigate(['/reservas']);
      return;
    }
    this.loadReserva(id);
  }

  // ==============================
  // 🔹 Métodos principales
  // ==============================
  private loadReserva(id: number): void {
    this.cargando = true;
    this.reservaService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.reserva = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los detalles de la reserva',
          confirmButtonColor: '#4CB0A6'
        });
        this.router.navigate(['/reservas']);
        this.cargando = false;
      }
    });
  }
     openEditModal(): void {
    if (this.reserva?.estado === 'CANCELADA') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'No puedes editar una reserva cancelada',
        confirmButtonColor: '#4CB0A6'
      });
    } else {
      this.showEditModal = true;
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  onGuardarEdicion(data: any): void {
  console.log('Datos editados:', data);

  if (!this.reserva?.id) {
    console.error('No se encontró el ID de la reserva');
    return;
  }

  this.reservaService.editar(this.reserva.id, data).subscribe({
    next: (response) => {
      console.log('Reserva actualizada correctamente:', response);
      // Puedes mostrar un SweetAlert de éxito
      Swal.fire({
        icon: 'success',
        title: 'Reserva actualizada',
        text: 'La reserva se editó correctamente.',
        confirmButtonColor: '#3085d6'
      });
      this.closeEditModal();
    },
    error: (err) => {
      console.error('Error al actualizar la reserva:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la reserva. Intenta nuevamente.',
        confirmButtonColor: '#d33'
      });
    }
  });
}


  cancelarReserva(): void {
    if (!this.reserva) return;

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
        this.reservaService.cancelar(this.reserva!.id).subscribe({
          next: (mensaje) => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: mensaje,
              confirmButtonColor: '#4CB0A6'
            });
            this.router.navigate(['/reservas']);
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

  // ==============================
  // 🔹 Métodos auxiliares
  // ==============================
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

  onImageError(event: any): void {
    event.target.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjODBjYmM0Ii8+CjxwYXRoIGQ9Ik0zMCA0MEg3MFY2MEgzMFY0MFoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNTAiIHI9IjMiIGZpbGw9IiM4MGNiYzQiLz4KPC9zdmc+';
  }
}
