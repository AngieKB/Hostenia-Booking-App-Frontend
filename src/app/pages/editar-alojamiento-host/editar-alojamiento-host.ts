import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlojamientoService } from '../../services/alojamiento.service';
import { AlojamientoDTO } from '../../models/alojamiento';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';
import { MapService } from '../../services/map-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-alojamiento-host',
  standalone: true,
  imports: [CommonModule, FormsModule, MainHeaderHost],
  templateUrl: './editar-alojamiento-host.html',
  styleUrl: './editar-alojamiento-host.css',
})
export class EditarAlojamientoHost implements OnInit, AfterViewInit {
  alojamientoId: number = 0;
  
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
  cargando: boolean = true;

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router,
    private route: ActivatedRoute,
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    // Obtener ID del alojamiento de la ruta
    this.route.params.subscribe(params => {
      this.alojamientoId = +params['id'];
      this.cargarAlojamiento();
    });
  }

  ngAfterViewInit(): void {
    // Crear el mapa después de que el DOM esté listo
    setTimeout(() => {
      this.mapService.create();

      // Escuchar clics en el mapa y actualizar coordenadas
      this.mapService.addMarker().subscribe((marker) => {
        this.latitud = marker.lat;
        this.longitud = marker.lng;
        this.ubicacionSeleccionada = true;
        
        Swal.fire({
          icon: 'success',
          title: 'Ubicación actualizada',
          text: `Lat: ${this.latitud.toFixed(4)}, Lng: ${this.longitud.toFixed(4)}`,
          timer: 2000,
          showConfirmButton: false
        });
      });
    }, 100);
  }

  cargarAlojamiento(): void {
    this.alojamientoService.obtenerPorId(this.alojamientoId).subscribe({
      next: (alojamiento: AlojamientoDTO) => {
        // Cargar datos del alojamiento
        this.alojamientoData.titulo = alojamiento.titulo;
        this.alojamientoData.descripcion = alojamiento.descripcion;
        this.alojamientoData.ciudad = alojamiento.ubicacion.ciudad;
        this.alojamientoData.direccion = alojamiento.ubicacion.direccion;
        this.alojamientoData.precioNoche = alojamiento.precioNoche;
        this.alojamientoData.capacidadMax = alojamiento.capacidadMax;
        
        // Cargar coordenadas
        this.latitud = alojamiento.ubicacion.latitud;
        this.longitud = alojamiento.ubicacion.longitud;
        this.ubicacionSeleccionada = true;
        
        // Cargar servicios
        this.alojamientoData.servicios.wifi = alojamiento.servicios.includes('WiFi');
        this.alojamientoData.servicios.piscina = alojamiento.servicios.includes('Piscina');
        this.alojamientoData.servicios.cocina = alojamiento.servicios.includes('Cocina');
        this.alojamientoData.servicios.mascotas = alojamiento.servicios.includes('Mascotas');
        
        this.cargando = false;
        
        // Actualizar marcador en el mapa
        this.mapService.updateMarker(this.latitud, this.longitud);
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

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.alojamientoData.galeria = Array.from(files);
    }
  }

  guardarCambios(): void {
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

    this.guardando = true;

    // Enviar al backend
    this.alojamientoService.editar(
      this.alojamientoId,
      this.alojamientoData.titulo,
      this.alojamientoData.descripcion,
      serviciosSeleccionados,
      this.alojamientoData.galeria,
      this.alojamientoData.ciudad,
      this.alojamientoData.direccion,
      this.latitud,
      this.longitud,
      this.alojamientoData.precioNoche,
      this.alojamientoData.capacidadMax
    ).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Cambios guardados',
          text: 'El alojamiento ha sido actualizado exitosamente',
          confirmButtonColor: '#4CB0A6'
        }).then(() => {
          this.router.navigate(['/mis-alojamientos-host']);
        });
        this.guardando = false;
      },
      error: (error) => {
        console.error('Error al actualizar alojamiento:', error);
        let mensajeError = 'Error al actualizar el alojamiento. Intente nuevamente.';
        
        if (error.error?.content && Array.isArray(error.error.content)) {
          mensajeError = error.error.content.map((err: any) => err.message).join('\n');
        } else if (error.error?.content) {
          mensajeError = error.error.content;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
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
