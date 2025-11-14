import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from '../../components/footer/footer';
import { ActivatedRoute, Router } from '@angular/router';
import { AlojamientoDTO } from '../../models/alojamiento';
import { ComentarioDTO } from '../../models/comentario-dto';
import { ComentarioService } from '../../services/comentario.service';
import { AlojamientoService } from '../../services/alojamiento.service';
import { RespuestaService } from '../../services/respuesta.service';
import { ResponderDTO } from '../../models/comentario-dto';
import { EditarAlojamientoModal } from '../../components/editar-alojamiento-modal/editar-alojamiento-modal';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles-alojamiento-host',
  standalone: true,
  imports: [CommonModule, EditarAlojamientoModal, MainHeaderHost, Footer],
  templateUrl: './detalles-alojamiento-host.html',
  styleUrl: './detalles-alojamiento-host.css',
})
export class DetallesAlojamientoHost implements OnInit {
  alojamiento: AlojamientoDTO | null = null;
  imagenPrincipal: string = '';
  showEditModal: boolean = false;
  favoritosCount: number = 0;
  totalComentarios: number = 0;

  cargando: boolean = false;
  cargandoComentarios: boolean = false;

  // Paginación de comentarios (cambiado a 0-based para consistencia con APIs)
  comentariosPaginados: ComentarioDTO[] = [];
  paginaActualComentarios: number = 0;  // Inicializado en 0 (0-based)
  comentariosPorPagina: number = 4;
  totalPaginasComentarios: number = 1;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private alojamientoService: AlojamientoService,
    private respuestaService: RespuestaService,
    private comentarioService: ComentarioService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAlojamiento(Number(id));
    }
  }

  private loadAlojamiento(id: number): void {
    this.cargando = true;
    this.alojamientoService.obtenerPorId(id).subscribe({
      next: (alojamiento) => {
        this.alojamiento = alojamiento;
        this.imagenPrincipal = this.alojamiento.galeria[0] || '';
        this.cargarComentariosDesdeAPI(id);  // Carga comentarios aquí
        
        // Cargar conteo de favoritos desde el backend
        this.alojamientoService.contarUsuariosFavorito(id).subscribe({
          next: (count) => {
            this.favoritosCount = count;
          },
          error: (error) => {
            console.error('Error al cargar favoritos:', error);
            this.favoritosCount = 0;
          }
        });
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar alojamiento:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el alojamiento',
          confirmButtonColor: '#4CB0A6'
        }).then(() => {
          this.router.navigate(['/mis-alojamientos-host']);
        });
        this.cargando = false;
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

  openEditModal(): void {
    if (this.alojamiento?.id && this.alojamiento.estado === 'ACTIVO') {
      this.router.navigate(['/editar-alojamiento-host', this.alojamiento.id]);
    } else if (this.alojamiento?.estado === 'INACTIVO') {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'No puedes editar un alojamiento inactivo',
        confirmButtonColor: '#4CB0A6'
      });
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  onGuardarEdicion(data: any): void {
    console.log('Guardar edición:', data);
    // Aquí implementarías la lógica para actualizar en el backend
    this.closeEditModal();
  }

  verReservas(): void {
    if (this.alojamiento && this.alojamiento.id) {
      // Navega a la vista de reservas del alojamiento actual
      this.router.navigate(['/reservas-host', this.alojamiento.id]);
    } else {
      console.error('No se pudo obtener el ID del alojamiento');
    }
  }

  formatearFechaComentario(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  responderComentario(comentarioId: number): void {
    Swal.fire({
      title: 'Responder comentario',
      input: 'textarea',
      inputLabel: 'Tu respuesta',
      inputPlaceholder: 'Escribe tu respuesta aquí...',
      inputAttributes: {
        'aria-label': 'Escribe tu respuesta aquí',
        'maxlength': '300'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4CB0A6',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes escribir una respuesta';
        }
        if (value.length > 300) {
          return 'La respuesta no puede exceder 300 caracteres';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const responderDTO: ResponderDTO = {
          respuesta: result.value,
          idComentario: comentarioId
        };
        
        this.respuestaService.responderComentario(responderDTO).subscribe({
          next: (mensaje) => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: mensaje,
              confirmButtonColor: '#4CB0A6'
            });
            // Recargar el alojamiento para mostrar la respuesta
            if (this.alojamiento?.id) {
              this.loadAlojamiento(this.alojamiento.id);
            }
          },
          error: (error) => {
            console.error('Error al responder comentario:', error);
            let mensajeError = 'No se pudo enviar la respuesta';
            
            if (error.error?.content) {
              mensajeError = error.error.content;
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

  // Cargar comentarios desde la API (con logs de debug)
  private cargarComentariosDesdeAPI(idAlojamiento: number): void {
    this.cargandoComentarios = true;
    console.log(`Cargando comentarios para alojamiento ${idAlojamiento}, página ${this.paginaActualComentarios}, tamaño ${this.comentariosPorPagina}`);

    this.comentarioService.obtenerComentariosPorAlojamiento(
      idAlojamiento,
      this.paginaActualComentarios,  // Ahora 0-based
      this.comentariosPorPagina
    ).subscribe({
      next: (response) => {
        console.log('Respuesta de comentarios:', response);
        this.comentariosPaginados = response.content || [];
        this.totalPaginasComentarios = response.totalPages || 1;
        this.totalComentarios = response.totalElements || 0;
        this.cargandoComentarios = false;
        console.log(`Comentarios cargados: ${this.comentariosPaginados.length}, total páginas: ${this.totalPaginasComentarios}`);
      },
      error: (error) => {
        console.error('Error al cargar comentarios:', error);
        this.comentariosPaginados = [];  // Resetear para evitar estados inconsistentes
        this.totalPaginasComentarios = 1;
        this.totalComentarios = 0;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los comentarios',
          confirmButtonColor: '#4CB0A6'
        });
        this.cargandoComentarios = false;
      }
    });
  }

  // Cambiar página de comentarios (ahora 'pagina' es 0-based directamente)
  cambiarPaginaComentarios(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginasComentarios) {
      this.paginaActualComentarios = pagina;
      if (this.alojamiento) {
        this.cargarComentariosDesdeAPI(this.alojamiento.id);
      }
    }
  }

  get paginasComentarios(): number[] {
    return Array.from({ length: this.totalPaginasComentarios }, (_, i) => i + 1);
  }
}