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
    this.perfilAnfitrionService.listarPerfiles().subscribe({
      next: (perfiles) => {
        console.log('🔍 Perfiles obtenidos:', perfiles);
        console.log('🔍 Buscando perfil para userId:', userId);
        
        // Buscar el perfil que corresponde al usuario actual
        const perfil = perfiles.find(p => p.usuarioId === userId);
        console.log('🔍 Perfil encontrado:', perfil);
        
        if (!perfil) {
          Swal.fire({
            icon: 'warning',
            title: 'Perfil no encontrado',
            text: 'No tienes un perfil de anfitrión creado.',
            confirmButtonColor: '#4CB0A6'
          });
          this.cargando = false;
          return;
        }
        
        this.perfilAnfitrion = perfil;
        
        // Cargar datos del usuario desde el backend
        this.usuarioService.get(userId).subscribe({
          next: (response: any) => {
            console.log('✅ Datos del usuario cargados:', response);
            this.userData = response.content;
            this.cargando = false;
          },
          error: (error: any) => {
            console.error('❌ Error al cargar datos del usuario:', error);
            // Crear datos básicos por defecto
            this.userData = {
              id: userId,
              nombre: 'Anfitrión',
              email: 'No disponible',
              telefono: 'No disponible',
              fotoUrl: '',
              rol: 'ANFITRION' as any
            };
            this.cargando = false;
          }
        });
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
    this.router.navigate(['/mis-alojamientos-host']);
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
    console.log('🔐 Cambiar contraseña:', passwords);
    
    if (!this.userData?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el ID del usuario',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    const changePasswordDTO = {
      oldPassword: passwords.oldPassword,
      newPassword: passwords.newPassword
    };

    console.log('📤 Enviando petición de cambio de contraseña para usuario ID:', this.userData.id);
    console.log('📦 DTO:', changePasswordDTO);

    this.cargando = true;
    this.usuarioService.changePassword(this.userData.id, changePasswordDTO).subscribe({
      next: (response) => {
        console.log('✅ Contraseña cambiada exitosamente:', response);
        this.showPasswordModal = false;
        this.cargando = false;
        
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña actualizada!',
          text: 'Tu contraseña ha sido cambiada exitosamente. Se ha enviado un correo de confirmación.',
          confirmButtonColor: '#4CB0A6',
          confirmButtonText: 'Entendido'
        });
      },
      error: (error) => {
        console.error('❌ Error al cambiar contraseña:', error);
        this.cargando = false;
        
        let mensajeError = 'No se pudo cambiar la contraseña. Por favor, intenta nuevamente.';
        
        // Manejar errores de validación (array de errores)
        if (error.error?.content && Array.isArray(error.error.content)) {
          mensajeError = error.error.content
            .map((err: any) => err.message)
            .join('\n');
        } 
        // Manejar mensaje de error simple (string)
        else if (error.error?.content && typeof error.error.content === 'string') {
          mensajeError = error.error.content;
        } 
        // Manejar errores HTTP específicos
        else if (error.status === 400) {
          mensajeError = 'La contraseña actual es incorrecta o los datos no son válidos.';
        } else if (error.status === 404) {
          mensajeError = 'Usuario no encontrado.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error al cambiar contraseña',
          text: mensajeError,
          confirmButtonColor: '#4CB0A6'
        });
      }
    });
  }

  obtenerNombreDocumento(url: string): string {
    try {
      // Extraer el nombre del archivo de la URL
      const nombreCompleto = url.split('/').pop() || url;
      
      // Si tiene parámetros de query, removerlos
      const nombreSinQuery = nombreCompleto.split('?')[0];
      
      // Decodificar caracteres especiales
      const nombreDecodificado = decodeURIComponent(nombreSinQuery);
      
      // Si el nombre es muy largo, truncarlo
      if (nombreDecodificado.length > 50) {
        return nombreDecodificado.substring(0, 47) + '...';
      }
      
      return nombreDecodificado || 'Documento';
    } catch (error) {
      console.error('Error al extraer nombre del documento:', error);
      return 'Documento';
    }
  }
}
