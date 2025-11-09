import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { EmptyHeader } from '../../components/empty-header/empty-header';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyHeader, Footer],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio {
  // Variables para el formulario de registro
  registroData = {
    nombre: '',
    email: '',
    rol: '',
    password: '',
    telefono: '',
    fechaNacimiento: ''
  };

  // Variables para el formulario de login
  loginData = {
    email: '',
    password: ''
  };

  // Variables para recuperar contraseña
  recuperarData = {
    codigo: '',
    nuevaPassword: ''
  };

  // Control del modal
  showModal = false;

  // Método para seleccionar el rol
  seleccionarRol(rol: string) {
    this.registroData.rol = rol;
  }

  // Método para registrar usuario
  registrar() {
    console.log('Datos de registro:', this.registroData);
    // Aquí implementarías la lógica de registro con tu backend
  }

  // Método para iniciar sesión
  iniciarSesion() {
    console.log('Datos de login:', this.loginData);
    // Aquí implementarías la lógica de login con tu backend
  }

  // Método para abrir modal de recuperación
  abrirModalRecuperar() {
    this.showModal = true;
  }

  // Método para cerrar modal
  cerrarModal() {
    this.showModal = false;
    this.recuperarData = {
      codigo: '',
      nuevaPassword: ''
    };
  }

  // Método para reenviar código
  reenviarCodigo() {
    console.log('Reenviando código...');
    // Aquí implementarías la lógica para reenviar el código
  }

  // Método para establecer nueva contraseña
  establecerPassword() {
    console.log('Nueva contraseña:', this.recuperarData);
    // Aquí implementarías la lógica para cambiar la contraseña
    this.cerrarModal();
  }
}