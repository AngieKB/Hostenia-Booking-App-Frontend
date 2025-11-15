import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlojamientoDTO } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';
import { ReservaService } from '../../services/reserva.service';
import { RealizarReservaDTO } from '../../models/reserva-dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './realizar-reserva.html',
  styleUrls: ['./realizar-reserva.css']
})
export class RealizarReserva implements OnInit {
  // Información del alojamiento
  alojamiento: AlojamientoDTO | null = null;
  cargando: boolean = false;
  
  // Datos de la reserva
  reserva = {
    fechaCheckIn: '',
    fechaCheckOut: '',
    horaCheckIn: '15:00', // Hora estándar de check-in
    horaCheckOut: '11:00', // Hora estándar de check-out
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alojamientoService: AlojamientoService,
    private reservaService: ReservaService
  ) {}

  ngOnInit() {
    // Establecer fecha de check-out un mes después
    this.mesCheckOut = new Date(this.mesCheckIn);
    this.mesCheckOut.setMonth(this.mesCheckOut.getMonth() + 1);
    
    // Obtener ID del alojamiento desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarAlojamiento(Number(id));
    } else {
      this.router.navigate(['/principal']);
    }
  }

  private cargarAlojamiento(id: number): void {
    this.cargando = true;
    this.alojamientoService.obtenerPorId(id).subscribe({
      next: (alojamiento) => {
        this.alojamiento = alojamiento;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar alojamiento:', error);
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el alojamiento',
          confirmButtonColor: '#4CB0A6'
        }).then(() => {
          this.router.navigate(['/principal']);
        });
      }
    });
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

  // Formatear precio
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // Calcular número de días entre fechas
  calcularDias(): number {
    if (!this.fechaSeleccionadaCheckIn || !this.fechaSeleccionadaCheckOut) {
      return 0;
    }
    
    const fechaInicio = new Date(this.fechaSeleccionadaCheckIn);
    const fechaFin = new Date(this.fechaSeleccionadaCheckOut);
    
    // Calcular diferencia en milisegundos y convertir a días
    const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    
    return diferenciaDias > 0 ? diferenciaDias : 0;
  }

  // Calcular precio total de la reserva
  calcularPrecioTotal(): number {
    if (!this.alojamiento) return 0;
    
    const dias = this.calcularDias();
    const precioTotal = dias * this.alojamiento.precioNoche * this.reserva.numeroHuespedes;
    return precioTotal;
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
    if (!this.fechaSeleccionadaCheckIn || !this.fechaSeleccionadaCheckOut) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas requeridas',
        text: 'Por favor selecciona las fechas de check-in y check-out',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    if (this.reserva.numeroHuespedes < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Huéspedes requeridos',
        text: 'Por favor indica el número de huéspedes',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    if (!this.alojamiento) return;

    const dias = this.calcularDias();
    const precioTotal = this.calcularPrecioTotal();

    // Mostrar alerta de confirmación con el precio total
    Swal.fire({
      title: 'Confirmar Reserva',
      html: `
        <div style="text-align: left;">
          <p><strong>Alojamiento:</strong> ${this.alojamiento.titulo}</p>
          <p><strong>Check-in:</strong> ${this.reserva.fechaCheckIn} a las ${this.reserva.horaCheckIn}</p>
          <p><strong>Check-out:</strong> ${this.reserva.fechaCheckOut} a las ${this.reserva.horaCheckOut}</p>
          <p><strong>Número de noches:</strong> ${dias}</p>
          <p><strong>Huéspedes:</strong> ${this.reserva.numeroHuespedes}</p>
          <p><strong>Precio por noche:</strong> ${this.formatearPrecio(this.alojamiento.precioNoche)}</p>
          <hr>
          <p><strong>Precio total:</strong> ${this.formatearPrecio(precioTotal)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4CB0A6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirmar Reserva',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.enviarReserva();
      }
    });
  }

  // Enviar reserva al backend
  private enviarReserva() {
    if (!this.alojamiento || !this.fechaSeleccionadaCheckIn || !this.fechaSeleccionadaCheckOut) return;

    const reservaDTO: RealizarReservaDTO = {
      alojamientoId: this.alojamiento.id,
      fechaCheckIn: this.convertirFechaHoraParaBackend(this.fechaSeleccionadaCheckIn, this.reserva.horaCheckIn),
      fechaCheckOut: this.convertirFechaHoraParaBackend(this.fechaSeleccionadaCheckOut, this.reserva.horaCheckOut),
      cantidadHuespedes: this.reserva.numeroHuespedes
    };

    // Mostrar loading
    Swal.fire({
      title: 'Procesando reserva...',
      text: 'Por favor espera mientras procesamos tu reserva',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.reservaService.crear(reservaDTO).subscribe({
      next: (mensaje: string) => {
        Swal.fire({
          icon: 'success',
          title: '¡Reserva exitosa!',
          text: mensaje,
          confirmButtonColor: '#4CB0A6'
        }).then(() => {
          // Navegar a mis reservas
          this.router.navigate(['/reservas']);
        });
      },
      error: (error: any) => {
        console.error('Error al realizar reserva:', error);
        let mensajeError = 'No se pudo realizar la reserva';
        
        if (error.error?.content) {
          mensajeError = error.error.content;
        } else if (error.error?.message) {
          mensajeError = error.error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensajeError,
          confirmButtonColor: '#4CB0A6'
        });
      }
    });
  }

  // Convertir fecha y hora para el formato del backend (LocalDateTime)
  private convertirFechaHoraParaBackend(fecha: Date, hora: string): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}T${hora}:00`;
  }

  // Volver a detalles del alojamiento
  volver() {
    if (this.alojamiento) {
      this.router.navigate(['/detalles-alojamiento', this.alojamiento.id]);
    } else {
      this.router.navigate(['/principal']);
    }
  }
}