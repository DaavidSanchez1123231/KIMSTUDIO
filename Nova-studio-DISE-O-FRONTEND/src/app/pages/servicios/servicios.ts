import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css'
})
export class ServiciosComponent implements OnInit {
  isModalOpen: boolean = false;
  cargando: boolean = true;
  filtroActual: string = 'todos';

  // Lista que se alimentará de SQL Server
  servicios: any[] = [];

  // Objeto reactivo para el formulario
  nuevoServicio = {
    nombre: '',
    categoriaId: 'cabello',
    precio: null,
    desc: '',
    imagen_url: '' // Campo para la URL de la imagen
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {} 

  ngOnInit(): void {
    this.obtenerServicios();
  }

  // Obtenemos el token de seguridad para poder hacer peticiones
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Trae la lista de servicios desde Spring Boot
  obtenerServicios(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/servicios`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.servicios = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar catálogo de servicios:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filtro dinámico para las pestañas de la vista
  get serviciosFiltrados() {
    if (this.filtroActual === 'todos') {
      return this.servicios;
    }
    return this.servicios.filter(servicio => servicio.categoriaId === this.filtroActual);
  }

  // Abre el modal y LIMPIA el formulario por completo (Incluyendo la imagen)
  abrirModal(): void {
    this.isModalOpen = true;
    this.nuevoServicio = { 
      nombre: '', 
      categoriaId: 'cabello', 
      precio: null, 
      desc: '', 
      imagen_url: '' 
    };
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  // Envía el nuevo servicio a Spring Boot
  guardarServicio(event: Event): void {
    event.preventDefault();

    // Mapeo amigable para las etiquetas visuales (Opcional, según cómo lo uses en BD)
    const categoriaMap: any = {
      'cabello': 'Cabello',
      'cejas': 'Cejas',
      'uñas': 'Uñas'
    };

    const payload = {
      ...this.nuevoServicio,
      categoriaTexto: categoriaMap[this.nuevoServicio.categoriaId]
    };

    this.http.post(`${environment.apiUrl}/servicios`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("¡Servicio guardado con éxito en el catálogo!");
        this.cerrarModal();
        this.obtenerServicios(); // Recargamos el catálogo de inmediato
      },
      error: (err) => {
        console.error('Error al guardar servicio:', err);
        alert('Ocurrió un error al registrar el servicio en la base de datos.');
      }
    });
  }

  // Elimina (o inactiva) un servicio
  eliminarServicio(id: number, nombre: string): void {
    const confirmar = confirm(`¿Estás seguro de eliminar el servicio "${nombre}"?`);
    if (confirmar) {
      this.http.delete(`${environment.apiUrl}/servicios/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert("Servicio eliminado del catálogo.");
          // Actualizamos la vista sin recargar la página entera
          this.servicios = this.servicios.filter(s => s.id_servicio !== id);
        },
        error: (err) => console.error('Error al eliminar servicio:', err)
      });
    }
  }
}