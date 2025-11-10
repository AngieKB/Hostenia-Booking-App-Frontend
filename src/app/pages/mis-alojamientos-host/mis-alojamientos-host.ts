import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlojamientoDTO, EstadoAlojamiento } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';
import { AgregarAlojamientoModal } from '../../components/agregar-alojamiento-modal/agregar-alojamiento-modal';

@Component({
  selector: 'app-mis-alojamientos-host',
  standalone: true,
  imports: [CommonModule, MainHeaderHost, AgregarAlojamientoModal],
  templateUrl: './mis-alojamientos-host.html',
  styleUrl: './mis-alojamientos-host.css',
})
export class MisAlojamientosHost implements OnInit {
  alojamientos: AlojamientoDTO[] = [];
  showAddModal: boolean = false;

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarAlojamientos();
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
    // Aquí implementarías la lógica para crear en el backend
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
