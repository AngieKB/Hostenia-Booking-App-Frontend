import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cambiar-contrasena-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-contrasena-modal.html',
  styleUrl: './cambiar-contrasena-modal.css',
})
export class CambiarContrasenaModal {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ oldPassword: string; newPassword: string }>();

  oldPassword: string = '';
  newPassword: string = '';
  showPassword: boolean = false;

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.oldPassword && this.newPassword) {
      this.save.emit({
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      });
      this.oldPassword = '';
      this.newPassword = '';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
