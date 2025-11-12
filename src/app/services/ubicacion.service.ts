import { Injectable } from '@angular/core';
import { AlojamientoDTO, EstadoAlojamiento } from '../models/alojamiento';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  private lugares: AlojamientoDTO[] = [
    {
      id: 1,
      titulo: 'Casa Moderna en el Centro',
      descripcion: 'Hermosa casa con todas las comodidades',
      servicios: ['WiFi', 'Piscina', 'Cocina'],
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
      idAnfitrion: 1001,
      nombreAnfitrion: 'Anfitrión Demo 1',
      comentarios: [
        {
          id: 1,
          texto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          calificacion: 5,
          fecha: new Date('2020-03-12')
        },
        {
          id: 2,
          texto: 'Ut enim ad minim veniam, quis nostrud exercitation.',
          calificacion: 4,
          fecha: new Date('2020-03-12')
        }
      ],
      reservas: [],
      estado: EstadoAlojamiento.ACTIVO
    },
    {
      id: 2,
      titulo: 'Apartamento con vista al mar',
      descripcion: 'Relájate con una hermosa vista al océano',
      servicios: ['WiFi', 'Cocina', 'Parqueadero'],
      galeria: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511'],
      ubicacion: {
        direccion: 'Carrera 45 #12-90',
        ciudad: 'Armenia',
        pais: 'Colombia',
        latitud: 4.5339,
        longitud: -75.6811
      },
      precioNoche: 350000,
      capacidadMax: 4,
      idAnfitrion: 1002,
      nombreAnfitrion: 'Anfitrión Demo 2',
      comentarios: [],
      reservas: [],
      estado: EstadoAlojamiento.ACTIVO
    }
  ];

  constructor() {}

  /** Retorna todos los alojamientos disponibles */
  getAll(): AlojamientoDTO[] {
    return this.lugares;
  }
}
