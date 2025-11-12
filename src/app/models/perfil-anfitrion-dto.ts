export interface PerfilAnfitrionDTO {
  id: number;
  usuarioId?: number; // Opcional porque el backend no siempre lo incluye en la respuesta
  descripcion: string;
  documentosLegales: string[] | null;
  alojamientos: number[];
}

export interface EditarAnfitrionDTO {
  nombre: string;
  telefono?: string;
  fotoUrl?: string;
  descripcion?: string;
}
