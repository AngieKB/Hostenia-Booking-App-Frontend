export interface PerfilAnfitrionDTO {
  id: number;
  usuarioId: number;
  descripcion: string;
  documentosLegales: string[];
  alojamientos: number[];
}

export interface EditarAnfitrionDTO {
  nombre: string;
  telefono?: string;
  fotoUrl?: string;
  descripcion?: string;
}
