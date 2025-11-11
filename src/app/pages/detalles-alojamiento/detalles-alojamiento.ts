import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlojamientoDTO, Comentario } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
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
  cargando: boolean = false;
  
  // Paginación de comentarios
  comentariosPaginados: Comentario[] = [];
  paginaActualComentarios: number = 1;
  comentariosPorPagina: number = 4;
  totalPaginasComentarios: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alojamientoService: AlojamientoService
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
        this.calcularPaginacionComentarios();
        this.cargarComentariosPagina();
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
          this.router.navigate(['/']);
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
    console.log('Guardar calificación:', data);
    // Aquí implementarías la lógica para guardar en el backend
    this.closeCalificarModal();
  }

  // Métodos de paginación de comentarios
  private calcularPaginacionComentarios(): void {
    if (!this.alojamiento) return;
    this.totalPaginasComentarios = Math.ceil(
      this.alojamiento.comentarios.length / this.comentariosPorPagina
    );
  }

  private cargarComentariosPagina(): void {
    if (!this.alojamiento) return;
    const inicio = (this.paginaActualComentarios - 1) * this.comentariosPorPagina;
    const fin = inicio + this.comentariosPorPagina;
    this.comentariosPaginados = this.alojamiento.comentarios.slice(inicio, fin);
  }

  cambiarPaginaComentarios(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginasComentarios) {
      this.paginaActualComentarios = pagina;
      this.cargarComentariosPagina();
    }
  }

  get paginasComentarios(): number[] {
    return Array.from({ length: this.totalPaginasComentarios }, (_, i) => i + 1);
  }
}
