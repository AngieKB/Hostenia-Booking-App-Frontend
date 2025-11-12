import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  ReservaAlojamientoDTO, 
  ReservaUsuarioDTO,
  RealizarReservaDTO,
  EditarReservaDTO
} from '../models/reserva-dto';
import { ResponseDTO } from '../models/response-dto';
import { Page } from '../models/alojamiento';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://localhost:8080/api/reserva';

  constructor(private http: HttpClient) {}

  // Crear una nueva reserva (HUESPED)
  public crear(reservaDTO: RealizarReservaDTO): Observable<string> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/crear`, reservaDTO)
      .pipe(map(response => response.content));
  }

  // Editar una reserva (HUESPED)
  public editar(id: number, dto: EditarReservaDTO): Observable<string> {
    return this.http.put<ResponseDTO<string>>(`${this.apiUrl}/${id}`, dto)
      .pipe(map(response => response.content));
  }

  // Cancelar una reserva (HUESPED o ANFITRION)
  public cancelar(id: number): Observable<string> {
    return this.http.delete<ResponseDTO<string>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.content));
  }

  // Actualizar reservas completadas (HUESPED o ANFITRION)
  public actualizarReservasCompletadas(): Observable<string> {
    return this.http.put<ResponseDTO<string>>(`${this.apiUrl}/actualizar-completadas`, {})
      .pipe(map(response => response.content));
  }

  // Obtener mis reservas como huésped (HUESPED)
  public obtenerMisReservas(page: number = 0, size: number = 12): Observable<Page<ReservaUsuarioDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ResponseDTO<Page<ReservaUsuarioDTO>>>(`${this.apiUrl}/mis-reservas`, { params })
      .pipe(map(response => response.content));
  }
  // Confirmar una reserva (ANFITRION)
public aprobarReserva(id: number): Observable<string> {
  return this.http.put<ResponseDTO<string>>(`${this.apiUrl}/confirmar/${id}`, {})
    .pipe(map(response => response.content));
}


  // Obtener reservas de un alojamiento específico (ANFITRION)
  public obtenerReservasPorAlojamiento(alojamientoId: number, page: number = 0, size: number = 12): Observable<Page<ReservaAlojamientoDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ResponseDTO<Page<ReservaAlojamientoDTO>>>(`${this.apiUrl}/mis-reservas-aloja/${alojamientoId}`, { params })
      .pipe(map(response => response.content));
  }

  // Obtener todas las reservas del usuario (sin paginación) para verificar si puede comentar
  public obtenerTodasMisReservas(): Observable<ReservaUsuarioDTO[]> {
    return this.http.get<ResponseDTO<Page<ReservaUsuarioDTO>>>(`${this.apiUrl}/mis-reservas`, {
      params: new HttpParams().set('page', '0').set('size', '1000')
    }).pipe(map(response => response.content.content));
  }

  // Obtener reserva por ID
    public obtenerPorId(id: number): Observable<ReservaUsuarioDTO> {
      return this.http.get<ResponseDTO<ReservaUsuarioDTO>>(`${this.apiUrl}/${id}`)
        .pipe(map(response => response.content));
    }
}
