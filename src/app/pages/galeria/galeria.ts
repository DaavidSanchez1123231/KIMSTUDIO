import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './galeria.html',
  styleUrl: './galeria.css'
})
export class GaleriaComponent implements OnInit {
  isModalOpen: boolean = false;
  cargando: boolean = true;
  filtroActual: string = 'todos';

  // Almacén de datos del servidor
  trabajos: any[] = [];

  // Objeto reactivo para el formulario
  nuevoTrabajo = {
    titulo: '',
    categoriaId: 'cabello',
    desc: '',
    imgAntes: '', // Almacenará la URL o nombre del archivo
    imgDespues: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerTrabajos();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerTrabajos(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/galeria`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.trabajos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar la galería:', err);
        this.cargando = false;
      }
    });
  }

  // Filtro computado utilizando Angular GETTER (Mantiene la reactividad de tu diseño original)
  get galeriaFiltrada() {
    if (this.filtroActual === 'todos') {
      return this.trabajos;
    }
    return this.trabajos.filter(trabajo => trabajo.categoriaId === this.filtroActual);
  }

  abrirModal(): void {
    this.isModalOpen = true;
    this.nuevoTrabajo = { titulo: '', categoriaId: 'cabello', desc: '', imgAntes: '', imgDespues: '' };
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  guardarTrabajo(event: Event): void {
    event.preventDefault();

    const payload = {
        titulo: this.nuevoTrabajo.titulo,
        categoria: this.nuevoTrabajo.categoriaId,
        url_imagen: this.nuevoTrabajo.imgAntes  // usamos la primera imagen
    };

    this.http.post(`${environment.apiUrl}/galeria`, payload, { headers: this.getHeaders() }).subscribe({
        next: () => {
            alert("¡Trabajo subido correctamente al portafolio!");
            this.cerrarModal();
            this.obtenerTrabajos();
        },
        error: (err) => {
            console.error('Error al publicar trabajo:', err);
            alert('Hubo un error al intentar publicar el trabajo.');
        }
    });
}

  eliminarTrabajo(id: number, titulo: string): void {
    const confirmar = confirm(`¿Estás seguro de eliminar "${titulo}" de la galería pública?`);
    if (confirmar) {
      this.http.delete(`${environment.apiUrl}/galeria/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert("Trabajo eliminado del portafolio.");
          this.trabajos = this.trabajos.filter(t => t.id_trabajo !== id);
        },
        error: (err) => console.error('Error al eliminar trabajo:', err)
      });
    }
  }
}