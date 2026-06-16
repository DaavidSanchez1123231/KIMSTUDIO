import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var particlesJS: any;

@Component({
  selector: 'app-promociones-publico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './promociones-publico.html',
  styleUrl: './promociones-publico.css'
})
export class PromocionesPublicoComponent implements OnInit, AfterViewInit {
  
  promociones: any[] = [];
  cargando: boolean = true;
  usuarioLogeado: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.usuarioLogeado = localStorage.getItem('usuario');
    }
    this.cargarPromocionesActivas();
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

  cargarPromocionesActivas(): void {
    // Apuntamos a un endpoint público (que no requiera JWT en tu SecurityConfig de Spring Boot)
    this.http.get<any[]>(`${environment.apiUrl}/publico/promociones`).subscribe({
      next: (data) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Mapeamos los datos y filtramos estrictamente las promociones vigentes
        this.promociones = data
          .map(promo => {
            const fechaExp = new Date(promo.fecha_expiracion);
            // Ajuste de zona horaria para evitar desfasajes en la fecha
            fechaExp.setMinutes(fechaExp.getMinutes() + fechaExp.getTimezoneOffset());
            
            return {
              ...promo,
              descuentoTexto: `-${promo.descuento}%`,
              fechaFormateada: this.formatearFecha(fechaExp),
              valida: fechaExp >= hoy // Solo true si no ha caducado
            };
          })
          .filter(promo => promo.valida); // Descartamos las caducadas para la vista pública

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar las promociones públicas:', err);
        this.cargando = false;
      }
    });
  }

  formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `Válido hasta: ${dia}/${mes}/${anio}`;
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('token'); // Limpieza profunda de seguridad
    this.usuarioLogeado = null;
    this.router.navigate(['/login']);
  }
}