import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

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
    private userService: UserService
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
    this.router.navigate(['/perfil-usuario']);
    this.closeUserMenu();
  }

  onCerrarSesion(): void {
    this.userService.logout();
    this.router.navigate(['/']);
    this.closeUserMenu();
  }

  isActive(page: string): boolean {
    return this.currentPage === page;
  }
}
