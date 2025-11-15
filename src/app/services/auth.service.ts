import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { TokenService } from './token.service';
import {
  LoginDTO,
  CrearUsuarioDTO,
  CrearAnfitrionDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  TokenDTO,
  ResponseDTO
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  login(loginDTO: LoginDTO): Observable<ResponseDTO<TokenDTO>> {
    return this.http.post<ResponseDTO<TokenDTO>>(`${this.apiUrl}/login`, loginDTO);
  }

  register(userDTO: CrearUsuarioDTO): Observable<ResponseDTO<string>> {
    const formData = new FormData();
    formData.append('nombre', userDTO.nombre);
    formData.append('email', userDTO.email);
    formData.append('telefono', userDTO.telefono);
    formData.append('password', userDTO.password);
    formData.append('fechaNacimiento', userDTO.fechaNacimiento);
    
    if (userDTO.fotoUrl) {
      formData.append('fotoUrl', userDTO.fotoUrl);
    }

    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/register`, formData);
  }

  hostRegister(dto: CrearAnfitrionDTO): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/host-register`, dto);
  }

  sendVerificationCode(forgotPasswordDTO: ForgotPasswordDTO): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/forgot-password`, forgotPasswordDTO);
  }

  resetPassword(resetPasswordDTO: ResetPasswordDTO): Observable<ResponseDTO<string>> {
    return this.http.put<ResponseDTO<string>>(`${this.apiUrl}/reset-password`, resetPasswordDTO);
  }

  // Métodos auxiliares para manejo de token (delegados a TokenService)
  saveToken(token: string): void {
    this.tokenService.login(token);
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  removeToken(): void {
    this.tokenService.logout();
  }

  isAuthenticated(): boolean {
    return this.tokenService.isLogged();
  }
}
