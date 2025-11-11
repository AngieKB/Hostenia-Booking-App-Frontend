import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-empty-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-header.html',
  styleUrl: './empty-header.css',
})
export class EmptyHeader {
  isLogged = false;
  email: string = '';
  showUserMenu: boolean = false;
  isLoginPage = false;

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {
    this.isLogged = this.tokenService.isLogged();
    if (this.isLogged) {
      this.email = this.tokenService.getEmail();
    }
    this.checkCurrentRoute();
  }

  private checkCurrentRoute(): void {
    this.isLoginPage = this.router.url === '/login';
  }

  goToHome(): void {
    this.navigateTo('/');
  }

  navigateTo(route: string): void {
    this.router.navigate([route]).then(() => {
      this.checkCurrentRoute();
      this.closeUserMenu();
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  logout(): void {
    this.tokenService.logout();
    this.router.navigate(['/login']).then(() => window.location.reload());
  }
}
