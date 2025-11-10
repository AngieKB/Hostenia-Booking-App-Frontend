import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioDTO, EditarUsuarioDTO, ChangePasswordDTO } from '../models/usuario.model';
import { ResponseDTO } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;

  constructor(private http: HttpClient) { }

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
}
