import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EmptyHeader, Footer],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio {

  // FormGroups reactivos
  registroForm!: FormGroup;
  loginForm!: FormGroup;
  recuperarForm!: FormGroup;

  // Archivo de foto de perfil
  fotoPerfilFile: File | null = null;

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
    private tokenService: TokenService,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  // Inicializar los formularios reactivos
  initForms(): void {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).*$/)
      ]],
      telefono: ['', [Validators.required, Validators.maxLength(10)]],
      fechaNacimiento: ['', [Validators.required]]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.recuperarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      codigo: ['', [Validators.required]],
      nuevaPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).*$/)
      ]]
    });
  }

  // Helpers para acceder a los controles del formulario de registro
  get nombreControl() { return this.registroForm.get('nombre'); }
  get emailControl() { return this.registroForm.get('email'); }
  get passwordControl() { return this.registroForm.get('password'); }
  get telefonoControl() { return this.registroForm.get('telefono'); }
  get fechaNacimientoControl() { return this.registroForm.get('fechaNacimiento'); }

  // Helpers para acceder a los controles del formulario de login
  get loginEmailControl() { return this.loginForm.get('email'); }
  get loginPasswordControl() { return this.loginForm.get('password'); }

  // Helpers para acceder a los controles del formulario de recuperación
  get recuperarEmailControl() { return this.recuperarForm.get('email'); }
  get codigoControl() { return this.recuperarForm.get('codigo'); }
  get nuevaPasswordControl() { return this.recuperarForm.get('nuevaPassword'); }

  // Método para manejar la selección de archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoPerfilFile = file;
      console.log('Archivo seleccionado:', file.name);
    }
  }

  // Método para registrar usuario
  registrar() {
    if (this.registroForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos correctamente',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.registrando = true;

    const usuarioDTO = {
      ...this.registroForm.value,
      fotoUrl: this.fotoPerfilFile || undefined
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
          this.registroForm.reset();
          this.fotoPerfilFile = null;
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
    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos correctamente',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.iniciandoSesion = true;

    this.authService.login(this.loginForm.value)
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
    this.recuperarForm.reset();
  }

  // Método para enviar código de verificación
  enviarCodigo() {
    const emailControl = this.recuperarForm.get('email');
    if (!emailControl?.value || emailControl.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Por favor ingrese un correo electrónico válido',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.enviandoCodigo = true;

    this.authService.sendVerificationCode({ email: emailControl.value })
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
    const codigoControl = this.recuperarForm.get('codigo');
    const passwordControl = this.recuperarForm.get('nuevaPassword');
    
    if (!codigoControl?.value || !passwordControl?.value || passwordControl.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos correctamente',
        confirmButtonColor: '#4CB0A6'
      });
      return;
    }

    this.enviandoPassword = true;

    const resetData = {
      email: this.recuperarForm.get('email')?.value,
      verificationCode: codigoControl.value,
      newPassword: passwordControl.value
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