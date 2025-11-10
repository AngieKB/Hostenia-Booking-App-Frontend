import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agregar-alojamiento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-alojamiento-modal.html',
  styleUrl: './agregar-alojamiento-modal.css',
})
export class AgregarAlojamientoModal {
  @Output() close = new EventEmitter<void>();
  @Output() agregar = new EventEmitter<any>();

  // Form data
  nombre: string = '';
  precioNoche: number = 0;
  descripcion: string = '';
  cocina: string = '';
  wifi: string = '';
  piscina: string = '';
  permiteMascotas: string = '';
  capacidadMaxima: number = 0;
  ciudad: string = '';
  direccion: string = '';
  latitud: number = 0;
  longitud: number = 0;
  imagenes: File[] = [];

  onClose(): void {
    this.close.emit();
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.imagenes = Array.from(files as FileList).slice(0, 10) as File[];
    }
  }

  onSubmit(): void {
    const servicios: string[] = [];
    if (this.cocina === 'Si') servicios.push('Cocina');
    if (this.wifi === 'Si') servicios.push('WiFi');
    if (this.piscina === 'Si') servicios.push('Piscina');
    if (this.permiteMascotas === 'Si') servicios.push('Permite Mascotas');

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

    this.agregar.emit(data);
  }
}
