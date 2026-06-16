import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  
  cargandoMetricas: boolean = true;
  cargandoCitas: boolean = true;

  metricas: any[] = [];
  citas: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarMetricas();
    this.cargarCitasRecientes();
  }

  // Helper para el JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  cargarMetricas(): void {
    this.http.get<any>(`${environment.apiUrl}/dashboard/metricas`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        // Mapeamos el DTO de Spring Boot al formato visual de las tarjetas
        this.metricas = [
          { valor: data.citasHoy || '0', etiqueta: 'Citas Hoy', icono: 'fas fa-calendar-check' },
          { valor: `S/ ${data.ingresosEstimados || '0.00'}`, etiqueta: 'Ingresos Estimados', icono: 'fas fa-wallet' },
          { valor: data.clientesRegistrados || '0', etiqueta: 'Clientes Registrados', icono: 'fas fa-users' },
          { valor: data.solicitudesPendientes || '0', etiqueta: 'Solicitudes Pendientes', icono: 'fas fa-bell' }
        ];
        this.cargandoMetricas = false;
      },
      error: (err) => {
        console.error('Error al cargar métricas:', err);
        this.cargandoMetricas = false;
      }
    });
  }

  cargarCitasRecientes(): void {
    this.http.get<any[]>(`${environment.apiUrl}/dashboard/citas-recientes`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.citas = data;
        this.cargandoCitas = false;
      },
      error: (err) => {
        console.error('Error al cargar citas recientes:', err);
        this.cargandoCitas = false;
      }
    });
  }
}