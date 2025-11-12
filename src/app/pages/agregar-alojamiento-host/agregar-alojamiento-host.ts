import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlojamientoService } from '../../services/alojamiento.service';
import { CrearAlojamientoDTO } from '../../models/alojamiento';
import { MapService } from '../../services/map-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-alojamiento-host',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-alojamiento-host.html',
  styleUrl: './agregar-alojamiento-host.css',
})
export class AgregarAlojamientoHost implements OnInit {
  // Coordenadas del mapa
  latitud: number = 4.7110;
  longitud: number = -74.0721;
  ubicacionSeleccionada: boolean = false;

  // Datos del formulario
  alojamientoData = {
    titulo: '',
    descripcion: '',
    ciudad: '',
    direccion: '',
    pais: 'Colombia',
    precioNoche: 0,
    capacidadMax: 1,
    servicios: {
      wifi: false,
      piscina: false,
      cocina: false,
      mascotas: false
    },
    galeria: [] as File[]
  };

  guardando: boolean = false;

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router,
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    // Crear el mapa
    this.mapService.create();

    // Escuchar clics en el mapa y actualizar coordenadas
    this.mapService.addMarker().subscribe((marker) => {
      this.latitud = marker.lat;
      this.longitud = marker.lng;
      this.ubicacionSeleccionada = true;
      
      Swal.fire({
        icon: 'success',
        title: 'Ubicación seleccionada',
        text: `Lat: ${this.latitud.toFixed(4)}, Lng: ${this.longitud.toFixed(4)}`,
        timer: 2000,
        showConfirmButton: false
      });
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      // Convertir FileList a Array
      this.alojamientoData.galeria = Array.from(files);
    }
  }

  guardarAlojamiento(): void {
    // Validaciones
    if (!this.alojamientoData.titulo || !this.alojamientoData.descripcion) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor complete el título y la descripción',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    if (!this.alojamientoData.ciudad || !this.alojamientoData.direccion) {
      Swal.fire({
        icon: 'warning',
        title: 'Ubicación requerida',
        text: 'Por favor complete la ciudad y dirección',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    if (!this.ubicacionSeleccionada) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione ubicación en el mapa',
        text: 'Por favor haga clic en el mapa para seleccionar la ubicación exacta',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    if (this.alojamientoData.galeria.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Imágenes requeridas',
        text: 'Por favor agregue al menos una imagen del alojamiento',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    // Obtener servicios seleccionados
    const serviciosSeleccionados: string[] = [];
    if (this.alojamientoData.servicios.wifi) serviciosSeleccionados.push('WiFi');
    if (this.alojamientoData.servicios.piscina) serviciosSeleccionados.push('Piscina');
    if (this.alojamientoData.servicios.cocina) serviciosSeleccionados.push('Cocina');
    if (this.alojamientoData.servicios.mascotas) serviciosSeleccionados.push('Mascotas');

    if (serviciosSeleccionados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Servicios requeridos',
        text: 'Por favor seleccione al menos un servicio',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    // Crear DTO
    const crearAlojamientoDTO: CrearAlojamientoDTO = {
      titulo: this.alojamientoData.titulo,
      descripcion: this.alojamientoData.descripcion,
      servicios: serviciosSeleccionados,
      galeria: this.alojamientoData.galeria,
      ciudad: this.alojamientoData.ciudad,
      direccion: this.alojamientoData.direccion,
      latitud: this.latitud,
      longitud: this.longitud,
      precioNoche: this.alojamientoData.precioNoche,
      capacidadMax: this.alojamientoData.capacidadMax,
      pais: this.alojamientoData.pais
    };

    this.guardando = true;

    // Enviar al backend
    this.alojamientoService.crear(crearAlojamientoDTO).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Alojamiento creado',
          text: 'El alojamiento ha sido registrado exitosamente',
          confirmButtonColor: '#4CB0A6'
        }).then(() => {
          this.router.navigate(['/mis-alojamientos-host']);
        });
        this.guardando = false;
      },
      error: (error) => {
        console.error('Error al crear alojamiento:', error);
        let mensajeError = 'Error al crear el alojamiento. Intente nuevamente.';
        let titulo = 'Error';
        
        // Error de conexión (backend no disponible)
        if (error.status === 0) {
          titulo = 'Error de Conexión';
          mensajeError = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8080';
        }
        // Error de autenticación
        else if (error.status === 401 || error.status === 403) {
          titulo = 'Error de Autenticación';
          mensajeError = 'No tienes permisos para crear alojamientos. Asegúrate de estar logueado como ANFITRION.';
        }
        // Errores de validación del backend
        else if (error.error?.content && Array.isArray(error.error.content)) {
          mensajeError = error.error.content.map((err: any) => err.message).join('\n');
        } else if (error.error?.content) {
          mensajeError = error.error.content;
        }
        
        Swal.fire({
          icon: 'error',
          title: titulo,
          text: mensajeError,
          confirmButtonColor: '#4CB0A6'
        });
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/mis-alojamientos-host']);
  }
}
