import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  console.log('🔐 AuthInterceptor - URL:', req.url);
  console.log('🔐 AuthInterceptor - Usuario logueado:', tokenService.isLogged());

  if (!tokenService.isLogged()) {
    console.log('⚠️ AuthInterceptor - No hay token, enviando request sin Authorization');
    return next(req);
  }

  const token = tokenService.getToken();
  console.log('✅ AuthInterceptor - Token encontrado:', token?.substring(0, 20) + '...');
  
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log('📤 AuthInterceptor - Enviando request con Authorization header');
  return next(authReq);
};
