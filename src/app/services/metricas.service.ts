import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MetricasDTO } from '../models/metricas-dto';
import { ResponseDTO } from '../models/response-dto';
import { environment } from '../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class MetricasService {
  private apiUrl = `${environment.apiUrl}/api/alojamiento`;

  constructor(private http: HttpClient) {}

  // Obtener métricas de un alojamiento en un rango de fechas (ANFITRION)
  public obtenerMetricas(
    alojamientoId: number, 
    fechaMin: string, 
    fechaMax: string
  ): Observable<MetricasDTO> {
    const params = new HttpParams()
      .set('fechaMin', fechaMin)
      .set('fechaMax', fechaMax);
    
    return this.http.get<ResponseDTO<MetricasDTO>>(`${this.apiUrl}/${alojamientoId}/metricas`, { params })
      .pipe(map(response => response.content));
  }
}
