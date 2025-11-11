import { Component } from '@angular/core';
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

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.removeToken();
    this.router.navigate(['/login']);
    this.showUserMenu = false;
  }
}
