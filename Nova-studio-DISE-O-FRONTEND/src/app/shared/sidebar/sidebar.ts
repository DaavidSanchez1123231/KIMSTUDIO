import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {

  rolUsuario: string = '';
  nombreUsuario: string = '';

  // Estado del menú lateral
  sidebarColapsado: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.rolUsuario = (
        window.localStorage.getItem('rol') || 'invitado'
      ).trim().toLowerCase();

      this.nombreUsuario =
        window.localStorage.getItem('usuario') || 'Usuario';
    }
  }

  // Contraer y expandir el sidebar
  toggleSidebar(): void {
    this.sidebarColapsado = !this.sidebarColapsado;
  }

  // Validar administrador
  esAdmin(): boolean {
    return this.rolUsuario === 'admin';
  }

  // Validar recepción
  esRecepcion(): boolean {
    return (
      this.rolUsuario === 'admin' ||
      this.rolUsuario === 'recepcion'
    );
  }

  // Validar caja
  esCaja(): boolean {
    return (
      this.rolUsuario === 'admin' ||
      this.rolUsuario === 'cajero'
    );
  }

  // Cerrar sesión
  cerrarSesion(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }

    this.router.navigate(['/login']);
  }
}