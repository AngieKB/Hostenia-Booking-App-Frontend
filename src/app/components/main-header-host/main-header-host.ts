import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-header-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-header-host.html',
  styleUrl: './main-header-host.css',
})
export class MainHeaderHost {
  showUserMenu: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  toggleUserMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showUserMenu = !this.showUserMenu;
    console.log('🔘 Toggle menu:', this.showUserMenu);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Cerrar el menú si se hace clic fuera
    if (this.showUserMenu) {
      this.showUserMenu = false;
      console.log('🔘 Menu cerrado por click externo');
    }
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
    console.log('🔘 Menu cerrado manualmente');
  }

  navigateTo(route: string): void {
    console.log('🔘 Navegando a:', route);
    this.router.navigate([route]);
    this.showUserMenu = false;
  }

  logout(): void {
    console.log('🔘 Cerrando sesión');
    this.authService.removeToken();
    this.router.navigate(['/login']);
    this.showUserMenu = false;
  }
}
