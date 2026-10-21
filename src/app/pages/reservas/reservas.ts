import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  cargando = false;            // enviando la reserva
  cargandoHorarios = false;    // consultando horarios libres
  horariosCargados = false;    // ya se consultó (para poder decir "no hay horarios")

  listaServicios: any[] = [];
  listaEspecialistas: any[] = [];
  horarios: any[] = [];

  // El cliente NO se envía: el backend lo toma del token (así nadie reserva a nombre de otro)
  reserva = {
    idServicio: null as number | null,
    idEspecialista: null as number | null,
    fecha: '',
    idHorario: null as number | null
  };

  aceptaPoliticas = false;

  // YYYY-MM-DD en hora local (evita que después de las 7 pm aparezca "mañana")
  hoy = new Date().toLocaleDateString('en-CA');

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.usuarioLogeado = localStorage.getItem('usuario');
      this.rolLogeado = localStorage.getItem('rol');

      if (!this.usuarioLogeado) {
        alert("Debes iniciar sesión para reservar una cita.");
        this.router.navigate(['/login']);
        return;
      }
    }

    this.obtenerServicios();
    this.obtenerEspecialistas();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Endpoints públicos: solo traen lo activo y no exponen datos internos
  obtenerServicios(): void {
    this.http.get<any[]>(`${environment.apiUrl}/publico/servicios`).subscribe({
      next: (data) => { this.listaServicios = data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Error al cargar servicios:', err); this.cdr.detectChanges(); }
    });
  }

  obtenerEspecialistas(): void {
    this.http.get<any[]>(`${environment.apiUrl}/publico/especialistas`).subscribe({
      next: (data) => { this.listaEspecialistas = data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Error al cargar especialistas:', err); this.cdr.detectChanges(); }
    });
  }

  /** Se ejecuta al cambiar especialista o fecha: pide solo los horarios libres reales. */
  cargarHorarios(): void {
    this.reserva.idHorario = null;
    this.horarios = [];
    this.horariosCargados = false;

    if (!this.reserva.idEspecialista || !this.reserva.fecha) {
      this.cdr.detectChanges();
      return;
    }

    this.cargandoHorarios = true;
    this.http.get<any[]>(`${environment.apiUrl}/reservas/disponibles`, {
      headers: this.getHeaders(),
      params: { idEspecialista: this.reserva.idEspecialista, fecha: this.reserva.fecha }
    }).subscribe({
      next: (data) => {
        this.horarios = data;
        this.horariosCargados = true;
        this.cargandoHorarios = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar horarios:', err);
        this.cargandoHorarios = false;
        this.cdr.detectChanges();
        this.manejarSesion(err);
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

  procesarReserva(event: Event): void {
    event.preventDefault();
    if (!this.aceptaPoliticas) { alert('Debes aceptar la Política de Reembolsos, los Términos y la Política de Privacidad para reservar.'); return; }
    if (!this.reserva.idServicio || !this.reserva.idHorario || this.cargando) { return; }

    this.cargando = true;
    const cuerpo = { idHorario: this.reserva.idHorario, idServicio: this.reserva.idServicio };

    this.http.post<{ exito: boolean; mensaje: string }>(
      `${environment.apiUrl}/citas/cliente/reservar`, cuerpo, { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        alert("✨ Tu cita fue reservada correctamente. Te esperamos en NOVA Beauty Salon.");
        this.cargando = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error al reservar:', err);
        this.cargando = false;

        if (err.status === 409) {
          // Alguien tomó ese horario justo antes: avisamos y mostramos los que siguen libres
          alert(err.error?.mensaje ?? "Ese horario ya está ocupado. Elige otro.");
          this.cargarHorarios();
        } else if (!this.manejarSesion(err)) {
          alert("Ocurrió un error al procesar tu reserva. Por favor, intenta de nuevo.");
        }
        this.cdr.detectChanges();
      }
    });
  }

  /** Token vencido (dura 10 h) o inválido: Spring responde 401/403 → volver a iniciar sesión. */
  private manejarSesion(err: any): boolean {
    if (err.status === 401 || err.status === 403) {
      alert("Tu sesión venció. Inicia sesión de nuevo para reservar.");
      localStorage.clear();
      this.router.navigate(['/login']);
      return true;
    }
    return false;
  }
}