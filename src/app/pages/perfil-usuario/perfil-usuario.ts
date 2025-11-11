import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { UserDTO, Rol } from '../../models/user-dto';
import { CambiarContrasenaModal } from '../../components/cambiar-contrasena-modal/cambiar-contrasena-modal';
import { EditarPerfilUsuarioModal } from '../../components/editar-perfil-usuario-modal/editar-perfil-usuario-modal';
import { ConvertirseAnfitrionModal } from '../../components/convertirse-anfitrion-modal/convertirse-anfitrion-modal';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, CambiarContrasenaModal, EditarPerfilUsuarioModal, ConvertirseAnfitrionModal],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
})
export class PerfilUsuario implements OnInit {
  userData: UserDTO = {
    nombre: '',
    email: '',
    telefono: '',
    rol: Rol.HUESPED,
    fotoUrl: ''
  };

  showEditModal: boolean = false;
  showPasswordModal: boolean = false;
  showAnfitrionModal: boolean = false;
  convirtiendoEnAnfitrion: boolean = false;
  cargandoDatos: boolean = false;
  guardandoPerfil: boolean = false;
  cambiandoPassword: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargandoDatos = true;
    this.usuarioService.loadUserFromBackend(userId).subscribe({
      next: (response) => {
        const currentUser = this.usuarioService.getCurrentUser();
        if (currentUser) {
          this.userData = { ...currentUser };
        }
        this.cargandoDatos = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        this.mensajeError = 'Error al cargar los datos del perfil';
        this.cargandoDatos = false;
      }
    });
  }

  onBackClick(): void {
    // Navigate back or to home
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

  onSaveProfile(updatedData: { nombre: string; telefono: string; fotoUrl?: File }): void {
    const userId = this.userData.id;
    if (!userId) {
      this.mensajeError = 'No se pudo identificar al usuario';
      return;
    }

    this.guardandoPerfil = true;
    this.mensajeError = '';

    const editarDTO = {
      nombre: updatedData.nombre,
      telefono: updatedData.telefono,
      fotoUrl: updatedData.fotoUrl
    };

    this.usuarioService.edit(userId, editarDTO).subscribe({
      next: (response) => {
        this.mensajeExito = 'Perfil actualizado exitosamente';
        this.showEditModal = false;
        this.guardandoPerfil = false;
        // Recargar datos del usuario
        this.loadUserData();
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.mensajeError = error.error?.content || 'Error al actualizar el perfil';
        this.guardandoPerfil = false;
      }
    });
  }

  onSavePassword(passwords: { oldPassword: string; newPassword: string }): void {
    const userId = this.userData.id;
    if (!userId) {
      this.mensajeError = 'No se pudo identificar al usuario';
      return;
    }

    this.cambiandoPassword = true;
    this.mensajeError = '';

    this.usuarioService.changePassword(userId, passwords).subscribe({
      next: (response) => {
        this.mensajeExito = 'Contraseña actualizada exitosamente';
        this.showPasswordModal = false;
        this.cambiandoPassword = false;
        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);
        this.mensajeError = error.error?.content || 'Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.';
        this.cambiandoPassword = false;
      }
    });
  }

  onLogoutClick(): void {
    this.usuarioService.logout();
    this.router.navigate(['/login']);
  }

  onConvertirseAnfitrionClick(): void {
    this.showAnfitrionModal = true;
  }

  onCloseAnfitrionModal(): void {
    this.showAnfitrionModal = false;
  }

  onSaveAnfitrion(data: { descripcion: string; documentosLegales: string[] }): void {
    this.convirtiendoEnAnfitrion = true;
    this.mensajeError = '';

    // Obtener el ID del usuario actual del token o del servicio
    const currentUser = this.usuarioService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.mensajeError = 'No se pudo obtener la información del usuario';
      this.convirtiendoEnAnfitrion = false;
      return;
    }

    const anfitrionDTO = {
      descripcion: data.descripcion,
      documentosLegales: data.documentosLegales,
      usuarioId: currentUser.id
    };

    this.authService.hostRegister(anfitrionDTO)
      .subscribe({
        next: (response) => {
          this.mensajeExito = '¡Felicidades! Te has convertido en anfitrión exitosamente. Por favor, inicia sesión nuevamente.';
          this.showAnfitrionModal = false;
          this.convirtiendoEnAnfitrion = false;
          
          // Cerrar sesión automáticamente y redirigir al login
          setTimeout(() => {
            this.tokenService.logout();
            this.router.navigate(['/login']).then(() => {
              // Mostrar mensaje informativo
              alert('Tu perfil de anfitrión ha sido creado. Por favor, inicia sesión nuevamente para acceder a todas las funciones.');
            });
          }, 2000);
        },
        error: (error) => {
          console.error('Error al convertirse en anfitrión:', error);
          this.mensajeError = error.error?.content || 'Error al crear el perfil de anfitrión. Intente nuevamente.';
          this.convirtiendoEnAnfitrion = false;
        }
      });
  }

  get esAnfitrion(): boolean {
    return this.userData.rol === Rol.ANFITRION;
  }
}
