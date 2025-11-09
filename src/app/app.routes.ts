import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Principal } from './pages/principal/principal';
import { RealizarReserva } from './pages/realizar-reserva/realizar-reserva';
import { PerfilUsuario } from './pages/perfil-usuario/perfil-usuario';
import { PerfilAnfitrion } from './pages/perfil-anfitrion/perfil-anfitrion';
import { Favoritos } from './pages/favoritos/favoritos';
import { MisReservas } from './pages/mis-reservas/mis-reservas';

export const routes: Routes = [
    { path: '', component: Inicio },
    { path: 'principal', component: Principal},
    { path: 'realizar-reserva', component: RealizarReserva},
    { path: 'perfil-usuario', component: PerfilUsuario},
    { path: 'perfil-anfitrion', component: PerfilAnfitrion},
    { path: 'favoritos', component: Favoritos},
    { path: 'reservas', component: MisReservas},
    { path: "**", pathMatch: "full", redirectTo: "" }
];