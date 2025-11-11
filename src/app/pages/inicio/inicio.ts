import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { EmptyHeader } from '../../components/empty-header/empty-header';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EmptyHeader, Footer],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio {

  // Variables para el formulario de registro
  registroData = {
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    fechaNacimiento: '',
    fotoUrl: null as File | null
  };

  // Variables para el formulario de login
  loginData = {
    email: '',
    password: ''
  };

  // Variables para recuperar contraseña
  recuperarData = {
    email: '',
    codigo: '',
    nuevaPassword: ''
  };

  // Control del modal
  showModal = false;
  codigoEnviado = false;
  enviandoCodigo = false;
  enviandoPassword = false;

  // Estados de carga
  registrando = false;
  iniciandoSesion = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService
  ) { }

  // Método para manejar la selección de archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registroData.fotoUrl = file;
      console.log('Archivo seleccionado:', file.name);
    }
  }

  // Método para registrar usuario
  registrar() {
    if (!this.registroData.nombre || !this.registroData.email || !this.registroData.password ||
      !this.registroData.telefono || !this.registroData.fechaNacimiento) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.registrando = true;

    const usuarioDTO = {
      nombre: this.registroData.nombre,
      email: this.registroData.email,
      telefono: this.registroData.telefono,
      password: this.registroData.password,
      fechaNacimiento: this.registroData.fechaNacimiento,
      fotoUrl: this.registroData.fotoUrl || undefined
    };

    console.log('Datos a enviar:', usuarioDTO);

    this.authService.register(usuarioDTO)
      .subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'Ya puede iniciar sesión',
            confirmButtonColor: '#4CB0A6'
          });
          // Limpiar formulario
          this.registroData = {
            nombre: '',
            email: '',
            password: '',
            telefono: '',
            fechaNacimiento: '',
            fotoUrl: null
          };
          this.registrando = false;
        },
        error: (error) => {
          console.error('Error en registro:', error);
          console.error('Detalles del error:', error.error);

          // Manejar errores de validación del backend
          let mensajeError = 'Error al registrar usuario. Intente nuevamente.';

          if (error.error?.content && Array.isArray(error.error.content)) {
            // Si es un array de errores de validación
            mensajeError = error.error.content.map((err: any) => err.message).join('\n');
          } else if (error.error?.content) {
            mensajeError = error.error.content;
          } else if (error.error?.message) {
            mensajeError = error.error.message;
          } else if (typeof error.error === 'string') {
            mensajeError = error.error;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error en el registro',
            text: mensajeError,
            confirmButtonColor: '#4CB0A6'
          });
          this.registrando = false;
        }
      });
  }

  // Método para iniciar sesión
  iniciarSesion() {
    if (!this.loginData.email || !this.loginData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.iniciandoSesion = true;

    this.authService.login(this.loginData)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          // Guardar token
          this.authService.saveToken(response.content.token);
          this.iniciandoSesion = false;

          // Redirigir según el rol del usuario
          const role = this.tokenService.getRole();
          if (role === 'ANFITRION') {
            this.router.navigate(['/mis-alojamientos-host']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          console.error('Detalles del error:', error.error);

          // Manejar errores de validación del backend
          let mensajeError = 'Credenciales incorrectas. Intente nuevamente.';

          if (error.error?.content && Array.isArray(error.error.content)) {
            // Si es un array de errores de validación
            mensajeError = error.error.content.map((err: any) => err.message).join('\n');
          } else if (error.error?.content) {
            mensajeError = error.error.content;
          } else if (error.error?.message) {
            mensajeError = error.error.message;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error al iniciar sesión',
            text: mensajeError,
            confirmButtonColor: '#4CB0A6'
          });
          this.iniciandoSesion = false;
        }
      });
  }

  // Método para abrir modal de recuperación
  abrirModalRecuperar() {
    this.showModal = true;
  }

  // Método para cerrar modal
  cerrarModal() {
    this.showModal = false;
    this.codigoEnviado = false;
    this.recuperarData = {
      email: '',
      codigo: '',
      nuevaPassword: ''
    };
  }

  // Método para enviar código de verificación
  enviarCodigo() {
    if (!this.recuperarData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingrese su correo electrónico',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.enviandoCodigo = true;

    this.authService.sendVerificationCode({ email: this.recuperarData.email })
      .subscribe({
        next: (response) => {
          this.codigoEnviado = true;
          Swal.fire({
            icon: 'success',
            title: 'Código enviado',
            text: 'Código enviado exitosamente a su correo electrónico',
            confirmButtonColor: '#4CB0A6',
            timer: 3000
          });
          this.enviandoCodigo = false;
        },
        error: (error) => {
          let mensajeError = 'Error al enviar el código. Verifique su correo electrónico.';

          if (error.error?.content && Array.isArray(error.error.content)) {
            mensajeError = error.error.content.map((err: any) => err.message).join('\n');
          } else if (error.error?.content) {
            mensajeError = error.error.content;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensajeError,
            confirmButtonColor: '#4CB0A6'
          });
          this.enviandoCodigo = false;
        }
      });
  }

  // Método para reenviar código
  reenviarCodigo() {
    this.enviarCodigo();
  }

  // Método para establecer nueva contraseña
  establecerPassword() {
    if (!this.recuperarData.codigo || !this.recuperarData.nuevaPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.enviandoPassword = true;

    const resetData = {
      email: this.recuperarData.email,
      verificationCode: this.recuperarData.codigo,
      newPassword: this.recuperarData.nuevaPassword
    };

    this.authService.resetPassword(resetData)
      .subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña cambiada',
            text: 'Contraseña cambiada exitosamente',
            confirmButtonColor: '#4CB0A6',
            timer: 2000
          });
          this.enviandoPassword = false;
          setTimeout(() => {
            this.cerrarModal();
          }, 2000);
        },
        error: (error) => {
          let mensajeError = 'Error al cambiar la contraseña. Verifique el código.';

          if (error.error?.content && Array.isArray(error.error.content)) {
            mensajeError = error.error.content.map((err: any) => err.message).join('\n');
          } else if (error.error?.content) {
            mensajeError = error.error.content;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensajeError,
            confirmButtonColor: '#4CB0A6'
          });
          this.enviandoPassword = false;
        }
      });
  }
}