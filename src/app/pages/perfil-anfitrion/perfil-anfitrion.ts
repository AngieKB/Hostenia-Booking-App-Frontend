import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilAnfitrionService } from '../../services/perfil-anfitrion.service';
import { TokenService } from '../../services/token.service';
import { UserDTO } from '../../models/user-dto';
import { PerfilAnfitrionDTO, EditarAnfitrionDTO } from '../../models/perfil-anfitrion-dto';
import { CambiarContrasenaModal } from '../../components/cambiar-contrasena-modal/cambiar-contrasena-modal';
import { EditarPerfilAnfitrionModal } from '../../components/editar-perfil-anfitrion-modal/editar-perfil-anfitrion-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil-anfitrion',
  standalone: true,
  imports: [CommonModule, CambiarContrasenaModal, EditarPerfilAnfitrionModal],
  templateUrl: './perfil-anfitrion.html',
  styleUrl: './perfil-anfitrion.css',
})
export class PerfilAnfitrion implements OnInit {
  userData: UserDTO | null = null;
  perfilAnfitrion: PerfilAnfitrionDTO | null = null;
  showEditModal: boolean = false;
  showPasswordModal: boolean = false;
  cargando: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private perfilAnfitrionService: PerfilAnfitrionService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.cargando = true;
    const userId = this.tokenService.getUserId();
    
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el ID del usuario',
        confirmButtonColor: '#4CB0A6'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      this.cargando = false;
      return;
    }

    // Obtener perfil de anfitrión desde el backend
    this.perfilAnfitrionService.obtenerPerfil(userId).subscribe({
      next: (perfil) => {
        this.perfilAnfitrion = perfil;
        // Cargar datos del usuario desde el servicio local o token
        this.userData = this.usuarioService.getCurrentUser();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar perfil de anfitrión:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el perfil de anfitrión',
          confirmButtonColor: '#4CB0A6'
        });
        this.cargando = false;
      }
    });
  }

  onBackClick(): void {
    this.router.navigate(['/']);
  }

  onEditClick(): void {
    this.showEditModal = true;
  }

  onChangePasswordClick(): void {
    this.showPasswordModal = true;
  }

  onCloseEditModal(): void {
    this.showEditModal = false;
  }

  onClosePasswordModal(): void {
    this.showPasswordModal = false;
  }

  onSaveProfile(data: { user: UserDTO; perfil: PerfilAnfitrionDTO }): void {
    if (!this.perfilAnfitrion?.id) return;

    // Crear DTO de edición
    const editarDTO: EditarAnfitrionDTO = {
      nombre: data.user.nombre,
      telefono: data.user.telefono,
      fotoUrl: data.user.fotoUrl,
      descripcion: data.perfil.descripcion
    };

    this.cargando = true;
    this.perfilAnfitrionService.actualizarPerfil(this.perfilAnfitrion.id, editarDTO).subscribe({
      next: (mensaje) => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: mensaje,
          confirmButtonColor: '#4CB0A6'
        });
        // Actualizar datos locales
        this.userData = { ...data.user };
        this.perfilAnfitrion = { ...data.perfil };
        this.showEditModal = false;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        let mensajeError = 'No se pudo actualizar el perfil';
        
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
        this.cargando = false;
      }
    });
  }

  onSavePassword(passwords: { oldPassword: string; newPassword: string }): void {
    // Aquí implementarías la lógica para cambiar la contraseña
    console.log('Cambiar contraseña:', passwords);
    this.showPasswordModal = false;
    // Mostrar mensaje de éxito
  }
}
