import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AlojamientoDTO } from '../../models/alojamiento';
import { MarkerDTO } from '../../models/marker-dto';
import { AlojamientoService } from '../../services/alojamiento.service';
import { UbicacionService } from '../../services/ubicacion.service';
import { EmptyHeader } from '../../components/empty-header/empty-header';
import { MainHeader } from '../../components/main-header/main-header';
import { Footer } from '../../components/footer/footer';
import Swal from 'sweetalert2';
import { MapService } from '../../services/map-service';
import { TokenService } from '../../services/token.service';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EmptyHeader, MainHeader, Footer],
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

  // Variable para saber si el usuario está logueado
  isLogged: boolean = false;

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router,
    private mapService: MapService,
    private ubicacionService: UbicacionService,
    private tokenService: TokenService
  ) {
    this.isLogged = this.tokenService.isLogged();
  }

  ngOnInit() {
    this.inicializarFechaMinima();
    this.cargarAlojamientos();
    this.cargarFavoritosLocalStorage();
    this.mapService.create();
  }

  // Inicializar fecha mínima (hoy)
  inicializarFechaMinima() {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  // Método para cargar alojamientos desde el servicio
  cargarAlojamientos() {
    // Obtener alojamientos del backend
    this.alojamientoService.listarTodos(0, 100).subscribe({
      next: (page) => {
        this.alojamientos = page.content;
        this.alojamientosFiltrados = [...this.alojamientos];
        // Actualizar marcadores en el mapa
        setTimeout(() => {
          const markers = this.mapItemToMarker(this.alojamientos);
          this.mapService.drawMarkers(markers);
        }, 500);
      },
      error: (error) => {
        console.error('Error al cargar alojamientos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los alojamientos',
          confirmButtonColor: '#4CB0A6'
        });
      }
    });
  }
  public mapItemToMarker(places: AlojamientoDTO[]): MarkerDTO[] {
    return places.map((item) => ({
      id: item.id,
      location: item.ubicacion,
      title: item.titulo,
      photoUrl: item.galeria[0] || "",
    }));
  }

  // Método para buscar/filtrar alojamientos usando la API
  buscarAlojamientos() {
    const busquedas: Observable<AlojamientoDTO[]>[] = [];
    
    // Búsqueda por ciudad
    if (this.filtros.ciudad) {
      busquedas.push(
        this.alojamientoService.buscarPorCiudad(this.filtros.ciudad, 0, 100)
          .pipe(map(page => page.content))
      );
    }
    
    // Búsqueda por fechas
    if (this.filtros.fechaInicio && this.filtros.fechaFin) {
      const fechaInicio = new Date(this.filtros.fechaInicio);
      const fechaFin = new Date(this.filtros.fechaFin);
      busquedas.push(
        this.alojamientoService.buscarPorFechas(fechaInicio, fechaFin, 0, 100)
          .pipe(map(page => page.content))
      );
    }
    
    // Búsqueda por precio
    if (this.filtros.precio.min > 0 || this.filtros.precio.max < 1000000) {
      busquedas.push(
        this.alojamientoService.buscarPorPrecio(this.filtros.precio.min, this.filtros.precio.max, 0, 100)
          .pipe(map(page => page.content))
      );
    }
    
    // Búsqueda por servicios
    const serviciosSeleccionados: string[] = [];
    if (this.filtros.servicios.wifi) serviciosSeleccionados.push('wifi');
    if (this.filtros.servicios.piscina) serviciosSeleccionados.push('piscina');
    if (this.filtros.servicios.mascotas) serviciosSeleccionados.push('mascotas');
    if (this.filtros.servicios.cocina) serviciosSeleccionados.push('cocina');
    
    if (serviciosSeleccionados.length > 0) {
      busquedas.push(
        this.alojamientoService.buscarPorServicios(serviciosSeleccionados, 0, 100)
          .pipe(map(page => page.content))
      );
    }
    
    // Si no hay filtros, mostrar todos
    if (busquedas.length === 0) {
      this.cargarAlojamientos();
      return;
    }
    
    // Combinar todas las búsquedas y encontrar la intersección
    forkJoin(busquedas).subscribe({
      next: (resultados) => {
        // Encontrar alojamientos que aparecen en todos los resultados
        this.alojamientosFiltrados = this.interseccionAlojamientos(resultados);
        
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
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al realizar la búsqueda',
          confirmButtonColor: '#4CB0A6'
        });
      }
    });
  }
  
  // Encontrar la intersección de múltiples arrays de alojamientos
  private interseccionAlojamientos(resultados: AlojamientoDTO[][]): AlojamientoDTO[] {
    if (resultados.length === 0) return [];
    if (resultados.length === 1) return resultados[0];
    
    // Comenzar con el primer resultado
    let interseccion = resultados[0];
    
    // Intersectar con cada resultado subsecuente
    for (let i = 1; i < resultados.length; i++) {
      const idsActuales = new Set(resultados[i].map(a => a.id));
      interseccion = interseccion.filter(a => idsActuales.has(a.id));
    }
    
    return interseccion;
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
    if (!this.isLogged) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar favoritos',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }
    
    if (this.favoritos.has(id)) {
      // Quitar de favoritos
      this.alojamientoService.quitarDeFavoritos(id).subscribe({
        next: () => {
          this.favoritos.delete(id);
          this.guardarFavoritosLocalStorage();
        },
        error: (error) => {
          console.error('Error al quitar de favoritos:', error);
        }
      });
    } else {
      // Agregar a favoritos
      this.alojamientoService.agregarAFavoritos(id).subscribe({
        next: () => {
          this.favoritos.add(id);
          this.guardarFavoritosLocalStorage();
        },
        error: (error) => {
          console.error('Error al agregar a favoritos:', error);
        }
      });
    }
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
    if (!this.tokenService.isLogged()) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para ver los detalles del alojamiento',
        confirmButtonColor: '#4CB0A6'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
    this.router.navigate(['/detalles-alojamiento', id]);
  }
}