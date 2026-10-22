import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ServicioReporte {
  nombre: string;
  porcentaje: number;
}

interface EmpleadoReporte {
  nombre: string;
  puesto: string;
  monto: number;
}

interface BalanceReporte {
  ingresosBrutos?: number | string;
  insumosComisiones?: number | string;
  utilidadNeta?: number | string;
}

interface DashboardReporte {
  serviciosTop?: ServicioReporte[];
  empleadosTop?: EmpleadoReporte[];
  balance?: BalanceReporte;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent implements OnInit {

  cargando = true;
  exportando = false;

  fechaDesde = '';
  fechaHasta = '';

  errorReporte = '';
  errorExportacion = '';

  serviciosTop: ServicioReporte[] = [];
  empleadosTop: EmpleadoReporte[] = [];

  balance = {
    ingresosBrutos: 0,
    insumosComisiones: 0,
    utilidadNeta: 0
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inicializarFechas();
    this.actualizarFiltro();
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

  /**
   * Devuelve la fecha local como AAAA-MM-DD.
   * Evita el desfase que puede producir toISOString() en Lima.
   */
  private fechaLocalISO(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  inicializarFechas(): void {
    const hoy = new Date();
    const primerDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      1
    );

    this.fechaDesde = this.fechaLocalISO(primerDia);
    this.fechaHasta = this.fechaLocalISO(hoy);
  }

  private validarRango(): boolean {
    this.errorReporte = '';
    this.errorExportacion = '';

    if (!this.fechaDesde || !this.fechaHasta) {
      this.errorReporte = 'Selecciona las fechas de inicio y fin.';
      return false;
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(this.fechaDesde) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(this.fechaHasta)
    ) {
      this.errorReporte = 'Selecciona fechas válidas.';
      return false;
    }

    if (this.fechaDesde > this.fechaHasta) {
      this.errorReporte =
        'La fecha inicial no puede ser posterior a la fecha final.';
      return false;
    }

    const convertirUTC = (fecha: string): number => {
      const [anio, mes, dia] = fecha.split('-').map(Number);
      return Date.UTC(anio, mes - 1, dia);
    };

    const inicio = convertirUTC(this.fechaDesde);
    const fin = convertirUTC(this.fechaHasta);

    // Comprueba también que las fechas existan realmente.
    if (
      Number.isNaN(inicio) ||
      Number.isNaN(fin) ||
      new Date(inicio).toISOString().slice(0, 10) !== this.fechaDesde ||
      new Date(fin).toISOString().slice(0, 10) !== this.fechaHasta
    ) {
      this.errorReporte = 'Una de las fechas seleccionadas no es válida.';
      return false;
    }

    const diasIncluidos =
      Math.floor((fin - inicio) / 86400000) + 1;

    if (diasIncluidos > 366) {
      this.errorReporte =
        'El período no puede superar los 366 días.';
      return false;
    }

    return true;
  }

  actualizarFiltro(): void {
    if (!this.validarRango()) {
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;
    this.errorReporte = '';

    const params = new HttpParams()
      .set('desde', this.fechaDesde)
      .set('hasta', this.fechaHasta);

    this.http.get<DashboardReporte>(
      `${environment.apiUrl}/reportes/dashboard`,
      {
        headers: this.getHeaders(),
        params
      }
    ).subscribe({
      next: (data) => {
        this.serviciosTop = Array.isArray(data?.serviciosTop)
          ? data.serviciosTop
          : [];

        this.empleadosTop = Array.isArray(data?.empleadosTop)
          ? data.empleadosTop
          : [];

        const balance = data?.balance ?? {};

        this.balance = {
          ingresosBrutos: Number(balance.ingresosBrutos ?? 0),
          insumosComisiones: Number(
            balance.insumosComisiones ?? 0
          ),
          utilidadNeta: Number(balance.utilidadNeta ?? 0)
        };

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al generar el reporte:', err);

        this.errorReporte =
          err?.error?.mensaje ||
          'No se pudieron calcular los indicadores. Verifica tu sesión y la conexión con el servidor.';

        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  exportarReporte(): void {
    if (!this.validarRango()) {
      this.cdr.detectChanges();
      return;
    }

    this.exportando = true;
    this.errorExportacion = '';

    const params = new HttpParams()
      .set('desde', this.fechaDesde)
      .set('hasta', this.fechaHasta);

    this.http.get(
      `${environment.apiUrl}/reportes/exportar/pdf`,
      {
        headers: this.getHeaders(),
        params,
        responseType: 'blob'
      }
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');

        enlace.href = url;
        enlace.download =
          `Reporte_NOVA_${this.fechaDesde}_al_${this.fechaHasta}.pdf`;

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        window.setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);

        this.exportando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al exportar el documento:', err);

        this.errorExportacion =
          'No se pudo generar o descargar el PDF. Verifica tu sesión y vuelve a intentarlo.';

        this.exportando = false;
        this.cdr.detectChanges();
      }
    });
  }
}