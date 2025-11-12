import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '../services/token.service';

export const roleGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const expectedRole: string[] = next.data["expectedRole"];
  const allowUnauthenticated: boolean = next.data["allowUnauthenticated"] || false;

  // Verificar si está logueado
  if (!tokenService.isLogged()) {
    // Si se permite acceso sin autenticación, permitir el acceso
    if (allowUnauthenticated) {
      console.log('RoleGuard: Usuario no autenticado, pero se permite acceso');
      return true;
    }
    console.log('RoleGuard: Usuario no está logueado');
    router.navigate(['/forbidden']);
    return false;
  }

  const realRole = tokenService.getRole();

  console.log('RoleGuard - Rol esperado:', expectedRole);
  console.log('RoleGuard - Rol real:', realRole);

  // Verifica si su rol coincide
  if (!expectedRole.includes(realRole)) {
    console.log('RoleGuard: Rol no coincide, redirigiendo a forbidden');
    router.navigate(['/forbidden']);
    return false;
  }

  console.log('RoleGuard: Acceso permitido');
  return true;
};
