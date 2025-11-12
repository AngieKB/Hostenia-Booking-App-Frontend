import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  AlojamientoDTO, 
  CrearAlojamientoDTO, 
  EditarAlojamientoRequest,
  MetricasDTO,
  Page
} from '../models/alojamiento';
import { ResponseDTO } from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class AlojamientoService {
  private apiUrl = 'http://localhost:8080/api/alojamiento';

  constructor(private http: HttpClient) {}

  // Obtener todos los alojamientos con paginación
  public listarTodos(pagina: number = 0, tamanio: number = 12): Observable<Page<AlojamientoDTO>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamanio', tamanio.toString());
    
    return this.http.get<ResponseDTO<Page<AlojamientoDTO>>>(`${this.apiUrl}`, { params })
      .pipe(map(response => response.content));
  }

  // Obtener alojamiento por ID
  public obtenerPorId(id: number): Observable<AlojamientoDTO> {
    return this.http.get<ResponseDTO<AlojamientoDTO>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.content));
  }

  // Crear un nuevo alojamiento
  public crear(alojamientoDTO: CrearAlojamientoDTO): Observable<string> {
    const formData = new FormData();
    formData.append('titulo', alojamientoDTO.titulo);
    formData.append('descripcion', alojamientoDTO.descripcion);
    formData.append('ciudad', alojamientoDTO.ciudad);
    formData.append('direccion', alojamientoDTO.direccion);
    formData.append('latitud', alojamientoDTO.latitud.toString());
    formData.append('longitud', alojamientoDTO.longitud.toString());
    formData.append('precioNoche', alojamientoDTO.precioNoche.toString());
    formData.append('capacidadMax', alojamientoDTO.capacidadMax.toString());
    formData.append('pais', alojamientoDTO.pais);
    
    // Agregar servicios
    alojamientoDTO.servicios.forEach(servicio => {
      formData.append('servicios', servicio);
    });
    
    // Agregar imágenes
    alojamientoDTO.galeria.forEach(file => {
      formData.append('galeria', file);
    });
    
    return this.http.post<ResponseDTO<string>>(this.apiUrl, formData)
      .pipe(map(response => response.content));
  }

  // Actualizar un alojamiento existente
  public editar(
    id: number,
    titulo: string,
    descripcion: string,
    servicios: string[],
    galeria: File[],
    ciudad: string,
    direccion: string,
    latitud: number,
    longitud: number,
    precioNoche: number,
    capacidadMax: number
  ): Observable<string> {

    // Usar FormData con claves anidadas para mapear a EditarAlojamientoRequest
    const formData = new FormData();
    
    // Campos del alojamientoDTO
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('ciudad', ciudad);
    formData.append('direccion', direccion);
    formData.append('latitud', latitud.toString());
    formData.append('longitud', longitud.toString());
    formData.append('precioNoche', precioNoche.toString());
    formData.append('capacidadMax', capacidadMax.toString());
    
    // Agregar servicios con clave anidada
    servicios.forEach(servicio => {
      formData.append('servicios', servicio);
    });
    
    // Agregar imágenes solo si hay
    if (galeria && galeria.length > 0) {
      galeria.forEach(file => {
        formData.append('galeria', file);
      });
    }
    
    // Campos del ubicacionDTO
    formData.append('ubicacionDTO.ciudad', ciudad);
    formData.append('ubicacionDTO.direccion', direccion);
    formData.append('ubicacionDTO.latitud', latitud.toString());
    formData.append('ubicacionDTO.longitud', longitud.toString());
    formData.append('ubicacionDTO.pais', 'Colombia');
    
    return this.http.put<ResponseDTO<string>>(`${this.apiUrl}/${id}`, formData)
      .pipe(map(response => response.content));
  }

  // Eliminar un alojamiento
  public eliminar(id: number): Observable<string> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          // Si la respuesta es exitosa (status 200-299), consideramos que fue eliminado
          return 'Alojamiento eliminado exitosamente';
        }),
        catchError(error => {
          // Si el error es por parsing pero el status es 200, consideramos éxito
          if (error.status === 200) {
            return of('Alojamiento eliminado exitosamente');
          }
          // Para otros errores, los propagamos
          throw error;
        })
      );
  }


  // Ver métricas de un alojamiento
  public verMetricas(id: number, fechaMin: Date, fechaMax: Date): Observable<MetricasDTO> {
    const params = new HttpParams()
      .set('fechaMin', fechaMin.toISOString())
      .set('fechaMax', fechaMax.toISOString());
    
    return this.http.get<ResponseDTO<MetricasDTO>>(`${this.apiUrl}/${id}/metricas`, { params })
      .pipe(map(response => response.content));
  }

  // Buscar alojamientos por ciudad
  public buscarPorCiudad(ciudad: string, pagina: number = 0, tamanio: number = 12): Observable<Page<AlojamientoDTO>> {
    const params = new HttpParams()
      .set('ciudad', ciudad)
      .set('pagina', pagina.toString())
      .set('tamanio', tamanio.toString());
    
    return this.http.get<ResponseDTO<Page<AlojamientoDTO>>>(`${this.apiUrl}/buscar/ciudad`, { params })
      .pipe(map(response => response.content));
  }

  // Buscar alojamientos por fechas
  public buscarPorFechas(fechaInicio: Date, fechaFin: Date, pagina: number = 0, tamanio: number = 12): Observable<Page<AlojamientoDTO>> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio.toISOString())
      .set('fechaFin', fechaFin.toISOString())
      .set('pagina', pagina.toString())
      .set('tamanio', tamanio.toString());
    
    return this.http.get<ResponseDTO<Page<AlojamientoDTO>>>(`${this.apiUrl}/buscar/fechas`, { params })
      .pipe(map(response => response.content));
  }

  // Buscar alojamientos por rango de precio
  public buscarPorPrecio(precioMin: number, precioMax: number, pagina: number = 0, tamanio: number = 12): Observable<Page<AlojamientoDTO>> {
    const params = new HttpParams()
      .set('precioMin', precioMin.toString())
      .set('precioMax', precioMax.toString())
      .set('pagina', pagina.toString())
      .set('tamanio', tamanio.toString());
    
    return this.http.get<ResponseDTO<Page<AlojamientoDTO>>>(`${this.apiUrl}/buscar/precio`, { params })
      .pipe(map(response => response.content));
  }

  // Buscar alojamientos por servicios
  public buscarPorServicios(servicios: string[], pagina: number = 0, tamanio: number = 12): Observable<Page<AlojamientoDTO>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamanio', tamanio.toString());
    
    servicios.forEach(servicio => {
      params = params.append('servicios', servicio);
    });
    
    return this.http.get<ResponseDTO<Page<AlojamientoDTO>>>(`${this.apiUrl}/buscar/servicios`, { params })
      .pipe(map(response => response.content));
  }

  // Listar alojamientos por anfitrión
  public listarPorAnfitrion(idAnfitrion: number, pagina: number = 0, tamanio: number = 12): Observable<Page<AlojamientoDTO>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamanio', tamanio.toString());
    
    return this.http.get<ResponseDTO<Page<AlojamientoDTO>>>(`${this.apiUrl}/listarPorAnfitrion/${idAnfitrion}`, { params })
      .pipe(map(response => response.content));
  }

  // Agregar a favoritos
  public agregarAFavoritos(alojamientoId: number): Observable<string> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/favoritos/${alojamientoId}`, {})
      .pipe(map(response => response.content));
  }

  // Quitar de favoritos
  public quitarDeFavoritos(alojamientoId: number): Observable<string> {
    return this.http.delete<ResponseDTO<string>>(`${this.apiUrl}/favoritos/${alojamientoId}`)
      .pipe(map(response => response.content));
  }

  // Listar favoritos
  public listarFavoritos(pagina: number = 0, tamanio: number = 12): Observable<Page<AlojamientoDTO>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamanio', tamanio.toString());
    
    return this.http.get<ResponseDTO<Page<AlojamientoDTO>>>(`${this.apiUrl}/favoritos`, { params })
      .pipe(map(response => response.content));
  }

  // Contar usuarios que tienen como favorito
  public contarUsuariosFavorito(alojamientoId: number): Observable<number> {
    return this.http.get<ResponseDTO<number>>(`${this.apiUrl}/${alojamientoId}/favorito/count`)
      .pipe(map(response => response.content));
  }
}
