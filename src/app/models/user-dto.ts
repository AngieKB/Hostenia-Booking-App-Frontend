export enum Rol {
  HUESPED = 'HUESPED',
  ANFITRION = 'ANFITRION'
}

export interface UserDTO {
  id?: number;
  nombre: string;
  telefono: string;
  email: string;
  fotoUrl?: string;
  rol: Rol;
}
