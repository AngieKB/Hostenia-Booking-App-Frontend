import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calificar-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calificar-modal.html',
  styleUrl: './calificar-modal.css',
})
export class CalificarModal {
  @Output() close = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<{ calificacion: number; comentario: string }>();

  calificacion: number = 0;
  comentario: string = '';

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.calificacion > 0 && this.comentario.trim()) {
      this.guardar.emit({
        calificacion: this.calificacion,
        comentario: this.comentario
      });
      this.calificacion = 0;
      this.comentario = '';
    }
  }

  setCalificacion(valor: number): void {
    this.calificacion = valor;
  }
}
