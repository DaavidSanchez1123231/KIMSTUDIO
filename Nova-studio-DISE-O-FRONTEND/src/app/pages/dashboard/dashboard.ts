import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface MetricasDashboard {
  citasHoy?: number;
  ingresosHoy?: number | string;
  totalCaja?: number | string;
  clientesRegistrados?: number;
  solicitudesPendientes?: number;
}

interface CitaDashboardApi {
  id_cita: number;
  fecha: string;
  hora?: string;
  nombre_cliente?: string;
  nombre_servicio?: string;
  estado?: string;
}

interface CitaDashboard extends Omit<CitaDashboardApi, 'fecha'> {
  fecha: Date | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  cargandoMetricas = true;
  cargandoCitas = true;

  errorMetricas = '';
  errorCitas = '';

  metricas: { valor: string; etiqueta: string; icono: string }[] = [];
  citas: CitaDashboard[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMetricas();
    this.cargarCitasRecientes();
  }

  private getHeaders(): HttpHeaders {
    const token = typeof localStorage !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  cargarMetricas(): void {
    this.cargandoMetricas = true;
    this.errorMetricas = '';

    this.http.get<MetricasDashboard>(
      `${environment.apiUrl}/dashboard/metricas`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        const ingresos = Number(
          data.ingresosHoy ?? data.totalCaja ?? 0
        );

        const ingresosFormateados = new Intl.NumberFormat('es-PE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(Number.isFinite(ingresos) ? ingresos : 0);

        this.metricas = [
          {
            valor: String(data.citasHoy ?? 0),
            etiqueta: 'Citas hoy',
            icono: 'fas fa-calendar-check'
          },
          {
            valor: `S/ ${ingresosFormateados}`,
            etiqueta: 'Ingresos de hoy',
            icono: 'fas fa-wallet'
          },
          {
            valor: String(data.clientesRegistrados ?? 0),
            etiqueta: 'Clientes registrados',
            icono: 'fas fa-users'
          },
          {
            valor: String(data.solicitudesPendientes ?? 0),
            etiqueta: 'Solicitudes pendientes',
            icono: 'fas fa-bell'
          }
        ];

        this.cargandoMetricas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar métricas:', err);

        this.metricas = [];
        this.errorMetricas =
          'No se pudieron cargar las métricas. Verifica tu sesión y la conexión con el servidor.';

        this.cargandoMetricas = false;
        this.cdr.detectChanges();
      }
    });
  }

  private convertirFechaHora(
    fechaTexto: string,
    horaTexto: string
  ): Date | null {
    // La API devuelve la fecha como DD/MM/AAAA y la hora como HH:mm.
    const fecha = String(fechaTexto ?? '').trim();
    const hora = String(horaTexto ?? '00:00').trim();

    const partesFecha = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const partesHora = hora.match(/^(\d{2}):(\d{2})/);

    if (!partesFecha || !partesHora) {
      return null;
    }

    const dia = Number(partesFecha[1]);
    const mes = Number(partesFecha[2]);
    const anio = Number(partesFecha[3]);
    const horas = Number(partesHora[1]);
    const minutos = Number(partesHora[2]);

    const resultado = new Date(
      anio,
      mes - 1,
      dia,
      horas,
      minutos
    );

    // Evita mostrar una fecha inválida o desplazada.
    if (
      resultado.getFullYear() !== anio ||
      resultado.getMonth() !== mes - 1 ||
      resultado.getDate() !== dia ||
      resultado.getHours() !== horas ||
      resultado.getMinutes() !== minutos
    ) {
      return null;
    }

    return resultado;
  }

  cargarCitasRecientes(): void {
    this.cargandoCitas = true;
    this.errorCitas = '';

    this.http.get<CitaDashboardApi[]>(
      `${environment.apiUrl}/dashboard/citas-recientes`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.citas = (Array.isArray(data) ? data : []).map((cita) => ({
          ...cita,
          fecha: this.convertirFechaHora(cita.fecha, cita.hora ?? '')
        }));

        this.cargandoCitas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar citas recientes:', err);

        this.citas = [];
        this.errorCitas =
          'No se pudieron cargar las citas recientes. Verifica tu sesión y la conexión con el servidor.';

        this.cargandoCitas = false;
        this.cdr.detectChanges();
      }
    });
  }
}