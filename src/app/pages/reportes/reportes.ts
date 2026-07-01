import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Necesario para los filtros de fecha
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class ReportesComponent implements OnInit {
  
  cargando: boolean = true;

  // Filtros de fecha enlazados bidireccionalmente
  fechaDesde: string = '';
  fechaHasta: string = '';

  // Estructuras para recibir los datos del servidor
  serviciosTop: any[] = [];
  empleadosTop: any[] = [];
  balance = {
    ingresosBrutos: 0,
    insumosComisiones: 0,
    utilidadNeta: 0
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.inicializarFechas();
    this.actualizarFiltro();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Establece por defecto el mes actual para los filtros
  inicializarFechas(): void {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.fechaHasta = hoy.toISOString().split('T')[0];
    this.fechaDesde = primerDia.toISOString().split('T')[0];
  }

  actualizarFiltro(): void {
    this.cargando = true;
    
    // Armamos los parámetros de la URL
    const params = `?desde=${this.fechaDesde}&hasta=${this.fechaHasta}`;

    this.http.get<any>(`${environment.apiUrl}/reportes/dashboard${params}`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        // Mapeamos las respuestas del backend a nuestras variables visuales
        this.serviciosTop = data.serviciosTop || [];
        this.empleadosTop = data.empleadosTop || [];
        this.balance = data.balance || this.balance;
        
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al generar el reporte:', err);
        alert('Ocurrió un error al calcular las métricas.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  exportarReporte(): void {
    alert("Generando auditoría en el servidor... El documento se descargará en breve.");
    
    const params = `?desde=${this.fechaDesde}&hasta=${this.fechaHasta}`;
    
    // Configuramos la petición para recibir un archivo binario (Blob) en lugar de un JSON
    this.http.get(`${environment.apiUrl}/reportes/exportar/pdf${params}`, { 
      headers: this.getHeaders(),
      responseType: 'blob' 
    }).subscribe({
      next: (blob) => {
        // Lógica estándar del navegador para forzar la descarga del PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_KIMSTUDIO_${this.fechaDesde}_al_${this.fechaHasta}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar el documento:', err);
        this.cdr.detectChanges();
      }
    });
  }
}