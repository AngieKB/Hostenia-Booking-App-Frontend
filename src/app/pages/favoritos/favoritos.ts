import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainHeader } from '../../components/main-header/main-header';
import { AlojamientoDTO } from '../../models/alojamiento';
import { AlojamientoService } from '../../services/alojamiento.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, MainHeader],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css',
})
export class Favoritos implements OnInit {
  favoritos: Set<number> = new Set();
  alojamientosFavoritos: AlojamientoDTO[] = [];

  constructor(
    private alojamientoService: AlojamientoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavoritos();
  }

  private loadFavoritos(): void {
    // Cargar favoritos desde localStorage
    const favoritosGuardados = localStorage.getItem('favoritos');
    if (favoritosGuardados) {
      this.favoritos = new Set(JSON.parse(favoritosGuardados));
    }

    // Obtener los alojamientos favoritos
    const todosAlojamientos = this.alojamientoService.getAll();
    this.alojamientosFavoritos = todosAlojamientos.filter(a => this.favoritos.has(a.id));
  }

  quitarFavorito(id: number): void {
    this.favoritos.delete(id);
    localStorage.setItem('favoritos', JSON.stringify(Array.from(this.favoritos)));
    this.alojamientosFavoritos = this.alojamientosFavoritos.filter(a => a.id !== id);
  }
}
