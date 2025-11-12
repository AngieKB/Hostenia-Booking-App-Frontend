import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlojamientoDTO } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { PerfilAnfitrionService } from '../../services/perfil-anfitrion.service';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';
import { TokenService } from '../../services/token.service';
import Swal from 'sweetalert2';




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

  constructor(
    private alojamientoService: AlojamientoService,
    private perfilAnfitrionService: PerfilAnfitrionService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.cargarAlojamientos();
  }


  cargarAlojamientos(): void {
    this.cargando = true;
    const userId = this.tokenService.getUserId();
    
    console.log('🔍 MisAlojamientos - User ID del token:', userId);
    
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener tu información de usuario. Por favor, vuelve a iniciar sesión.',
        confirmButtonColor: '#4CB0A6'
      });
      this.cargando = false;
      return;
    }
    
    // Como el backend tiene la relación Usuario -> PerfilAnfitrion,
    // y el usuario_id está en la BD, usamos el userId directamente
    // El backend debería tener un endpoint GET /api/perfiles-anfitrion/usuario/{usuarioId}
    // Por ahora, usamos listar y filtrar
    this.perfilAnfitrionService.listarPerfiles().subscribe({
      next: (perfiles) => {
        console.log('✅ Perfiles obtenidos:', perfiles);
        console.log('🔍 Buscando perfil para userId:', userId);
        
        // Buscar el perfil que corresponde al usuario actual
        const perfil = perfiles.find(p => p.usuarioId === userId);
        
        if (!perfil || !perfil.id) {
          console.warn('⚠️ No se encontró perfil para el usuario:', userId);
          Swal.fire({
            icon: 'warning',
            title: 'Perfil no encontrado',
            text: 'No tienes un perfil de anfitrión creado. Por favor, crea uno primero.',
            confirmButtonColor: '#4CB0A6'
          });
          this.cargando = false;
          return;
        }
        
        const anfitrionId = perfil.id;
        console.log('✅ Perfil de anfitrión encontrado con ID:', anfitrionId);
        
        // Ahora cargar los alojamientos con el ID del perfil
        this.alojamientoService.listarPorAnfitrion(anfitrionId, 0, 100).subscribe({
          next: (page) => {
            console.log('✅ Respuesta del servicio:', page);
            console.log('📦 Contenido de la página:', page.content);
            
            this.alojamientos = page.content;
            console.log(`✅ ${this.alojamientos.length} alojamientos cargados`);
            
            this.cargando = false;
            
            // debug: mostrar galerías
            this.alojamientos.forEach((alojamiento, index) => {
              console.log(`Alojamiento ${index}:`, alojamiento.titulo);
              console.log('Galería:', alojamiento.galeria);
            });
          },
          error: (error) => {
            console.error('Error al cargar alojamientos:', error);
            console.error('Status:', error.status);
            console.error('Message:', error.message);
            
            let mensajeError = 'No se pudieron cargar los alojamientos';
            
            if (error.status === 403) {
              mensajeError = 'No tienes permisos para ver estos alojamientos.';
            } else if (error.status === 404) {
              mensajeError = 'No se encontraron alojamientos.';
            }
            
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: mensajeError,
              confirmButtonColor: '#4CB0A6'
            });
            this.cargando = false;
          }
        });
      },
      error: (error: any) => {
        console.error('Error al obtener perfiles de anfitrión:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar tu perfil de anfitrión. Por favor, intenta nuevamente.',
          confirmButtonColor: '#4CB0A6'
        });
        this.cargando = false;
      }
    });
  }

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
