import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Necesario para el *ngIf
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Recuperamos el rol y el nombre de la sesión actual
    if (typeof window !== 'undefined' && window.localStorage) {
      this.rolUsuario = localStorage.getItem('rol') || 'invitado';
      this.nombreUsuario = localStorage.getItem('usuario') || 'Usuario';
    }
  }

  // Funciones validadoras de permisos
  esAdmin(): boolean {
    return this.rolUsuario === 'admin';
  }

  esRecepcion(): boolean {
    return this.rolUsuario === 'admin' || this.rolUsuario === 'recepcionista';
  }

  esCaja(): boolean {
    return this.rolUsuario === 'admin' || this.rolUsuario === 'cajero';
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}