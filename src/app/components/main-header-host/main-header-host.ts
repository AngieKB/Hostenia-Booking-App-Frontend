import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-header-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-header-host.html',
  styleUrl: './main-header-host.css',
})
export class MainHeaderHost {
  showUserMenu: boolean = false;

  constructor(private router: Router) {}

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
    // Implementar lógica de logout
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    console.log('Logout');
    this.router.navigate(['/']);
    this.showUserMenu = false;
  }
}
