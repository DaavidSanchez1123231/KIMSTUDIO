import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Necesario para capturar los datos
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var particlesJS: any;

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class ReservasComponent implements OnInit, AfterViewInit {
  usuarioLogeado: string | null = null;
  rolLogeado: string | null = null;
  cargando: boolean = false;

  listaServicios: any[] = [];

  // Objeto reactivo para el formulario de cliente
  reserva = {
    nombre: '',
    telefono: '',
    correo: '',
    id_servicio: '',
    fecha: '',
    hora: '',
    detalles: '' // Notas adicionales
  };

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.usuarioLogeado = localStorage.getItem('usuario');
      this.rolLogeado = localStorage.getItem('rol');

      if (!this.usuarioLogeado) {
        alert("Debes iniciar sesión para reservar una cita.");
        this.router.navigate(['/login']); 
      } else {
        // Pre-llenamos el correo si lo usamos como nombre de usuario al logear
        this.reserva.correo = this.usuarioLogeado;
      }
    }

    // Cargamos los servicios disponibles desde SQL Server
    this.obtenerServicios();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerServicios(): void {
    // Usamos el mismo endpoint que configuramos para el panel administrativo
    this.http.get<any[]>(`${environment.apiUrl}/servicios`, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.listaServicios = data,
      error: (err) => {
        console.error('Error al cargar catálogo de servicios:', err);
        this.cdr.detectChanges();
      }
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
    localStorage.clear();
    this.usuarioLogeado = null;
    this.rolLogeado = null;
    this.router.navigate(['/login']);
  }

  aceptaPoliticas = false;

  procesarReserva(event: Event): void {
    event.preventDefault();
    if (!this.aceptaPoliticas) { alert('Debes aceptar la Política de Reembolsos, los Términos y la Política de Privacidad para reservar.'); return; }
    this.cargando = true;

    // Enviamos la petición al backend
    this.http.post(`${environment.apiUrl}/citas/cliente/reservar`, this.reserva, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("✨ Tu cita fue reservada correctamente. Te esperamos en NOVA Beauty Salon.");
        this.cargando = false;
        this.router.navigate(['/']); // Redirigimos al inicio tras el éxito
      },
      error: (err) => {
        console.error('Error al reservar:', err);
        this.cargando = false;
        this.cdr.detectChanges();

        // Manejo de conflictos de horario (HTTP 409 Conflict)
        if (err.status === 409) {
          alert("El horario seleccionado ya está ocupado. Por favor elige otra hora o fecha.");
        } else {
          alert("Ocurrió un error al procesar tu reserva. Por favor, intenta de nuevo.");
        }
      }
    });
  }
}