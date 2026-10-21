import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para la directiva *ngIf
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
    // Obtenemos los datos persistidos en el Login
    if (typeof window !== 'undefined' && window.localStorage) {
      this.nombreUsuario = localStorage.getItem('usuario') || 'Usuario';
      this.rolUsuario = localStorage.getItem('rol') || 'Admin';
    }
  }

  cerrarSesion(): void {
    const confirmar = confirm('¿Está seguro que desea cerrar la sesión de NOVA Beauty Salon?');
    
    if (confirmar) {
      // Limpieza total de seguridad
      localStorage.removeItem('usuario');
      localStorage.removeItem('rol');
      localStorage.removeItem('token'); // ¡Muy importante para cerrar la sesión activa del backend!
      
      alert('Sesión cerrada correctamente.');
      this.router.navigate(['/login']);
    }
  }
}