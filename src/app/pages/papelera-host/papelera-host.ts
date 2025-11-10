import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlojamientoDTO, EstadoAlojamiento } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';

@Component({
  selector: 'app-papelera-host',
  standalone: true,
  imports: [CommonModule, MainHeaderHost],
  templateUrl: './papelera-host.html',
  styleUrl: './papelera-host.css',
})
export class PapeleraHost implements OnInit {
  alojamientosInactivos: AlojamientoDTO[] = [];

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarAlojamientosInactivos();
  }

  cargarAlojamientosInactivos(): void {
    // Obtener solo alojamientos inactivos
    this.alojamientosInactivos = this.alojamientoService.getInactive();
  }

  reponerAlojamiento(id: number): void {
    if (confirm('¿Deseas reponer este alojamiento?')) {
      this.alojamientoService.restore(id);
      this.cargarAlojamientosInactivos();
    }
  }
}
