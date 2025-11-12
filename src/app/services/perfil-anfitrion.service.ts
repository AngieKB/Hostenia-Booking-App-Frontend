import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PerfilAnfitrionDTO, EditarAnfitrionDTO } from '../models/perfil-anfitrion-dto';
import { ResponseDTO } from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class PerfilAnfitrionService {
  private apiUrl = 'http://localhost:8080/api/perfiles-anfitrion';

  constructor(private http: HttpClient) {}

  // Obtener perfil de anfitrión por ID
  public obtenerPerfil(id: number): Observable<PerfilAnfitrionDTO> {
    return this.http.get<ResponseDTO<PerfilAnfitrionDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.content));
  }

  // Obtener perfil de anfitrión por ID de usuario
  public obtenerPorUsuarioId(usuarioId: number): Observable<PerfilAnfitrionDTO> {
    return this.http.get<ResponseDTO<PerfilAnfitrionDTO>>(`${this.apiUrl}/usuario/${usuarioId}`)
      .pipe(map(response => response.content));
  }

  // Listar todos los perfiles de anfitrión
  public listarPerfiles(): Observable<PerfilAnfitrionDTO[]> {
    return this.http.get<ResponseDTO<PerfilAnfitrionDTO[]>>(`${this.apiUrl}`)
      .pipe(map(response => response.content));
  }

  // Actualizar perfil de anfitrión
  public actualizarPerfil(id: number, dto: EditarAnfitrionDTO): Observable<string> {
    return this.http.put<ResponseDTO<string>>(`${this.apiUrl}/${id}`, dto)
      .pipe(map(response => response.content));
  }

  // Eliminar perfil de anfitrión
  public eliminarPerfil(id: number): Observable<string> {
    return this.http.delete<ResponseDTO<string>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.content));
  }
}
