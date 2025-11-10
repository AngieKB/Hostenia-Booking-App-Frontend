import { Injectable } from '@angular/core';
import { AlojamientoDTO, EstadoAlojamiento, Comentario, Reserva } from '../models/alojamiento';

@Injectable({
  providedIn: 'root'
})
export class AlojamientoService {
  private alojamientos: AlojamientoDTO[] = [];

  constructor() {
    this.initializeTestData();
  }

  // Obtener todos los alojamientos activos
  public getAll(): AlojamientoDTO[] {
    return this.alojamientos.filter(a => a.estado === EstadoAlojamiento.ACTIVO);
  }

  // Obtener alojamiento por ID
  public getById(id: number): AlojamientoDTO | undefined {
    return this.alojamientos.find(a => a.id === id);
  }

  // Crear un nuevo alojamiento
  public create(alojamiento: Omit<AlojamientoDTO, 'id' | 'comentarios' | 'reservas'>): AlojamientoDTO {
    const newAlojamiento: AlojamientoDTO = {
      ...alojamiento,
      id: this.generateId(),
      comentarios: [],
      reservas: [],
      estado: EstadoAlojamiento.ACTIVO
    };
    
    this.alojamientos.push(newAlojamiento);
    return newAlojamiento;
  }

  // Actualizar un alojamiento existente
  public update(id: number, updatedAlojamiento: Partial<AlojamientoDTO>): AlojamientoDTO | null {
    const index = this.alojamientos.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.alojamientos[index] = {
      ...this.alojamientos[index],
      ...updatedAlojamiento,
      id // Asegurarse de que el ID no se modifique
    };

    return this.alojamientos[index];
  }

  // Eliminar un alojamiento (cambiar estado a INACTIVO)
  public delete(id: number): boolean {
    const index = this.alojamientos.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.alojamientos[index].estado = EstadoAlojamiento.INACTIVO;
    return true;
  }

  // Obtener alojamientos inactivos
  public getInactive(): AlojamientoDTO[] {
    return this.alojamientos.filter(a => a.estado === EstadoAlojamiento.INACTIVO);
  }

  // Restaurar un alojamiento (cambiar estado a ACTIVO)
  public restore(id: number): boolean {
    const index = this.alojamientos.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.alojamientos[index].estado = EstadoAlojamiento.ACTIVO;
    return true;
  }

  // Filtrar alojamientos por ciudad
  public filterByCiudad(ciudad: string): AlojamientoDTO[] {
    if (!ciudad) return this.getAll();
    return this.getAll().filter(a => 
      a.ubicacion.ciudad.toLowerCase().includes(ciudad.toLowerCase())
    );
  }

  // Filtrar alojamientos por rango de precio
  public filterByPrecio(min: number, max: number): AlojamientoDTO[] {
    return this.getAll().filter(a => 
      a.precioNoche >= min && a.precioNoche <= max
    );
  }

  // Filtrar alojamientos por servicios
  public filterByServicios(servicios: string[]): AlojamientoDTO[] {
    if (servicios.length === 0) return this.getAll();
    return this.getAll().filter(a => 
      servicios.every(servicio => 
        a.servicios.some(s => s.toLowerCase().includes(servicio.toLowerCase()))
      )
    );
  }

  // Agregar comentario a un alojamiento
  public addComentario(alojamientoId: number, comentario: Omit<Comentario, 'id' | 'fecha'>): boolean {
    const alojamiento = this.getById(alojamientoId);
    if (!alojamiento) return false;

    const nuevoComentario: Comentario = {
      ...comentario,
      id: this.generateComentarioId(alojamiento),
      fecha: new Date()
    };

    alojamiento.comentarios.push(nuevoComentario);
    return true;
  }

  // Agregar reserva a un alojamiento
  public addReserva(alojamientoId: number, reserva: Omit<Reserva, 'id'>): boolean {
    const alojamiento = this.getById(alojamientoId);
    if (!alojamiento) return false;

    const nuevaReserva: Reserva = {
      ...reserva,
      id: this.generateReservaId(alojamiento)
    };

    alojamiento.reservas.push(nuevaReserva);
    return true;
  }

  // Generar un ID único para alojamientos
  private generateId(): number {
    return Math.max(0, ...this.alojamientos.map(a => a.id)) + 1;
  }

  // Generar un ID único para comentarios
  private generateComentarioId(alojamiento: AlojamientoDTO): number {
    if (alojamiento.comentarios.length === 0) return 1;
    return Math.max(...alojamiento.comentarios.map(c => c.id)) + 1;
  }

  // Generar un ID único para reservas
  private generateReservaId(alojamiento: AlojamientoDTO): number {
    if (alojamiento.reservas.length === 0) return 1;
    return Math.max(...alojamiento.reservas.map(r => r.id)) + 1;
  }

  // Inicializar datos de prueba
  private initializeTestData(): void {
    this.alojamientos = [
      {
        id: 1,
        titulo: 'Casa Moderna en el Centro',
        descripcion: 'Hermosa casa con todas las comodidades',
        servicios: ['WiFi', 'Piscina', 'Cocina', 'Mascotas'],
        galeria: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
        ubicacion: {
          direccion: 'Calle 123 #45-67',
          ciudad: 'Bogotá',
          pais: 'Colombia',
          latitud: 4.7110,
          longitud: -74.0721
        },
        precioNoche: 250000,
        capacidadMax: 6,
        comentarios: [
          {
            id: 1,
            texto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            calificacion: 5,
            fecha: new Date('2020-03-12')
          },
          {
            id: 2,
            texto: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            calificacion: 4,
            fecha: new Date('2020-03-12')
          },
          {
            id: 3,
            texto: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            calificacion: 5,
            fecha: new Date('2020-03-12')
          },
          {
            id: 4,
            texto: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            calificacion: 4,
            fecha: new Date('2020-03-12')
          },
          {
            id: 5,
            texto: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
            calificacion: 5,
            fecha: new Date('2020-03-12')
          }
        ],
        reservas: [],
        estado: EstadoAlojamiento.ACTIVO
      },
      {
        id: 2,
        titulo: 'Apartamento Acogedor',
        descripcion: 'Perfecto para parejas o familias pequeñas',
        servicios: ['WiFi', 'Cocina', 'TV'],
        galeria: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
        ubicacion: {
          direccion: 'Carrera 50 #23-10',
          ciudad: 'Medellín',
          pais: 'Colombia',
          latitud: 6.2442,
          longitud: -75.5812
        },
        precioNoche: 180000,
        capacidadMax: 4,
        comentarios: [
          {
            id: 1,
            texto: 'Muy cómodo y bien ubicado. Excelente atención del anfitrión.',
            calificacion: 4,
            fecha: new Date('2020-03-12')
          }
        ],
        reservas: [],
        estado: EstadoAlojamiento.ACTIVO
      },
      {
        id: 3,
        titulo: 'Casa de Playa',
        descripcion: 'Disfruta del mar y el sol',
        servicios: ['WiFi', 'Piscina', 'Cocina', 'Mascotas'],
        galeria: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf'],
        ubicacion: {
          direccion: 'Sector Playa Blanca',
          ciudad: 'Cartagena',
          pais: 'Colombia',
          latitud: 10.3910,
          longitud: -75.4794
        },
        precioNoche: 450000,
        capacidadMax: 8,
        comentarios: [
          {
            id: 1,
            texto: 'Increíble vista al mar, la casa es hermosa y muy espaciosa.',
            calificacion: 5,
            fecha: new Date('2020-03-12')
          },
          {
            id: 2,
            texto: 'Muy limpio y ordenado. Definitivamente volveríamos.',
            calificacion: 4,
            fecha: new Date('2020-03-12')
          }
        ],
        reservas: [],
        estado: EstadoAlojamiento.ACTIVO
      }
    ];
  }
}
