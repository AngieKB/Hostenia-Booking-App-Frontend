import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDTO } from '../../models/user-dto';
import { PerfilAnfitrionDTO } from '../../models/perfil-anfitrion-dto';

@Component({
  selector: 'app-editar-perfil-anfitrion-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil-anfitrion-modal.html',
  styleUrl: './editar-perfil-anfitrion-modal.css',
})
export class EditarPerfilAnfitrionModal implements OnInit {
  @Input() userData!: UserDTO;
  @Input() perfilAnfitrion!: PerfilAnfitrionDTO;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ user: UserDTO; perfil: PerfilAnfitrionDTO }>();

  editedUser: UserDTO = {
    nombre: '',
    telefono: '',
    email: '',
    rol: 'PROPIETARIO' as any,
    fotoUrl: ''
  };

  editedPerfil: PerfilAnfitrionDTO = {
    usuarioId: 0,
    descripcion: '',
    documentosLegales: [],
    alojamientos: []
  };

  ngOnInit(): void {
    // Copiar los datos del usuario y perfil para editar
    if (this.userData) {
      this.editedUser = { ...this.userData };
    }
    if (this.perfilAnfitrion) {
      this.editedPerfil = { ...this.perfilAnfitrion };
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.save.emit({
      user: this.editedUser,
      perfil: this.editedPerfil
    });
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
