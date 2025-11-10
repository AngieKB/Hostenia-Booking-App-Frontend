export interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  fotoUrl?: string;
  rol?: string;
}

export interface EditarUsuarioDTO {
  nombre: string;
  telefono: string;
  fotoUrl?: File;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}
