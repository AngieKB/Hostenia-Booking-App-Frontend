import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlojamientoDTO } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { MainHeader } from '../../components/main-header/main-header';
import { Footer } from '../../components/footer/footer';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, FormsModule, MainHeader, Footer],
  templateUrl: './principal.html',
  styleUrls: ['./principal.css']
})
export class Principal implements OnInit {
  // Filtros de búsqueda (estos NO vienen del backend, son locales)
  filtros = {
    ciudad: '',
    fechaInicio: '',
    fechaFin: '',
    precio: { min: 0, max: 1000000 },
    servicios: {
      cocina: false,
      wifi: false,
      piscina: false,
      mascotas: false
    }
  };

  // Fecha mínima para el selector (hoy)
  fechaMinima: string = '';

  // Lista de alojamientos que vienen del backend
  alojamientos: AlojamientoDTO[] = [];
  alojamientosFiltrados: AlojamientoDTO[] = [];

  // Favoritos (manejados localmente, NO vienen del backend)
  // En una app real, podrías guardarlos en localStorage o en el backend
  favoritos: Set<number> = new Set();

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.inicializarFechaMinima();
    this.cargarAlojamientos();
    this.cargarFavoritosLocalStorage();
  }

  // Inicializar fecha mínima (hoy)
  inicializarFechaMinima() {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  // Método para cargar alojamientos desde el servicio
  cargarAlojamientos() {
    // Obtener alojamientos del servicio
    this.alojamientos = this.alojamientoService.getAll();
    this.alojamientosFiltrados = [...this.alojamientos];
  }

  // Método para buscar/filtrar alojamientos
  buscarAlojamientos() {
    this.alojamientosFiltrados = this.alojamientos.filter(alojamiento => {
      // Filtro por ciudad
      const cumpleCiudad = !this.filtros.ciudad || 
        alojamiento.ubicacion.ciudad.toLowerCase().includes(this.filtros.ciudad.toLowerCase());
      
      // Filtro por precio
      const cumplePrecio = alojamiento.precioNoche >= this.filtros.precio.min && 
        alojamiento.precioNoche <= this.filtros.precio.max;
      
      // Filtro por fechas (verificar disponibilidad)
      let cumpleFechas = true;
      if (this.filtros.fechaInicio && this.filtros.fechaFin) {
        cumpleFechas = this.verificarDisponibilidad(alojamiento, this.filtros.fechaInicio, this.filtros.fechaFin);
      }
      
      // Filtro por servicios
      let cumpleServicios = true;
      if (this.filtros.servicios.wifi) {
        cumpleServicios = cumpleServicios && this.contarServicios(alojamiento, 'wifi');
      }
      if (this.filtros.servicios.piscina) {
        cumpleServicios = cumpleServicios && this.contarServicios(alojamiento, 'piscina');
      }
      if (this.filtros.servicios.mascotas) {
        cumpleServicios = cumpleServicios && this.contarServicios(alojamiento, 'mascotas');
      }
      
      return cumpleCiudad && cumplePrecio && cumpleFechas && cumpleServicios;
    });
    if (this.alojamientosFiltrados.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin resultados',
        text: 'No se encontraron alojamientos con los filtros seleccionados.',
        timer: 3000,
        timerProgressBar: true,
        confirmButtonColor: '#4CB0A6'        
      });
    }
  }

  // Verificar si el alojamiento está disponible en el rango de fechas
  verificarDisponibilidad(alojamiento: AlojamientoDTO, fechaInicio: string, fechaFin: string): boolean {
    if (!alojamiento.reservas || alojamiento.reservas.length === 0) {
      return true; // Si no hay reservas, está disponible
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Verificar que no haya solapamiento con ninguna reserva existente
    return !alojamiento.reservas.some(reserva => {
      const reservaInicio = new Date(reserva.fechaInicio);
      const reservaFin = new Date(reserva.fechaFin);
      
      // Hay conflicto si las fechas se solapan
      return (inicio <= reservaFin && fin >= reservaInicio);
    });
  }

  // Ajustar precio mínimo para que no sea mayor que el máximo
  ajustarPrecioMinimo(): void {
    if (this.filtros.precio.min > this.filtros.precio.max) {
      this.filtros.precio.min = this.filtros.precio.max;
    }
  }

  // Ajustar precio máximo para que no sea menor que el mínimo
  ajustarPrecioMaximo(): void {
    if (this.filtros.precio.max < this.filtros.precio.min) {
      this.filtros.precio.max = this.filtros.precio.min;
    }
  }

  // Gestión de favoritos (LOCAL - no viene del backend)
  cargarFavoritosLocalStorage() {
    const favoritosGuardados = localStorage.getItem('favoritos');
    if (favoritosGuardados) {
      this.favoritos = new Set(JSON.parse(favoritosGuardados));
    }
  }

  guardarFavoritosLocalStorage() {
    localStorage.setItem('favoritos', JSON.stringify(Array.from(this.favoritos)));
  }

  toggleFavorito(id: number) {
    if (this.favoritos.has(id)) {
      this.favoritos.delete(id);
    } else {
      this.favoritos.add(id);
    }
    this.guardarFavoritosLocalStorage();
  }

  esFavorito(id: number): boolean {
    return this.favoritos.has(id);
  }

  // Método para calcular promedio de calificación desde los comentarios del backend
  calcularCalificacionPromedio(alojamiento: AlojamientoDTO): number {
    if (!alojamiento.comentarios || alojamiento.comentarios.length === 0) {
      return 0;
    }
    const suma = alojamiento.comentarios.reduce((acc, c) => acc + c.calificacion, 0);
    return Math.round((suma / alojamiento.comentarios.length) * 10) / 10;
  }

  // Método para formatear precio
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // Método para verificar si tiene un servicio específico
  contarServicios(alojamiento: AlojamientoDTO, servicio: string): boolean {
    return alojamiento.servicios.some(s => s.toLowerCase().includes(servicio.toLowerCase()));
  }

  // Navegar a detalles del alojamiento
  verDetalles(id: number): void {
    this.router.navigate(['/detalles-alojamiento', id]);
  }
}