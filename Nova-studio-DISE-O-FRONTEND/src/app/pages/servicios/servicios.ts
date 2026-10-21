import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface FormServicio {
  nombre: string;
  categoriaId: string;
  precio: number | null;
  desc: string;
  imagen_url: string;
  duracion_minutos: number;
}
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

  nuevoServicio: FormServicio = {
    nombre: '',
    categoriaId: 'cabello',
    precio: null,
    desc: '',
    imagen_url: '',
    duracion_minutos: 60
  };

  editandoId: number | null = null;        
  imagenError: boolean = false;           
  fallidas: Record<number, boolean> = {};    

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
        this.fallidas = {};
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

  
  abrirModal(): void {
    this.editandoId = null;
    this.imagenError = false;
    this.nuevoServicio = { nombre: '', categoriaId: 'cabello', precio: null, desc: '', imagen_url: '', duracion_minutos: 60 };
    this.isModalOpen = true;
  }

  // Abre el modal con los datos del servicio para EDITARLO
  abrirEdicion(servicio: any): void {
    this.editandoId = servicio.id_servicio;
    this.imagenError = false;
    this.nuevoServicio = {
      nombre: servicio.nombre ?? '',
      categoriaId: servicio.categoriaId ?? 'cabello',
      precio: servicio.precio ?? null,
      desc: servicio.desc ?? '',
      imagen_url: servicio.imagen_url ?? '',
      duracion_minutos: servicio.duracion_minutos || 60
    };
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.editandoId = null;
  }

  // Envía el nuevo servicio a Spring Boot
  guardarServicio(event: Event): void {
    event.preventDefault();

    const editando = this.editandoId !== null;
    const url = `${environment.apiUrl}/servicios`;
    const peticion = editando
      ? this.http.put(`${url}/${this.editandoId}`, this.nuevoServicio, { headers: this.getHeaders() })
      : this.http.post(url, this.nuevoServicio, { headers: this.getHeaders() });

    peticion.subscribe({
      next: () => {
        alert(editando ? '¡Servicio actualizado correctamente!' : '¡Servicio guardado con éxito en el catálogo!');
        this.cerrarModal();
        this.obtenerServicios(); // Recargamos el catálogo de inmediato
      },
      error: (err) => {
        console.error('Error al guardar servicio:', err);
        alert(err.error?.mensaje || 'Ocurrió un error al guardar el servicio.');
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