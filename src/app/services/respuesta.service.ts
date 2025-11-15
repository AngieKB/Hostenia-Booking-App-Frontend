import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponderDTO, RespuestaDTO } from '../models/comentario-dto';
import { ResponseDTO } from '../models/response-dto';
import { environment } from '../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class RespuestaService {
  private apiUrl = `${environment.apiUrl}/api/respuestas`;

  constructor(private http: HttpClient) {}

  // Responder a un comentario (ANFITRION)
  public responderComentario(responderDTO: ResponderDTO): Observable<string> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}`, responderDTO)
      .pipe(map(response => response.content));
  }

  // Obtener respuesta por comentario (HUESPED o ANFITRION)
  public obtenerRespuestaPorComentario(idComentario: number): Observable<RespuestaDTO> {
    return this.http.get<ResponseDTO<RespuestaDTO>>(`${this.apiUrl}/comentario/${idComentario}`)
      .pipe(map(response => response.content));
  }

  // Obtener respuesta por ID (HUESPED o ANFITRION)
  public obtenerRespuestaPorId(id: number): Observable<RespuestaDTO> {
    return this.http.get<ResponseDTO<RespuestaDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.content));
  }
}
