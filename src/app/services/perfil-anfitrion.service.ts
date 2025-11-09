import { Injectable } from '@angular/core';
import { PerfilAnfitrionDTO } from '../models/perfil-anfitrion-dto';
import { UserDTO } from '../models/user-dto';

@Injectable({
  providedIn: 'root'
})
export class PerfilAnfitrionService {
  private perfiles: PerfilAnfitrionDTO[] = [];

  constructor() {
    this.initializeTestData();
  }

  // Obtener perfil de anfitrión por ID de usuario
  public getByUsuarioId(usuarioId: number): PerfilAnfitrionDTO | undefined {
    return this.perfiles.find(p => p.usuarioId === usuarioId);
  }

  // Obtener perfil de anfitrión por ID
  public getById(id: number): PerfilAnfitrionDTO | undefined {
    return this.perfiles.find(p => p.id === id);
  }

  // Crear un nuevo perfil de anfitrión
  public create(perfil: Omit<PerfilAnfitrionDTO, 'id'>): PerfilAnfitrionDTO {
    const newPerfil: PerfilAnfitrionDTO = {
      ...perfil,
      id: this.generateId()
    };
    
    this.perfiles.push(newPerfil);
    return newPerfil;
  }

  // Actualizar perfil de anfitrión
  public update(id: number, updatedPerfil: Partial<PerfilAnfitrionDTO>): PerfilAnfitrionDTO | null {
    const index = this.perfiles.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.perfiles[index] = {
      ...this.perfiles[index],
      ...updatedPerfil,
      id // Asegurarse de que el ID no se modifique
    };

    return this.perfiles[index];
  }

  // Agregar documento legal
  public addDocumentoLegal(perfilId: number, documento: string): boolean {
    const perfil = this.getById(perfilId);
    if (!perfil) return false;

    perfil.documentosLegales.push(documento);
    return true;
  }

  // Agregar alojamiento al perfil
  public addAlojamiento(perfilId: number, alojamientoId: number): boolean {
    const perfil = this.getById(perfilId);
    if (!perfil) return false;

    if (!perfil.alojamientos.includes(alojamientoId)) {
      perfil.alojamientos.push(alojamientoId);
    }
    return true;
  }

  // Remover alojamiento del perfil
  public removeAlojamiento(perfilId: number, alojamientoId: number): boolean {
    const perfil = this.getById(perfilId);
    if (!perfil) return false;

    perfil.alojamientos = perfil.alojamientos.filter(id => id !== alojamientoId);
    return true;
  }

  // Generar un ID único
  private generateId(): number {
    return Math.max(0, ...this.perfiles.map(p => p.id || 0)) + 1;
  }

  // Inicializar datos de prueba
  private initializeTestData(): void {
    this.perfiles = [
      {
        id: 1,
        usuarioId: 1,
        descripcion: 'Anfitrión experimentado con más de 5 años en el sector de alojamientos turísticos. Me apasiona brindar experiencias únicas a mis huéspedes y asegurarme de que su estadía sea memorable.',
        documentosLegales: ['documento1.pdf', 'documento2.pdf'],
        alojamientos: [1, 2]
      }
    ];
  }
}
