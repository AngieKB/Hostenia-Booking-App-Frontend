import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlojamientoDTO } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { MainHeader } from '../../components/main-header/main-header';
import { Footer } from '../../components/footer/footer';

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
    rangoFechas: '',
    precio: { min: 0, max: 1000000 },
    servicios: {
      cocina: false,
      wifi: false,
      piscina: false,
      mascotas: false
    }
  };

  // Lista de alojamientos que vienen del backend
  alojamientos: AlojamientoDTO[] = [];
  alojamientosFiltrados: AlojamientoDTO[] = [];

  // Favoritos (manejados localmente, NO vienen del backend)
  // En una app real, podrías guardarlos en localStorage o en el backend
  favoritos: Set<number> = new Set();

  constructor(private alojamientoService: AlojamientoService) {}

  ngOnInit() {
    this.cargarAlojamientos();
    this.cargarFavoritosLocalStorage();
  }

  // Método para cargar alojamientos desde el servicio
  cargarAlojamientos() {
    // Obtener alojamientos del servicio
    this.alojamientos = this.alojamientoService.getAll();
    this.alojamientosFiltrados = [...this.alojamientos];
  }

  // Método anterior con datos hardcodeados (ya no se usa)
  cargarAlojamientosHardcoded() {
    this.alojamientos = [
      {
        id: 1,
        titulo: 'Casa Moderna en el Centro',
        descripcion: 'Hermosa casa con todas las comodidades',
        servicios: ['WiFi', 'Piscina', 'Cocina'],
        galeria: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
        ubicacion: {
          direccion: 'Calle 123 #45-67',
          ciudad: 'Bogotá',
          pais: 'Colombia',
          latitud: 4.7110,
          longitud: -74.0721
        },
        precioNoche: 250000,
        capacidadMax: 6,
        comentarios: [
          {
            id: 1,
            usuarioId: 1,
            nombreUsuario: 'Juan Pérez',
            calificacion: 5,
            comentario: 'Excelente lugar',
            fecha: new Date()
          }
        ],
        reservas: [],
        estado: 'ACTIVO' as any
      },
      {
        id: 2,
        titulo: 'Apartamento Acogedor',
        descripcion: 'Perfecto para parejas o familias pequeñas',
        servicios: ['WiFi', 'Cocina', 'TV'],
        galeria: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
        ubicacion: {
          direccion: 'Carrera 50 #23-10',
          ciudad: 'Medellín',
          pais: 'Colombia',
          latitud: 6.2442,
          longitud: -75.5812
        },
        precioNoche: 180000,
        capacidadMax: 4,
        comentarios: [
          {
            id: 2,
            usuarioId: 2,
            nombreUsuario: 'María García',
            calificacion: 4,
            comentario: 'Muy cómodo',
            fecha: new Date()
          }
        ],
        reservas: [],
        estado: 'ACTIVO' as any
      },
      {
        id: 3,
        titulo: 'Casa de Playa',
        descripcion: 'Disfruta del mar y el sol',
        servicios: ['WiFi', 'Piscina'],
        galeria: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf'],
        ubicacion: {
          direccion: 'Sector Playa Blanca',
          ciudad: 'Cartagena',
          pais: 'Colombia',
          latitud: 10.3910,
          longitud: -75.4794
        },
        precioNoche: 450000,
        capacidadMax: 8,
        comentarios: [
          {
            id: 3,
            usuarioId: 3,
            nombreUsuario: 'Carlos López',
            calificacion: 5,
            comentario: 'Increíble vista al mar',
            fecha: new Date()
          },
          {
            id: 4,
            usuarioId: 4,
            nombreUsuario: 'Ana Rodríguez',
            calificacion: 4,
            comentario: 'Muy limpio',
            fecha: new Date()
          }
        ],
        reservas: [],
        estado: 'ACTIVO' as any
      }
    ];
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
      
      return cumpleCiudad && cumplePrecio && cumpleServicios;
    });
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
}