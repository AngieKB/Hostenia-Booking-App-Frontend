import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '../services/token.service';

export const roleGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Verificar si está logueado
  if (!tokenService.isLogged()) {
    console.log('RoleGuard: Usuario no está logueado');
    router.navigate(['/forbidden']);
    return false;
  }

  const expectedRole: string[] = next.data["expectedRole"];
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
