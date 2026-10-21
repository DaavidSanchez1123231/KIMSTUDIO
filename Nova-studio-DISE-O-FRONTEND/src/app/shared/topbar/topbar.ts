import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class TopbarComponent implements OnInit {

  nombreUsuario: string = 'Usuario';
  rolUsuario: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Recuperar los datos del usuario de la sesión
    if (typeof window !== 'undefined') {
      this.nombreUsuario =
        window.localStorage.getItem('usuario') || 'Usuario';

      this.rolUsuario =
        window.localStorage.getItem('rol') || 'Admin';
    }
  }

  cerrarSesion(): void {
    // Confirmar la salida antes de cerrar la sesión
    if (typeof window === 'undefined') {
      return;
    }

    const confirmar = window.confirm(
      '¿Está seguro que desea cerrar la sesión de NOVA Beauty Salon?'
    );

    if (!confirmar) {
      return;
    }

    // Eliminar los datos de sesión utilizados por la aplicación
    window.localStorage.removeItem('usuario');
    window.localStorage.removeItem('rol');
    window.localStorage.removeItem('token');

    window.alert('Sesión cerrada correctamente.');

    // Regresar a la pantalla de inicio de sesión
    this.router.navigate(['/login']);
  }
}