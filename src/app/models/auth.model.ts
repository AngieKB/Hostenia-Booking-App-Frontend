export interface LoginDTO {
  email: string;
  password: string;
}

export interface CrearUsuarioDTO {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  fechaNacimiento: string; // formato: YYYY-MM-DD
  fotoUrl?: File;
}

export interface CrearAnfitrionDTO {
  descripcion: string;
  documentosLegales: string[];
  usuarioId: number;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  email: string;
  verificationCode: string;
  newPassword: string;
}

export interface TokenDTO {
  token: string;
}

export interface ResponseDTO<T> {
  error: boolean;
  status: number;
  content: T;
}
