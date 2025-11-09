export enum Rol {
  USUARIO = 'USUARIO',
  ADMIN = 'ADMIN',
  PROPIETARIO = 'PROPIETARIO'
}

export interface UserDTO {
  id?: number;
  nombre: string;
  telefono: string;
  email: string;
  fotoUrl?: string;
  rol: Rol;
}
