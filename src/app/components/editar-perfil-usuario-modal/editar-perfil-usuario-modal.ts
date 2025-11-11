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
  @Output() save = new EventEmitter<{ nombre: string; telefono: string; fotoUrl?: File }>();

  nombre: string = '';
  telefono: string = '';
  selectedFile: File | null = null;
  previewUrl: string = '';

  ngOnInit(): void {
    // Copiar los datos del usuario para editar
    if (this.userData) {
      this.nombre = this.userData.nombre;
      this.telefono = this.userData.telefono;
      this.previewUrl = this.userData.fotoUrl || '';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    const data: { nombre: string; telefono: string; fotoUrl?: File } = {
      nombre: this.nombre,
      telefono: this.telefono
    };
    
    if (this.selectedFile) {
      data.fotoUrl = this.selectedFile;
    }
    
    this.save.emit(data);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
