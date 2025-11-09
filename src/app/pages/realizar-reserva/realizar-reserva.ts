import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './realizar-reserva.html',
  styleUrls: ['./realizar-reserva.css']
})
export class RealizarReserva implements OnInit {
  // Datos del anfitrión (ejemplo)
  anfitrion = {
    nombre: 'Nombre',
    apellido: 'Anfitrión'
  };

  // Datos de la reserva
  reserva = {
    fechaCheckIn: '',
    fechaCheckOut: '',
    numeroHuespedes: 1
  };

  // Control de calendarios
  mesCheckIn: Date = new Date();
  mesCheckOut: Date = new Date();
  
  diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Fechas seleccionadas
  fechaSeleccionadaCheckIn: Date | null = null;
  fechaSeleccionadaCheckOut: Date | null = null;

  ngOnInit() {
    // Establecer fecha de check-out un mes después
    this.mesCheckOut = new Date(this.mesCheckIn);
    this.mesCheckOut.setMonth(this.mesCheckOut.getMonth() + 1);
  }

  // Obtener días del mes para el calendario
  getDiasDelMes(fecha: Date): (number | null)[] {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    
    const dias: (number | null)[] = [];
    
    // Agregar espacios vacíos al inicio
    for (let i = 0; i < primerDia.getDay(); i++) {
      dias.push(null);
    }
    
    // Agregar días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(dia);
    }
    
    return dias;
  }

  // Cambiar mes
  cambiarMes(calendario: 'checkIn' | 'checkOut', direccion: number) {
    if (calendario === 'checkIn') {
      this.mesCheckIn = new Date(this.mesCheckIn.setMonth(this.mesCheckIn.getMonth() + direccion));
    } else {
      this.mesCheckOut = new Date(this.mesCheckOut.setMonth(this.mesCheckOut.getMonth() + direccion));
    }
  }

  // Cambiar año
  cambiarAnio(calendario: 'checkIn' | 'checkOut', direccion: number) {
    if (calendario === 'checkIn') {
      this.mesCheckIn = new Date(this.mesCheckIn.setFullYear(this.mesCheckIn.getFullYear() + direccion));
    } else {
      this.mesCheckOut = new Date(this.mesCheckOut.setFullYear(this.mesCheckOut.getFullYear() + direccion));
    }
  }

  // Seleccionar fecha
  seleccionarFecha(dia: number, calendario: 'checkIn' | 'checkOut') {
    if (calendario === 'checkIn') {
      this.fechaSeleccionadaCheckIn = new Date(
        this.mesCheckIn.getFullYear(),
        this.mesCheckIn.getMonth(),
        dia
      );
      this.reserva.fechaCheckIn = this.formatearFecha(this.fechaSeleccionadaCheckIn);
    } else {
      this.fechaSeleccionadaCheckOut = new Date(
        this.mesCheckOut.getFullYear(),
        this.mesCheckOut.getMonth(),
        dia
      );
      this.reserva.fechaCheckOut = this.formatearFecha(this.fechaSeleccionadaCheckOut);
    }
  }

  // Verificar si un día está seleccionado
  esDiaSeleccionado(dia: number, calendario: 'checkIn' | 'checkOut'): boolean {
    if (calendario === 'checkIn' && this.fechaSeleccionadaCheckIn) {
      return this.fechaSeleccionadaCheckIn.getDate() === dia &&
             this.fechaSeleccionadaCheckIn.getMonth() === this.mesCheckIn.getMonth() &&
             this.fechaSeleccionadaCheckIn.getFullYear() === this.mesCheckIn.getFullYear();
    } else if (calendario === 'checkOut' && this.fechaSeleccionadaCheckOut) {
      return this.fechaSeleccionadaCheckOut.getDate() === dia &&
             this.fechaSeleccionadaCheckOut.getMonth() === this.mesCheckOut.getMonth() &&
             this.fechaSeleccionadaCheckOut.getFullYear() === this.mesCheckOut.getFullYear();
    }
    return false;
  }

  // Formatear fecha para input
  formatearFecha(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  // Obtener nombre del mes
  getNombreMes(fecha: Date): string {
    return this.meses[fecha.getMonth()];
  }

  // Dividir días en semanas
  dividirEnSemanas(dias: (number | null)[]): (number | null)[][] {
    const semanas: (number | null)[][] = [];
    for (let i = 0; i < dias.length; i += 7) {
      semanas.push(dias.slice(i, i + 7));
    }
    return semanas;
  }

  // Realizar reserva
  realizarReserva() {
    if (!this.reserva.fechaCheckIn || !this.reserva.fechaCheckOut) {
      alert('Por favor selecciona las fechas de check-in y check-out');
      return;
    }

    if (this.reserva.numeroHuespedes < 1) {
      alert('Por favor indica el número de huéspedes');
      return;
    }

    console.log('Reserva realizada:', this.reserva);
    // Aquí implementarías la lógica para enviar la reserva al backend
    alert('¡Reserva realizada con éxito!');
  }

  // Cerrar modal
  cerrarModal() {
    // Implementar lógica para cerrar el modal
    console.log('Cerrar modal');
  }
}