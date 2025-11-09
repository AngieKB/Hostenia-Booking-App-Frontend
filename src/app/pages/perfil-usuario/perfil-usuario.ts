import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserDTO, Rol } from '../../models/user-dto';
import { CambiarContrasenaModal } from '../../components/cambiar-contrasena-modal/cambiar-contrasena-modal';
import { EditarPerfilUsuarioModal } from '../../components/editar-perfil-usuario-modal/editar-perfil-usuario-modal';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, CambiarContrasenaModal, EditarPerfilUsuarioModal],
  templateUrl: './perfil-usuario.html',
  styleUrl: './perfil-usuario.css',
})
export class PerfilUsuario implements OnInit {
  userData: UserDTO = {
    nombre: '',
    email: '',
    telefono: '',
    rol: Rol.USUARIO,
    fotoUrl: ''
  };

  showEditModal: boolean = false;
  showPasswordModal: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.userData = { ...currentUser };
    } else {
      // Redirect to login if no user is logged in
      this.router.navigate(['/']);
    }
  }

  onBackClick(): void {
    // Navigate back or to home
    this.router.navigate(['/principal']);
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

  onSaveProfile(updatedUser: UserDTO): void {
    this.userService.updateUser(updatedUser);
    this.userData = { ...updatedUser };
    this.showEditModal = false;
    console.log('Perfil actualizado:', updatedUser);
  }

  onSavePassword(passwords: { oldPassword: string; newPassword: string }): void {
    // Aquí implementarías la lógica para cambiar la contraseña
    console.log('Cambiar contraseña:', passwords);
    this.showPasswordModal = false;
    // Mostrar mensaje de éxito
  }

  onLogoutClick(): void {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}
