import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlojamientoDTO, EstadoAlojamiento } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';
import { AgregarAlojamientoModal } from '../../components/agregar-alojamiento-modal/agregar-alojamiento-modal';
import { MapService } from '../../services/map-service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-alojamientos-host',
  standalone: true,
  imports: [CommonModule, MainHeaderHost, AgregarAlojamientoModal,FormsModule],
  templateUrl: './mis-alojamientos-host.html',
  styleUrl: './mis-alojamientos-host.css',
})
export class MisAlojamientosHost implements OnInit {
  latitud: number = 0;
  longitud: number = 0;
  alojamientos: AlojamientoDTO[] = [];
  showAddModal: boolean = false;

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router,
    private mapService: MapService
  ) {}

  ngOnInit(): void {
  // Cargar alojamientos existentes
  this.cargarAlojamientos();

  // Crear el mapa
  this.mapService.create();

  // Escuchar clics en el mapa y actualizar coordenadas
  this.mapService.addMarker().subscribe((marker) => {
    this.latitud = marker.lat;
    this.longitud = marker.lng;
  });
}


  cargarAlojamientos(): void {
    // Obtener solo alojamientos activos
    this.alojamientos = this.alojamientoService.getAll();
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onAgregarAlojamiento(data: any): void {
    console.log('Agregar alojamiento:', data);
    this.closeAddModal();
    this.cargarAlojamientos();
  }

  eliminarAlojamiento(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este alojamiento?')) {
      this.alojamientoService.delete(id);
      this.cargarAlojamientos();
    }
  }

  verDetalles(id: number): void {
    this.router.navigate(['/detalles-alojamiento-host', id]);
  }
}
