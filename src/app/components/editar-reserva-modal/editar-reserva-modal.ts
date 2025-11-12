import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReservaService } from '../../services/reserva.service';
import { EditarReservaDTO } from '../../models/reserva-dto';


@Component({
  selector: 'app-editar-reserva-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-reserva-modal.html',
  styleUrl: './editar-reserva-modal.css',
})
export class EditarReservaModal implements OnInit{
  @Input() reserva: EditarReservaDTO | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() guardar = new EventEmitter<any>();

    // Form data
  fechaCheckIn: string = '';
  fechaCheckOut: string = '';
  cantidadHuespedes: number = 0;
  

  ngOnInit(): void {
    if (this.reserva) {
      this.fechaCheckIn = this.reserva.fechaCheckIn;
      this.fechaCheckOut = this.reserva.fechaCheckOut;
      this.cantidadHuespedes = this.reserva.cantidadHuespedes;
    }
  }


  onClose(): void {
    this.close.emit();
  }
  
  

  onSubmit(): void {
  // Validar que haya fechas seleccionadas
  if (!this.fechaCheckIn || !this.fechaCheckOut) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Debes seleccionar las fechas de check-in y check-out.',
    });
    return;
  }

  // Validar mínimo 1 noche
  const checkIn = new Date(this.fechaCheckIn);
  const checkOut = new Date(this.fechaCheckOut);
  const diff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) {
    Swal.fire({
      icon: 'warning',
      title: 'Reserva inválida',
      text: 'La reserva debe ser de al menos 1 noche.',
    });
    return;
  }

  // Validar cantidad de huéspedes
  if (this.cantidadHuespedes < 1) {
    Swal.fire({
      icon: 'warning',
      title: 'Cantidad inválida',
      text: 'Debe haber al menos un huésped.',
    });
    return;
  }

  // Si pasa las validaciones, emitir los datos
  const data = {
    fechaCheckIn: `${this.fechaCheckIn}T00:00:00`,
    fechaCheckOut: `${this.fechaCheckOut}T00:00:00`,
    cantidadHuespedes: this.cantidadHuespedes,
  };

  this.guardar.emit(data);
}

}
