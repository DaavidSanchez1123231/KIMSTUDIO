import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promociones.html',
  styleUrl: './promociones.css'
})
export class PromocionesComponent implements OnInit {
  isModalOpen: boolean = false;
  cargando: boolean = true;

  // Listas de datos
  promociones: any[] = [];
  promosFiltradas: any[] = [];
  textoBusqueda: string = '';

  // Modelo reactivo para el modal
  nuevaPromo = {
    nombre: '',
    descuento: null,
    codigo: '',
    fecha_expiracion: '',
    descripcion: ''
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerPromociones();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerPromociones(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/promociones`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        // Obtenemos la fecha actual a las 00:00:00 para comparar limpiamente
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Mapeamos los datos para inyectar lógica de estado al vuelo
        this.promociones = data.map(promo => {
          const fechaExp = new Date(promo.fecha_expiracion);
          // Omitimos problemas de zona horaria con las horas
          fechaExp.setMinutes(fechaExp.getMinutes() + fechaExp.getTimezoneOffset());
          
          const estaVencida = fechaExp < hoy;

          return {
            ...promo,
            descuentoTexto: `-${promo.descuento}%`,
            fechaFormateada: this.formatearFecha(fechaExp),
            expirada: estaVencida,
            estado: estaVencida ? 'Finalizado' : 'Vigente',
            claseEstado: estaVencida ? 'disable' : 'active'
          };
        });

        this.promosFiltradas = this.promociones;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar promociones:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Helper para mostrar la fecha de forma amigable (Ej: "Vence: 15/07/2026")
  formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const textoBase = fecha < new Date(new Date().setHours(0,0,0,0)) ? 'Venció:' : 'Vence:';
    return `${textoBase} ${dia}/${mes}/${anio}`;
  }

  filtrarPromos(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.promosFiltradas = this.promociones;
      return;
    }
    this.promosFiltradas = this.promociones.filter(p => 
      p.titulo?.toLowerCase().includes(busqueda) ||
      p.codigo?.toLowerCase().includes(busqueda)
    );
  }

  abrirModal(): void {
    this.isModalOpen = true;
    this.nuevaPromo = { nombre: '', descuento: null, codigo: '', fecha_expiracion: '', descripcion: '' };
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  guardarPromo(event: Event): void {
    event.preventDefault();

    this.http.post(`${environment.apiUrl}/promociones`, this.nuevaPromo, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("¡Campaña promocional activada y publicada con éxito!");
        this.cerrarModal();
        this.obtenerPromociones(); 
      },
      error: (err) => {
        console.error('Error al crear promoción:', err);
        alert('Ocurrió un error al intentar crear la campaña.');
      }
    });
  }

  eliminarPromo(id: number, titulo: string): void {
    const confirmar = confirm(`¿Estás seguro de eliminar la promoción "${titulo}"?`);
    if (confirmar) {
      this.http.delete(`${environment.apiUrl}/promociones/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert("Campaña eliminada del sistema.");
          this.promociones = this.promociones.filter(p => p.id_promocion !== id);
          this.filtrarPromos();
        },
        error: (err) => console.error('Error al eliminar promoción:', err)
      });
    }
  }
}