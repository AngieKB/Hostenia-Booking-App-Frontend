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
import { AgregarAlojamientoHost } from './pages/agregar-alojamiento-host/agregar-alojamiento-host';
import { PapeleraHost } from './pages/papelera-host/papelera-host';
import { ReservasHost } from './pages/reservas-host/reservas-host';
import { Forbidden } from './pages/forbidden/forbidden';
import { loginGuard } from './guards/login.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    // Ruta de login (solo para usuarios no autenticados)
    { path: 'login', component: Inicio, canActivate: [loginGuard] },
    
    // Ruta por defecto (página principal - accesible sin login)
    { path: '', component: Principal },
    { path: 'principal', redirectTo: '', pathMatch: 'full' },
    
    // Rutas de usuario autenticado (HUESPED)
    { path: 'realizar-reserva', component: RealizarReserva, canActivate: [roleGuard], data: { expectedRole: ["HUESPED", "ANFITRION"] } },
    { path: 'perfil-usuario', component: PerfilUsuario, canActivate: [roleGuard], data: { expectedRole: ["HUESPED", "ANFITRION"] } },
    { path: 'favoritos', component: Favoritos, canActivate: [roleGuard], data: { expectedRole: ["HUESPED", "ANFITRION"] } },
    { path: 'reservas', component: MisReservas, canActivate: [roleGuard], data: { expectedRole: ["HUESPED", "ANFITRION"] } },
    { path: 'detalles-alojamiento/:id', component: DetallesAlojamiento },
    
    // Rutas del Host (ANFITRION)
    { path: 'perfil-anfitrion', component: PerfilAnfitrion, canActivate: [roleGuard], data: { expectedRole: ["ANFITRION"] } },
    { path: 'mis-alojamientos-host', component: MisAlojamientosHost, canActivate: [roleGuard], data: { expectedRole: ["ANFITRION"] } },
    { path: 'agregar-alojamiento-host', component: AgregarAlojamientoHost, canActivate: [roleGuard], data: { expectedRole: ["ANFITRION"] } },
    { path: 'detalles-alojamiento-host/:id', component: DetallesAlojamientoHost, canActivate: [roleGuard], data: { expectedRole: ["ANFITRION"] } },
    { path: 'papelera-host', component: PapeleraHost, canActivate: [roleGuard], data: { expectedRole: ["ANFITRION"] } },
    { path: 'reservas-host', component: ReservasHost, canActivate: [roleGuard], data: { expectedRole: ["ANFITRION"] } },
    
    // Página de acceso denegado
    { path: 'forbidden', component: Forbidden },
    
    // Redirección por defecto
    { path: "**", pathMatch: "full", redirectTo: "principal" }
];