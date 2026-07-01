import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var particlesJS: any;

@Component({
  selector: 'app-servicios-publico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './servicios-publico.html',
  styleUrl: './servicios-publico.css'
})
export class ServiciosPublicoComponent implements OnInit, AfterViewInit {
  usuarioLogeado: string | null = null;
  rolLogeado: string | null = null;
  cargando: boolean = true;

  // Lista dinámica vinculada a Spring Boot
  listaServicios: any[] = [];

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.usuarioLogeado = localStorage.getItem('usuario');
      this.rolLogeado = localStorage.getItem('rol');
    }

    this.cargarCatalogoServicios();
  }

  cargarCatalogoServicios(): void {
    this.http.get<any[]>(`${environment.apiUrl}/publico/servicios`).subscribe({
        next: (data) => {
            this.listaServicios = data.map(servicio => {
                let iconoAsignado = 'fas fa-star';
                // ← cambia categoriaId por categoria
                if (servicio.categoria === 'cabello') iconoAsignado = 'fas fa-scissors';
                if (servicio.categoria === 'uñas')    iconoAsignado = 'fas fa-hand-sparkles';
                if (servicio.categoria === 'cejas')   iconoAsignado = 'fas fa-eye';

                return {
                    ...servicio,
                    icono: iconoAsignado,
                    imagen_url: servicio.imagen_url || 'assets/img/servicios/placeholder.jpg'
                };
            });
            this.cargando = false;
            this.cdr.detectChanges();
        },
        error: () => { this.cargando = false; }
    });
}
  ngAfterViewInit(): void {
    if (typeof particlesJS !== 'undefined') {
      particlesJS("particles-js", {
        particles: {
          number: { value: 250 },
          size: { value: 2 },
          color: { value: "#68b2a8" },
          line_linked: { opacity: 0.1 }
        }
      });
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('token');
    this.usuarioLogeado = null;
    this.rolLogeado = null;
    this.router.navigate(['/login']);
  }

  irAReservas(): void {
    this.router.navigate(['/reservas']);
  }
}