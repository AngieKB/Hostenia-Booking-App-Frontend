import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlojamientoDTO, Comentario } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { ComentarioService } from '../../services/comentario.service';
import { ComentarioDTO, ComentarDTO } from '../../models/comentario-dto';
import { MainHeader } from '../../components/main-header/main-header';
import { CalificarModal } from '../../components/calificar-modal/calificar-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles-alojamiento',
  standalone: true,
  imports: [CommonModule, MainHeader, CalificarModal],
  templateUrl: './detalles-alojamiento.html',
  styleUrl: './detalles-alojamiento.css',
})
export class DetallesAlojamiento implements OnInit {
  alojamiento: AlojamientoDTO | null = null;
  imagenPrincipal: string = '';
  showCalificarModal: boolean = false;
  
  // Paginación de comentarios desde API
  comentariosPaginados: ComentarioDTO[] = [];
  paginaActualComentarios: number = 0;
  comentariosPorPagina: number = 12;
  totalPaginasComentarios: number = 0;
  totalComentarios: number = 0;
  cargandoComentarios: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alojamientoService: AlojamientoService,
    private comentarioService: ComentarioService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAlojamiento(Number(id));
    }
  }

  private loadAlojamiento(id: number): void {
    this.alojamientoService.obtenerPorId(id).subscribe({
      next: (alojamiento) => {
        this.alojamiento = alojamiento;
        this.imagenPrincipal = alojamiento.galeria[0] || '';
        this.cargarComentariosDesdeAPI(id);
      },
      error: (error) => {
        console.error('Error al cargar alojamiento:', error);
        this.alojamiento = null;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el alojamiento',
          confirmButtonColor: '#4CB0A6'
        });
      }
    });
  }

  // Cargar comentarios desde la API
  private cargarComentariosDesdeAPI(idAlojamiento: number): void {
    this.cargandoComentarios = true;
    this.comentarioService.obtenerComentariosPorAlojamiento(
      idAlojamiento,
      this.paginaActualComentarios,
      this.comentariosPorPagina
    ).subscribe({
      next: (response) => {
        this.comentariosPaginados = response.content;
        this.totalPaginasComentarios = response.totalPages;
        this.totalComentarios = response.totalElements;
        this.cargandoComentarios = false;
      },
      error: (error) => {
        console.error('Error al cargar comentarios:', error);
        this.cargandoComentarios = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los comentarios',
          confirmButtonColor: '#4CB0A6'
        });
      }
    });
  }

  seleccionarImagen(imagen: string): void {
    this.imagenPrincipal = imagen;
  }

  calcularCalificacionPromedio(): number {
    if (!this.alojamiento || this.alojamiento.comentarios.length === 0) {
      return 0;
    }
    const suma = this.alojamiento.comentarios.reduce((acc, c) => acc + c.calificacion, 0);
    return Math.round((suma / this.alojamiento.comentarios.length) * 10) / 10;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  toggleFavorito(): void {
    if (!this.alojamiento) return;
    // Implementar lógica de favoritos
  }

  compartir(): void {
    // Implementar lógica de compartir
    console.log('Compartir alojamiento');
  }

  reservarAhora(): void {
    if (this.alojamiento) {
      this.router.navigate(['/realizar-reserva', this.alojamiento.id]);
    }
  }

  iniciarConversacion(): void {
    console.log('Iniciar conversación con el anfitrión');
  }

  openCalificarModal(): void {
    this.showCalificarModal = true;
  }

  closeCalificarModal(): void {
    this.showCalificarModal = false;
  }

  onGuardarCalificacion(data: { calificacion: number; comentario: string }): void {
    if (!this.alojamiento) return;

    // Solicitar ID de reserva al usuario
    Swal.fire({
      title: 'ID de Reserva',
      text: 'Ingrese el ID de su reserva para comentar',
      input: 'number',
      inputAttributes: {
        min: '1',
        step: '1'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar comentario',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4CB0A6',
      inputValidator: (value) => {
        if (!value || parseInt(value) <= 0) {
          return 'Debe ingresar un ID de reserva válido';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value && this.alojamiento) {
        const reservaId = parseInt(result.value);
        const comentarDTO: ComentarDTO = {
          texto: data.comentario,
          calificacion: data.calificacion,
          idAlojamiento: this.alojamiento.id
        };

        this.comentarioService.crearComentario(reservaId, comentarDTO).subscribe({
          next: (mensaje) => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: mensaje,
              confirmButtonColor: '#4CB0A6'
            });
            this.closeCalificarModal();
            // Recargar comentarios para mostrar el nuevo
            if (this.alojamiento?.id) {
              this.cargarComentariosDesdeAPI(this.alojamiento.id);
            }
          },
          error: (error) => {
            console.error('Error al crear comentario:', error);
            let mensajeError = 'No se pudo crear el comentario';
            
            if (error.error?.content) {
              mensajeError = error.error.content;
            } else if (error.error?.message) {
              mensajeError = error.error.message;
            }
            
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: mensajeError,
              confirmButtonColor: '#4CB0A6'
            });
          }
        });
      }
    });
  }

  // Métodos de paginación de comentarios desde API
  cambiarPaginaComentarios(pagina: number): void {
    // La API usa paginación 0-indexed
    const paginaAPI = pagina - 1;
    if (paginaAPI >= 0 && paginaAPI < this.totalPaginasComentarios) {
      this.paginaActualComentarios = paginaAPI;
      if (this.alojamiento) {
        this.cargarComentariosDesdeAPI(this.alojamiento.id);
      }
    }
  }

  get paginasComentarios(): number[] {
    return Array.from({ length: this.totalPaginasComentarios }, (_, i) => i + 1);
  }

  // Método para formatear fecha de comentario
  formatearFechaComentario(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
