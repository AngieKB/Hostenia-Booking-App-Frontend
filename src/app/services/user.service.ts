import { Injectable } from '@angular/core';
import { UserDTO, Rol } from '../models/user-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: UserDTO | null = null;
  
  constructor() {
    // Initialize with test user or load from storage
    this.loadCurrentUser();
  }

  // Get current user profile
  public getCurrentUser(): UserDTO | null {
    return this.currentUser;
  }

  // Update user profile
  public updateUser(updatedUser: UserDTO): void {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updatedUser };
      this.saveCurrentUser();
    }
  }

  // Login user (you can expand this with actual authentication)
  public login(credentials: { email: string, password: string }): boolean {
    // In a real app, this would make an HTTP request to your backend
    // For now, we'll just create a test user
    this.currentUser = {
      id: 1,
      nombre: 'María Pérez',
      email: credentials.email,
      telefono: '+57 123 456 7890',
      rol: Rol.USUARIO
    };
    this.saveCurrentUser();
    return true;
  }

  // Logout user
  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // Check if user is logged in
  public isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Save user to local storage
  private saveCurrentUser(): void {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  // Load user from local storage
  private loadCurrentUser(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    } else {
      // Default test user if none exists
      this.currentUser = {
        id: 1,
        nombre: 'María Pérez',
        email: 'maria.perez@example.com',
        telefono: '+57 123 456 7890',
        rol: Rol.USUARIO,
        fotoUrl: ''
      };
    }
  }
}
