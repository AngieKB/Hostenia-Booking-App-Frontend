import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDTO } from '../../models/user-dto';

@Component({
  selector: 'app-editar-perfil-usuario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil-usuario-modal.html',
  styleUrl: './editar-perfil-usuario-modal.css',
})
export class EditarPerfilUsuarioModal implements OnInit {
  @Input() userData!: UserDTO;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UserDTO>();

  editedUser: UserDTO = {
    nombre: '',
    telefono: '',
    email: '',
    rol: 'USUARIO' as any,
    fotoUrl: ''
  };

  ngOnInit(): void {
    // Copiar los datos del usuario para editar
    if (this.userData) {
      this.editedUser = { ...this.userData };
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.save.emit(this.editedUser);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Aquí puedes implementar la lógica para subir la imagen
      console.log('Archivo seleccionado:', file);
      // Por ahora, solo simularemos una URL
      this.editedUser.fotoUrl = URL.createObjectURL(file);
    }
  }
}
