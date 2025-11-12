import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainHeaderHost } from '../../components/main-header-host/main-header-host';
import { Footer } from '../../components/footer/footer';
import { AlojamientoDTO } from '../../models/alojamiento';
import { MetricasDTO } from '../../models/metricas-dto';
import { AlojamientoService } from '../../services/alojamiento.service';
import { MetricasService } from '../../services/metricas.service';
import { PerfilAnfitrionService } from '../../services/perfil-anfitrion.service';
import { TokenService } from '../../services/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-metricas-host',
  standalone: true,
  imports: [CommonModule, FormsModule, MainHeaderHost, Footer],
  templateUrl: './ver-metricas-host.html',
  styleUrl: './ver-metricas-host.css',
})
export class VerMetricasHost implements OnInit {
  alojamientos: AlojamientoDTO[] = [];
  metricasPorAlojamiento: { [key: number]: MetricasDTO } = {};
  cargando: boolean = false;
  cargandoMetricas: boolean = false;

  // Filtros de fecha
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(
    private alojamientoService: AlojamientoService,
    private metricasService: MetricasService,
    private perfilAnfitrionService: PerfilAnfitrionService,
    private tokenService: TokenService
  ) {
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    this.fechaFin = this.formatearFechaParaInput(hoy);
    this.fechaInicio = this.formatearFechaParaInput(haceUnMes);
  }

  ngOnInit(): void {
    this.cargarAlojamientos();
  }

  private cargarAlojamientos(): void {
    this.cargando = true;
    const userId = this.tokenService.getUserId();
    
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener tu información de usuario. Por favor, vuelve a iniciar sesión.',
        confirmButtonColor: '#4CB0A6'
      });
      this.cargando = false;
      return;
    }
    
    // Obtener perfil de anfitrión y luego los alojamientos
    this.perfilAnfitrionService.listarPerfiles().subscribe({
      next: (perfiles: any) => {
        const perfil = perfiles.find((p: any) => p.usuarioId === userId);
        
        if (!perfil || !perfil.id) {
          Swal.fire({
            icon: 'warning',
            title: 'Perfil no encontrado',
            text: 'No tienes un perfil de anfitrión creado.',
            confirmButtonColor: '#4CB0A6'
          });
          this.cargando = false;
          return;
        }
        
        const anfitrionId = perfil.id;
        
        // Cargar alojamientos del anfitrión
        this.alojamientoService.listarPorAnfitrion(anfitrionId, 0, 100).subscribe({
          next: (page: any) => {
            // Solo alojamientos activos
            this.alojamientos = page.content.filter((a: any) => a.estado === 'ACTIVO');
            this.cargando = false;
            
            // Cargar métricas para cada alojamiento
            this.cargarTodasLasMetricas();
          },
          error: (error: any) => {
            console.error('Error al cargar alojamientos:', error);
            this.cargando = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudieron cargar los alojamientos',
              confirmButtonColor: '#4CB0A6'
            });
          }
        });
      },
      error: (error: any) => {
        console.error('Error al cargar perfil:', error);
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar tu perfil de anfitrión',
          confirmButtonColor: '#4CB0A6'
        });
      }
    });
  }

  private cargarTodasLasMetricas(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas requeridas',
        text: 'Por favor selecciona las fechas de inicio y fin',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.cargandoMetricas = true;
    this.metricasPorAlojamiento = {};

    const fechaInicioISO = this.convertirFechaParaBackend(this.fechaInicio);
    const fechaFinISO = this.convertirFechaParaBackend(this.fechaFin);

    // Cargar métricas para cada alojamiento
    const promesas = this.alojamientos.map(alojamiento => 
      this.metricasService.obtenerMetricas(alojamiento.id, fechaInicioISO, fechaFinISO)
        .toPromise()
        .then(metricas => {
          if (metricas) {
            this.metricasPorAlojamiento[alojamiento.id] = metricas;
          }
        })
        .catch(error => {
          console.error(`Error al cargar métricas para alojamiento ${alojamiento.id}:`, error);
          // Métricas por defecto en caso de error
          this.metricasPorAlojamiento[alojamiento.id] = {
            promedioCalificaciones: 0,
            totalReservas: 0
          };
        })
    );

    Promise.all(promesas).finally(() => {
      this.cargandoMetricas = false;
    });
  }

  // Aplicar filtros de fecha
  aplicarFiltros(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas requeridas',
        text: 'Por favor selecciona ambas fechas',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    if (new Date(this.fechaInicio) > new Date(this.fechaFin)) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'La fecha de inicio debe ser anterior a la fecha de fin',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.cargarTodasLasMetricas();
  }

  // Obtener métricas de un alojamiento específico
  obtenerMetricas(alojamientoId: number): MetricasDTO {
    return this.metricasPorAlojamiento[alojamientoId] || {
      promedioCalificaciones: 0,
      totalReservas: 0
    };
  }

  // Formatear fecha para input date
  private formatearFechaParaInput(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  // Convertir fecha para el backend (LocalDateTime)
  private convertirFechaParaBackend(fecha: string): string {
    return `${fecha}T00:00:00`;
  }

  // Formatear calificación
  formatearCalificacion(calificacion: number): string {
    if (calificacion === 0) return 'Sin calificaciones';
    return calificacion.toFixed(1);
  }

  // Formatear número de reservas
  formatearReservas(reservas: number): string {
    if (reservas === 0) return 'Sin reservas';
    if (reservas === 1) return '1 reserva';
    return `${reservas} reservas`;
  }
}
