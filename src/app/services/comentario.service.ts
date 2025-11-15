import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComentarDTO, ComentarioDTO } from '../models/comentario-dto';
import { environment } from '../../environments/environment.prod';

import { ResponseDTO } from '../models/response-dto';
import { Page } from '../models/alojamiento';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private apiUrl = `${environment.apiUrl}/api/comentarios`;

  constructor(private http: HttpClient) {}

  // Crear un comentario (HUESPED)
  public crearComentario(reservaId: number, comentarDto: ComentarDTO): Observable<string> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/${reservaId}`, comentarDto)
      .pipe(map(response => response.content));
  }

  // Obtener comentarios de un alojamiento (HUESPED o ANFITRION)
  public obtenerComentariosPorAlojamiento(idAlojamiento: number, pagina: number = 0, tamanio: number = 12): Observable<Page<ComentarioDTO>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamanio', tamanio.toString());
    
    return this.http.get<ResponseDTO<Page<ComentarioDTO>>>(`${this.apiUrl}/alojamiento/${idAlojamiento}`, { params })
      .pipe(map(response => response.content));
  }
}
