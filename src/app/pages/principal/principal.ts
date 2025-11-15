import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
export class Principal implements OnInit, OnDestroy, AfterViewInit {
  
  
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

  // Favoritos del usuario actual (desde backend)
  favoritos: Set<number> = new Set();

  // Variable para saber si el usuario está logueado
  isLogged: boolean = false;
  
  // Listener para cambios en sessionStorage
  private storageListener?: () => void;

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
    this.actualizarEstadoLogin();
    
    // Listener para detectar cambios en sessionStorage (logout desde otra pestaña)
    this.storageListener = () => {
      this.actualizarEstadoLogin();
    };
    window.addEventListener('storage', this.storageListener);
  }

  ngAfterViewInit() {
    if (this.isLogged) {
      this.mapService.create();
    }
  }

  ngOnDestroy() {
    // Limpiar listener
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  }

  // Método para actualizar estado de login y cargar favoritos
  actualizarEstadoLogin() {
    const nuevoEstadoLogin = this.tokenService.isLogged();
    
    // Si cambió el estado de login, limpiar favoritos
    if (this.isLogged !== nuevoEstadoLogin) {
      this.favoritos.clear();
    }
    
    this.isLogged = nuevoEstadoLogin;
    
    if (this.isLogged) {
      this.cargarFavoritos();
    }
  }

  // Inicializar fecha mínima (hoy)
  inicializarFechaMinima() {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  // Método para cargar alojamientos desde el servicio
  cargarAlojamientos() {
    // Obtener alojamientos del backend (solo activos)
    this.alojamientoService.listarTodos(0, 100).subscribe({
      next: (page) => {
        // Filtrar solo alojamientos activos
        this.alojamientos = page.content.filter(alojamiento => alojamiento.estado === 'ACTIVO');
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
  // Método para buscar/filtrar alojamientos usando todos los filtros locales
buscarAlojamientos() {

  const ciudad = this.filtros.ciudad.trim().toLowerCase();
  const fechaInicio = this.filtros.fechaInicio;
  const fechaFin = this.filtros.fechaFin;
  const precioMin = this.filtros.precio.min;
  const precioMax = this.filtros.precio.max;

  // Obtener lista de servicios seleccionados
  const serviciosSeleccionados: string[] = [];
  if (this.filtros.servicios.wifi) serviciosSeleccionados.push("wifi");
  if (this.filtros.servicios.piscina) serviciosSeleccionados.push("piscina");
  if (this.filtros.servicios.mascotas) serviciosSeleccionados.push("mascotas");
  if (this.filtros.servicios.cocina) serviciosSeleccionados.push("cocina");


  // VERIFICAR SI HAY ALGÚN FILTRO ACTIVO
  const hayFiltros =
    ciudad !== "" ||
    fechaInicio !== "" ||
    fechaFin !== "" ||
    serviciosSeleccionados.length > 0 ||
    precioMin > 0 ||
    precioMax < 1000000;

  if (!hayFiltros) {
    this.alojamientosFiltrados = [...this.alojamientos];
    return;
  }


  // INICIAR FILTRADO LOCAL
  let filtrados = [...this.alojamientos];


  // 🔹 FILTRO POR CIUDAD
  if (ciudad !== "") {
    filtrados = filtrados.filter(a =>
      a.ubicacion.ciudad.toLowerCase().includes(ciudad)
    );
  }

  // 🔹 FILTRO DE FECHAS (REQUIERE AMBAS)
  if (fechaInicio !== "" && fechaFin !== "") {
    filtrados = filtrados.filter(a =>
      this.verificarDisponibilidad(a, fechaInicio, fechaFin)
    );
  }

  // 🔹 FILTRO DE PRECIO (por noche)
  filtrados = filtrados.filter(a =>
    a.precioNoche >= precioMin && a.precioNoche <= precioMax
  );

  // 🔹 FILTRO DE SERVICIOS
  if (serviciosSeleccionados.length > 0) {
    filtrados = filtrados.filter(a =>
      serviciosSeleccionados.every(serv =>
        a.servicios.map(s => s.toLowerCase()).includes(serv.toLowerCase())
      )
    );
  }

  // ASIGNAR RESULTADO FINAL
  this.alojamientosFiltrados = filtrados;

  // ACTUALIZAR MARCADORES EN EL MAPA
  setTimeout(() => {
    const markers = this.mapItemToMarker(filtrados);
    this.mapService.drawMarkers(markers);
  }, 300);
}


  // Verificar si el alojamiento está disponible en el rango de fechas
  verificarDisponibilidad(alojamiento: AlojamientoDTO, fechaInicio: string, fechaFin: string): boolean {
    if (!alojamiento.reservas || alojamiento.reservas.length === 0) {
      return true; // Si no hay reservas, está disponible
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Verificar que no haya solapamiento con ninguna reserva existente
    return !alojamiento.reservas.some((reserva: any) => {
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

  // Gestión de favoritos (desde backend)
  cargarFavoritos() {
    if (!this.isLogged) {
      this.favoritos.clear();
      return;
    }
    
    this.alojamientoService.listarFavoritos(0, 1000).subscribe({
      next: (page) => {
        this.favoritos = new Set(page.content.map(alojamiento => alojamiento.id));
      },
      error: (error) => {
        console.error('Error al cargar favoritos:', error);
        this.favoritos.clear();
      }
      });
  }

  toggleFavorito(id: number) {
    if (!this.isLogged) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar favoritos',
        confirmButtonColor: '#4CB0A6'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
    
    if (this.favoritos.has(id)) {
      // Quitar de favoritos
      this.alojamientoService.quitarDeFavoritos(id).subscribe({
        next: () => {
          this.favoritos.delete(id);
        },
        error: (error) => {
          console.error('Error al quitar de favoritos:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo quitar de favoritos',
            confirmButtonColor: '#4CB0A6'
          });
        }
      });
    } else {
      // Agregar a favoritos
      this.alojamientoService.agregarAFavoritos(id).subscribe({
        next: () => {
          this.favoritos.add(id);
        },
        error: (error) => {
          console.error('Error al agregar a favoritos:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo agregar a favoritos',
            confirmButtonColor: '#4CB0A6'
          });
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