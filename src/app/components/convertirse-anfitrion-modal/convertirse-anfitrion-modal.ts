import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-convertirse-anfitrion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './convertirse-anfitrion-modal.html',
  styleUrls: ['./convertirse-anfitrion-modal.css']
})
export class ConvertirseAnfitrionModal {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ descripcion: string; documentosLegales: string[] }>();

  descripcion: string = '';
  documentosLegales: string[] = [];
  nuevoDocumento: string = '';
  mensajeError: string = '';

  agregarDocumento(): void {
    if (this.nuevoDocumento.trim()) {
      this.documentosLegales.push(this.nuevoDocumento.trim());
      this.nuevoDocumento = '';
    }
  }

  eliminarDocumento(index: number): void {
    this.documentosLegales.splice(index, 1);
  }

  onSubmit(): void {
    this.mensajeError = '';

    if (!this.descripcion.trim()) {
      this.mensajeError = 'La descripción es obligatoria';
      return;
    }

    if (this.descripcion.length > 300) {
      this.mensajeError = 'La descripción no puede exceder 300 caracteres';
      return;
    }

    if (this.documentosLegales.length === 0) {
      this.mensajeError = 'Debe agregar al menos un documento legal';
      return;
    }

    this.save.emit({
      descripcion: this.descripcion,
      documentosLegales: this.documentosLegales
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
