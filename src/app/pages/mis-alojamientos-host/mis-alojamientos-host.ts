import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlojamientoDTO } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';
import { TokenService } from '../../services/token.service';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';




@Component({
  selector: 'app-mis-alojamientos-host',
  standalone: true,
  imports: [CommonModule, MainHeaderHost],
  templateUrl: './mis-alojamientos-host.html',
  styleUrl: './mis-alojamientos-host.css',
})
export class MisAlojamientosHost implements OnInit {
  alojamientos: AlojamientoDTO[] = [];
  cargando: boolean = false;
  private apiUrl = environment.apiUrl;

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router,
    private tokenService: TokenService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarAlojamientos();
  }


  cargarAlojamientos(): void {
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
  

    this.http.get<any>(`${this.apiUrl}/alojamiento/listarPorAnfitrion/${userId}?pagina=0&tamanio=100`)
      .subscribe({
        next: (res) => {
          console.log('Respuesta completa del backend:', res);

  if (res?.content?.content && Array.isArray(res.content.content)) {
    this.alojamientos = res.content.content;
  } else {
    console.warn('⚠️ Estructura inesperada en la respuesta:', res);
    this.alojamientos = [];
  }

  this.cargando = false;

  this.cargando = false;

          // debug: mostrar galerías
          this.alojamientos.forEach((alojamiento, index) => {
            console.log(`Alojamiento ${index}:`, alojamiento.titulo);
            console.log('Galería:', alojamiento.galeria);
          });
        },
        error: (error) => {
          console.error('Error al cargar alojamientos:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los alojamientos',
            confirmButtonColor: '#4CB0A6'
          });
          this.cargando = false;
        }
      });}

  agregarAlojamiento(): void {
    this.router.navigate(['/agregar-alojamiento-host']);
  }

  eliminarAlojamiento(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el alojamiento',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.alojamientoService.eliminar(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El alojamiento ha sido eliminado',
              confirmButtonColor: '#4CB0A6'
            });
            this.cargarAlojamientos();
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el alojamiento',
              confirmButtonColor: '#4CB0A6'
            });
          }
        });
      }
    });
  }

  verDetalles(id: number): void {
    this.router.navigate(['/detalles-alojamiento-host', id]);
  }
}
