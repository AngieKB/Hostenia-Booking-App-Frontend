import { Injectable } from '@angular/core';

const TOKEN_KEY = "AuthToken";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  private setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  public isLogged(): boolean {
    return !!this.getToken();
  }

  public login(token: string): void {
    this.setToken(token);
  }

  public logout(): void {
    sessionStorage.clear();
  }

  private decodePayload(token: string): any {
    try {
      const payload = token.split(".")[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }

  private getPayload(): any {
    const token = this.getToken();
    return token ? this.decodePayload(token) : null;
  }

  public getEmail(): string {
    return this.getPayload()?.sub || "";
  }

  public getRole(): string {
    const payload = this.getPayload();
    console.log('TokenService - Payload completo:', payload);
    
    if (!payload) {
      console.log('TokenService - No hay payload');
      return "";
    }

    // Intentar obtener el rol de diferentes campos posibles
    let role = payload.role || payload.roles || payload.authorities || payload.authority;
    
    console.log('TokenService - Rol extraído:', role);
    
    if (!role) {
      console.log('TokenService - No se encontró rol en el payload');
      return "";
    }
    
    // El backend puede retornar el rol como string o array
    let finalRole = Array.isArray(role) ? role[0] : role;
    
    // Remover el prefijo "ROLE_" si existe
    if (finalRole.startsWith('ROLE_')) {
      finalRole = finalRole.substring(5); // Quita "ROLE_"
    }
    
    console.log('TokenService - Rol final:', finalRole);
    
    return finalRole;
  }

  public getUserId(): number | null {
    const payload = this.getPayload();
    console.log('TokenService - getUserId - Payload:', payload);
    
    // El ID puede estar en userId, sub, o id
    const id = payload?.userId || payload?.sub || payload?.id;
    console.log('TokenService - getUserId - ID extraído:', id);
    
    // Convertir a número si es string
    if (id) {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      console.log('TokenService - getUserId - ID final:', numId);
      return numId;
    }
    
    return null;
  }
}
