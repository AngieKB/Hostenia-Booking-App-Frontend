import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilAnfitrionService } from '../../services/perfil-anfitrion.service';
import { UserDTO } from '../../models/user-dto';
import { PerfilAnfitrionDTO } from '../../models/perfil-anfitrion-dto';
import { CambiarContrasenaModal } from '../../components/cambiar-contrasena-modal/cambiar-contrasena-modal';
import { EditarPerfilAnfitrionModal } from '../../components/editar-perfil-anfitrion-modal/editar-perfil-anfitrion-modal';

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

  constructor(
    private usuarioService: UsuarioService,
    private perfilAnfitrionService: PerfilAnfitrionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Obtener usuario actual
    this.userData = this.usuarioService.getCurrentUser();
    
    if (!this.userData) {
      // Redirigir al login si no hay usuario
      this.router.navigate(['/login']);
      return;
    }

    // Obtener perfil de anfitrión del usuario
    this.perfilAnfitrion = this.perfilAnfitrionService.getByUsuarioId(this.userData.id!) || null;
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
    this.usuarioService.updateUser(data.user);
    if (this.perfilAnfitrion?.id) {
      this.perfilAnfitrionService.update(this.perfilAnfitrion.id, data.perfil);
    }
    this.userData = { ...data.user };
    this.perfilAnfitrion = { ...data.perfil };
    this.showEditModal = false;
    console.log('Perfil de anfitrión actualizado:', data);
  }

  onSavePassword(passwords: { oldPassword: string; newPassword: string }): void {
    // Aquí implementarías la lógica para cambiar la contraseña
    console.log('Cambiar contraseña:', passwords);
    this.showPasswordModal = false;
    // Mostrar mensaje de éxito
  }
}
