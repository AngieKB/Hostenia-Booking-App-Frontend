import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Principal } from './pages/principal/principal';
import { RealizarReserva } from './pages/realizar-reserva/realizar-reserva';
import { PerfilUsuario } from './pages/perfil-usuario/perfil-usuario';
import { PerfilAnfitrion } from './pages/perfil-anfitrion/perfil-anfitrion';
import { Favoritos } from './pages/favoritos/favoritos';
import { MisReservas } from './pages/mis-reservas/mis-reservas';
import { DetallesAlojamiento } from './pages/detalles-alojamiento/detalles-alojamiento';
import { DetallesAlojamientoHost } from './pages/detalles-alojamiento-host/detalles-alojamiento-host';
import { MisAlojamientosHost } from './pages/mis-alojamientos-host/mis-alojamientos-host';
import { PapeleraHost } from './pages/papelera-host/papelera-host';
import { ReservasHost } from './pages/reservas-host/reservas-host';

export const routes: Routes = [
    { path: '', component: Inicio },
    { path: 'principal', component: Principal},
    { path: 'realizar-reserva', component: RealizarReserva},
    { path: 'perfil-usuario', component: PerfilUsuario},
    { path: 'perfil-anfitrion', component: PerfilAnfitrion},
    { path: 'favoritos', component: Favoritos},
    { path: 'reservas', component: MisReservas},
    { path: 'detalles-alojamiento/:id', component: DetallesAlojamiento},
    
    // Rutas del Host
    { path: 'mis-alojamientos-host', component: MisAlojamientosHost},
    { path: 'detalles-alojamiento-host/:id', component: DetallesAlojamientoHost},
    { path: 'papelera-host', component: PapeleraHost},
    { path: 'reservas-host', component: ReservasHost},
    
    { path: "**", pathMatch: "full", redirectTo: "" }
];