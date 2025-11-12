import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css'
})
export class Forbidden {
  constructor(
    private router: Router,
    private tokenService: TokenService
  ) {}

  goHome(): void {
    // Obtener el rol del usuario del token
    const userRole = this.tokenService.getRole();
    
    console.log('🏠 Forbidden - Redirigiendo usuario con rol:', userRole);
    
    // Redirigir según el rol (getRole() devuelve sin el prefijo ROLE_)
    if (userRole === 'ANFITRION') {
      console.log('➡️ Redirigiendo a mis-alojamientos-host');
      this.router.navigate(['/mis-alojamientos-host']);
    } else if (userRole === 'HUESPED') {
      console.log('➡️ Redirigiendo a principal');
      this.router.navigate(['/principal']);
    } else {
      // Si no hay rol (no autenticado), ir a principal
      console.log('➡️ Sin rol, redirigiendo a principal');
      this.router.navigate(['/principal']);
    }
  }
}
