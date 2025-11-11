import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-header.html',
  styleUrl: './main-header.css',
})
export class MainHeader {
  @Input() currentPage: string = '';
  showUserMenu: boolean = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeUserMenu();
  }

  onVerPerfil(): void {
    console.log('MainHeader: Navegando a perfil-usuario');
    this.closeUserMenu();
    this.router.navigate(['/perfil-usuario']).then(
      success => console.log('MainHeader: Navegación exitosa:', success),
      error => console.error('MainHeader: Error en navegación:', error)
    );
  }

  onCerrarSesion(): void {
    this.usuarioService.logout();
    this.router.navigate(['/login']);
    this.closeUserMenu();
  }

  isActive(page: string): boolean {
    return this.currentPage === page;
  }
}
