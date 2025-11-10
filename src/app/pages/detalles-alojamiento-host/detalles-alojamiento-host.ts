import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlojamientoDTO, Comentario } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { EditarAlojamientoModal } from '../../components/editar-alojamiento-modal/editar-alojamiento-modal';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';

@Component({
  selector: 'app-detalles-alojamiento-host',
  standalone: true,
  imports: [CommonModule, EditarAlojamientoModal, MainHeaderHost],
  templateUrl: './detalles-alojamiento-host.html',
  styleUrl: './detalles-alojamiento-host.css',
})
export class DetallesAlojamientoHost implements OnInit {
  alojamiento: AlojamientoDTO | null = null;
  imagenPrincipal: string = '';
  showEditModal: boolean = false;
  favoritosCount: number = 0;
  
  // Paginación de comentarios
  comentariosPaginados: Comentario[] = [];
  paginaActualComentarios: number = 1;
  comentariosPorPagina: number = 4;
  totalPaginasComentarios: number = 1;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private alojamientoService: AlojamientoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAlojamiento(Number(id));
    }
  }

  private loadAlojamiento(id: number): void {
    this.alojamiento = this.alojamientoService.getById(id) || null;
    if (this.alojamiento) {
      this.imagenPrincipal = this.alojamiento.galeria[0] || '';
      this.calcularPaginacionComentarios();
      this.cargarComentariosPagina();
      // Simular conteo de favoritos
      this.favoritosCount = Math.floor(Math.random() * 50) + 10;
    }
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
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  onGuardarEdicion(data: any): void {
    console.log('Guardar edición:', data);
    // Aquí implementarías la lógica para actualizar en el backend
    this.closeEditModal();
  }

  responderComentario(comentarioId: number): void {
    console.log('Responder comentario:', comentarioId);
    // Implementar lógica de respuesta
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
