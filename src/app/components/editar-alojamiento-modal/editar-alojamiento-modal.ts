import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlojamientoDTO } from '../../models/alojamiento';

@Component({
  selector: 'app-editar-alojamiento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-alojamiento-modal.html',
  styleUrl: './editar-alojamiento-modal.css',
})
export class EditarAlojamientoModal implements OnInit {
  @Input() alojamiento: AlojamientoDTO | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();

  // Form data
  nombre: string = '';
  precioNoche: number = 0;
  descripcion: string = '';
  cocina: boolean = false;
  wifi: boolean = false;
  piscina: boolean = false;
  permiteMascotas: boolean = false;
  capacidadMaxima: number = 0;
  ciudad: string = '';
  direccion: string = '';
  latitud: number = 0;
  longitud: number = 0;
  imagenes: File[] = [];

  ngOnInit(): void {
    if (this.alojamiento) {
      this.nombre = this.alojamiento.titulo;
      this.precioNoche = this.alojamiento.precioNoche;
      this.descripcion = this.alojamiento.descripcion;
      this.capacidadMaxima = this.alojamiento.capacidadMax;
      this.ciudad = this.alojamiento.ubicacion.ciudad;
      this.direccion = this.alojamiento.ubicacion.direccion;
      this.latitud = this.alojamiento.ubicacion.latitud;
      this.longitud = this.alojamiento.ubicacion.longitud;
      
      // Servicios - convertir a booleanos
      this.cocina = this.alojamiento.servicios.includes('Cocina');
      this.wifi = this.alojamiento.servicios.includes('WiFi');
      this.piscina = this.alojamiento.servicios.includes('Piscina');
      this.permiteMascotas = this.alojamiento.servicios.includes('Mascotas');
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.imagenes = Array.from(files as FileList).slice(0, 10) as File[]; // Máximo 10 imágenes
    }
  }

  onSubmit(): void {
    const servicios: string[] = [];
    if (this.cocina) servicios.push('Cocina');
    if (this.wifi) servicios.push('WiFi');
    if (this.piscina) servicios.push('Piscina');
    if (this.permiteMascotas) servicios.push('Mascotas');

    const data = {
      nombre: this.nombre,
      precioNoche: this.precioNoche,
      descripcion: this.descripcion,
      servicios,
      capacidadMaxima: this.capacidadMaxima,
      ciudad: this.ciudad,
      direccion: this.direccion,
      latitud: this.latitud,
      longitud: this.longitud,
      imagenes: this.imagenes
    };

    this.guardar.emit(data);
  }
}
