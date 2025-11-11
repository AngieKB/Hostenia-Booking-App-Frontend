import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { EmptyHeader } from '../../components/empty-header/empty-header';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';


@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule, EmptyHeader, Footer],
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
  mensajeError = '';
  mensajeExito = '';
  
  // Estados de carga
  registrando = false;
  iniciandoSesion = false;
  mensajeErrorRegistro = '';
  mensajeErrorLogin = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService
  ) {}

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
      this.mensajeErrorRegistro = 'Por favor complete todos los campos';
      return;
    }

    this.registrando = true;
    this.mensajeErrorRegistro = '';

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
          alert('Registro exitoso. Ya puede iniciar sesión.');
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
          
          // Intentar obtener el mensaje de error del backend
          let mensajeError = 'Error al registrar usuario. Intente nuevamente.';
          
          if (error.error?.content) {
            mensajeError = error.error.content;
          } else if (error.error?.message) {
            mensajeError = error.error.message;
          } else if (typeof error.error === 'string') {
            mensajeError = error.error;
          }
          
          this.mensajeErrorRegistro = mensajeError;
          this.registrando = false;
        }
      });
  }

  // Método para iniciar sesión
  iniciarSesion() {
    if (!this.loginData.email || !this.loginData.password) {
      this.mensajeErrorLogin = 'Por favor complete todos los campos';
      return;
    }

    this.iniciandoSesion = true;
    this.mensajeErrorLogin = '';

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
          this.mensajeErrorLogin = error.error?.content || 'Credenciales incorrectas. Intente nuevamente.';
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
    this.mensajeError = '';
    this.mensajeExito = '';
    this.recuperarData = {
      email: '',
      codigo: '',
      nuevaPassword: ''
    };
  }

  // Método para enviar código de verificación
  enviarCodigo() {
    if (!this.recuperarData.email) {
      this.mensajeError = 'Por favor ingrese su correo electrónico';
      return;
    }

    this.enviandoCodigo = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.authService.sendVerificationCode({ email: this.recuperarData.email })
      .subscribe({
        next: (response) => {
          this.codigoEnviado = true;
          this.mensajeExito = 'Código enviado exitosamente a su correo electrónico';
          this.enviandoCodigo = false;
        },
        error: (error) => {
          this.mensajeError = error.error?.content || 'Error al enviar el código. Verifique su correo electrónico.';
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
      this.mensajeError = 'Por favor complete todos los campos';
      return;
    }

    this.enviandoPassword = true;
    this.mensajeError = '';

    const resetData = {
      email: this.recuperarData.email,
      verificationCode: this.recuperarData.codigo,
      newPassword: this.recuperarData.nuevaPassword
    };

    this.authService.resetPassword(resetData)
      .subscribe({
        next: (response) => {
          this.mensajeExito = 'Contraseña cambiada exitosamente';
          this.enviandoPassword = false;
          setTimeout(() => {
            this.cerrarModal();
          }, 2000);
        },
        error: (error) => {
          this.mensajeError = error.error?.content || 'Error al cambiar la contraseña. Verifique el código.';
          this.enviandoPassword = false;
        }
      });
  }
}