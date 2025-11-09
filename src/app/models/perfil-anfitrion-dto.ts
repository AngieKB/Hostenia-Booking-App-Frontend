export interface PerfilAnfitrionDTO {
  id?: number;
  usuarioId: number;
  descripcion: string;
  documentosLegales: string[];
  alojamientos: number[];
}
