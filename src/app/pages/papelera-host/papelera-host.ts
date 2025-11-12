import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { AlojamientoDTO } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';
import { TokenService } from '../../services/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-papelera-host',
  standalone: true,
  imports: [CommonModule, MainHeaderHost, Footer],
  templateUrl: './papelera-host.html',
  styleUrl: './papelera-host.css',
})
export class PapeleraHost implements OnInit {
  alojamientosInactivos: AlojamientoDTO[] = [];
  cargando: boolean = false;

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.cargarAlojamientosInactivos();
  }

  cargarAlojamientosInactivos(): void {
    this.cargando = true;
    const userId = this.tokenService.getUserId();
    
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el ID del usuario',
        confirmButtonColor: '#4CB0A6'
      });
      this.cargando = false;
      return;
    }
    
    // Obtener alojamientos inactivos del anfitrión desde el backend
    this.alojamientoService.listarPorAnfitrion(userId, 0, 100).subscribe({
      next: (page) => {
        // Filtrar solo los inactivos (si el backend no lo hace)
        // Por ahora mostramos todos, pero podrías agregar un filtro de estado
        this.alojamientosInactivos = page.content.filter((a: AlojamientoDTO) => a.estado === 'INACTIVO');
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar alojamientos inactivos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los alojamientos',
          confirmButtonColor: '#4CB0A6'
        });
        this.cargando = false;
      }
    });
  }

  verDetalles(id: number): void {
    this.router.navigate(['/detalles-alojamiento-host', id]);
  }
}
