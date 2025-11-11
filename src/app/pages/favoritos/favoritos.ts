import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainHeader } from '../../components/main-header/main-header';
import { AlojamientoDTO } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, MainHeader],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos implements OnInit {
  alojamientosFavoritos: AlojamientoDTO[] = [];
  cargando: boolean = false;

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavoritos();
  }

  private loadFavoritos(): void {
    this.cargando = true;
    // Cargar favoritos desde el backend
    this.alojamientoService.listarFavoritos(0, 100).subscribe({
      next: (page) => {
        this.alojamientosFavoritos = page.content;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar favoritos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los favoritos',
          confirmButtonColor: '#4CB0A6'
        });
        this.cargando = false;
      }
    });
  }

  quitarFavorito(id: number): void {
    Swal.fire({
      title: '¿Quitar de favoritos?',
      text: 'Este alojamiento se eliminará de tu lista de favoritos',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4CB0A6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.alojamientoService.quitarDeFavoritos(id).subscribe({
          next: () => {
            this.alojamientosFavoritos = this.alojamientosFavoritos.filter((a: AlojamientoDTO) => a.id !== id);
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El alojamiento ha sido quitado de favoritos',
              timer: 2000,
              showConfirmButton: false
            });
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
      }
    });
  }

  verDetalles(id: number): void {
    this.router.navigate(['/detalles-alojamiento', id]);
  }
}
