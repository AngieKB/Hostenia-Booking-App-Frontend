import { UbicacionDTO } from "./alojamiento";

export interface MarkerDTO {
    id: number,
    location: UbicacionDTO,
    title: string,
    photoUrl: string
}