import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Necesario para [(ngModel)]
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class VentasComponent implements OnInit {
  isModalOpen: boolean = false;
  cargando: boolean = true;

  // Colecciones de datos
  ventas: any[] = [];
  ventasFiltradas: any[] = [];
  textoBusqueda: string = '';

  // Objeto para las tarjetas superiores
  metricas = {
    totalCaja: 0,
    porServicios: 0,
    porProductos: 0
  };

  // Modelo reactivo para la nueva venta
  nuevaVenta = {
    cliente: '',
    tipo: 'servicio', // valor por defecto del select
    metodo: 'Yape',   // valor por defecto del select
    total: null
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarMetricasHoy();
    this.obtenerVentas();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  cargarMetricasHoy(): void {
    // Endpoint que hace los SUM y GROUP BY de la fecha actual en SQL Server
    this.http.get<any>(`${environment.apiUrl}/ventas/metricas-hoy`, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.metricas = data,
      error: (err) => console.error('Error al cargar las métricas del día:', err)
    });
  }

  obtenerVentas(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/ventas`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.ventas = data;
        this.ventasFiltradas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar historial de caja:', err);
        this.cargando = false;
      }
    });
  }

  filtrarVentas(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.ventasFiltradas = this.ventas;
      return;
    }
    this.ventasFiltradas = this.ventas.filter(v => 
      v.boleta?.toLowerCase().includes(busqueda) ||
      v.cliente?.toLowerCase().includes(busqueda) ||
      v.detalle?.toLowerCase().includes(busqueda)
    );
  }

  abrirModal(): void {
    this.isModalOpen = true;
    this.nuevaVenta = { cliente: '', tipo: 'servicio', metodo: 'Yape', total: null };
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  registrarVenta(event: Event): void {
    event.preventDefault();

    this.http.post(`${environment.apiUrl}/ventas`, this.nuevaVenta, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("¡Venta procesada con éxito! Balance de caja actualizado.");
        this.cerrarModal();
        this.obtenerVentas();     // Recargamos la tabla
        this.cargarMetricasHoy(); // Recargamos las tarjetas superiores
      },
      error: (err) => {
        console.error('Error al registrar venta:', err);
        alert('Ocurrió un error al guardar la venta en el sistema.');
      }
    });
  }

  anularVenta(id_venta: number, nroBoleta: string): void {
    const confirmar = confirm(`¿Está seguro de que desea ANULAR el comprobante ${nroBoleta}? Esta acción restará el monto del balance diario y no se puede deshacer.`);
    
    if (confirmar) {
      const motivo = prompt("Por motivos de auditoría, ingrese el motivo técnico de la anulación:");
      
      if (motivo && motivo.trim() !== "") {
        // Hacemos una petición especial enviando el motivo al backend
        const payload = { motivo: motivo };

        this.http.post(`${environment.apiUrl}/ventas/${id_venta}/anular`, payload, { headers: this.getHeaders() }).subscribe({
          next: () => {
            alert(`Comprobante ${nroBoleta} anulado con éxito.\nMotivo registrado: "${motivo}"\nSe ha generado el asiento de ajuste en el balance.`);
            this.obtenerVentas();
            this.cargarMetricasHoy();
          },
          error: (err) => console.error('Error al anular venta:', err)
        });

      } else if (motivo !== null) {
        alert("Operación cancelada. El sistema requiere una justificación válida para proceder.");
      }
    }
  }
}