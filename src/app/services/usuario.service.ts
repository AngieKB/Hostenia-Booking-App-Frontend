import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UsuarioDTO, EditarUsuarioDTO, ChangePasswordDTO } from '../models/usuario.model';
import { ResponseDTO } from '../models/auth.model';
import { UserDTO, Rol } from '../models/user-dto';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;
  private currentUser: UserDTO | null = null;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.loadCurrentUser();
  }

  edit(id: number, usuarioDTO: EditarUsuarioDTO): Observable<ResponseDTO<string>> {
    const formData = new FormData();
    formData.append('nombre', usuarioDTO.nombre);
    formData.append('telefono', usuarioDTO.telefono);
    
    if (usuarioDTO.fotoUrl) {
      formData.append('fotoUrl', usuarioDTO.fotoUrl);
    }

    return this.http.put<ResponseDTO<string>>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: number): Observable<ResponseDTO<string>> {
    return this.http.delete<ResponseDTO<string>>(`${this.apiUrl}/${id}`);
  }

  get(id: number): Observable<ResponseDTO<UsuarioDTO>> {
    return this.http.get<ResponseDTO<UsuarioDTO>>(`${this.apiUrl}/${id}`);
  }

  listAll(): Observable<ResponseDTO<UsuarioDTO[]>> {
    return this.http.get<ResponseDTO<UsuarioDTO[]>>(this.apiUrl);
  }

  changePassword(id: number, changePasswordDTO: ChangePasswordDTO): Observable<ResponseDTO<string>> {
    return this.http.put<ResponseDTO<string>>(`${this.apiUrl}/${id}/cambiar-password`, changePasswordDTO);
  }

  // ===== Métodos de gestión de usuario actual (migrados de UserService) =====

  // Get current user profile
  public getCurrentUser(): UserDTO | null {
    return this.currentUser;
  }

  // Update user profile locally
  public updateUser(updatedUser: UserDTO): void {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updatedUser };
      this.saveCurrentUser();
    }
  }

  // Logout user
  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.tokenService.logout();
  }

  // Check if user is logged in
  public isLoggedIn(): boolean {
    return this.tokenService.isLogged();
  }

  // Save user to local storage
  private saveCurrentUser(): void {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  // Load user from local storage or from token
  private loadCurrentUser(): void {
    if (this.tokenService.isLogged()) {
      // Si hay token, cargar datos del usuario desde localStorage o crear uno básico
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        // Crear usuario básico desde el token
        this.currentUser = {
          id: this.tokenService.getUserId() || undefined,
          nombre: '',
          email: this.tokenService.getEmail(),
          telefono: '',
          rol: this.getRolFromToken(),
          fotoUrl: ''
        };
      }
    } else {
      this.currentUser = null;
    }
  }

  // Obtener rol desde el token
  private getRolFromToken(): Rol {
    const role = this.tokenService.getRole();
    if (role === 'ANFITRION') {
      return Rol.ANFITRION;
    }
    return Rol.HUESPED;
  }

  // Actualizar usuario actual después del login
  public setCurrentUserFromToken(): void {
    if (this.tokenService.isLogged()) {
      this.currentUser = {
        id: this.tokenService.getUserId() || undefined,
        nombre: '',
        email: this.tokenService.getEmail(),
        telefono: '',
        rol: this.getRolFromToken(),
        fotoUrl: ''
      };
      this.saveCurrentUser();
    }
  }

  // Cargar datos completos del usuario desde el backend
  public loadUserFromBackend(userId: number): Observable<ResponseDTO<UsuarioDTO>> {
    return this.get(userId).pipe(
      tap(response => {
        if (response.content) {
          // Convertir UsuarioDTO del backend a UserDTO local
          const backendUser = response.content;
          this.currentUser = {
            id: backendUser.id,
            nombre: backendUser.nombre,
            email: backendUser.email,
            telefono: backendUser.telefono,
            rol: this.getRolFromToken(),
            fotoUrl: backendUser.fotoUrl
          };
          this.saveCurrentUser();
        }
      })
    );
  }
}
