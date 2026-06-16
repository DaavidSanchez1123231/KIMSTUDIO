import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Esencial para los inputs del formulario
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.html',
  styleUrl: './empleados.css'
})
export class EmpleadosComponent implements OnInit {
  isModalOpen: boolean = false;
  cargando: boolean = true;

  // Colecciones para almacenar los datos del servidor
  empleados: any[] = [];
  empleadosFiltrados: any[] = [];
  textoBusqueda: string = '';

  // DTO enlazado al formulario de registro
  nuevoEmpleado = {
    nombre: '',
    especialidad: 'Cabello', 
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerEmpleados();
  }

  // Generador centralizado de tokens de seguridad para el filtro de Spring Boot
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerEmpleados(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/empleados`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.empleados = data;
        this.empleadosFiltrados = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al recuperar colaboradores:', err);
        this.cargando = false;
      }
    });
  }

  // Lógica de búsqueda optimizada en memoria
  filtrarEmpleados(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.empleadosFiltrados = this.empleados;
      return;
    }
    this.empleadosFiltrados = this.empleados.filter(e => 
      e.nombre?.toLowerCase().includes(busqueda) ||
      e.especialidad?.toLowerCase().includes(busqueda)
    );
  }

  abrirModal(): void {
    this.isModalOpen = true;
    this.nuevoEmpleado = { nombre: '', especialidad: 'Cabello' };
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  guardarEmpleado(event: Event): void {
    event.preventDefault();

    this.http.post(`${environment.apiUrl}/empleados`, this.nuevoEmpleado, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("¡Colaborador registrado correctamente en el sistema!");
        this.cerrarModal();
        this.obtenerEmpleados(); // Recarga inmediata del listado de especialistas
      },
      error: (err) => {
        console.error('Error al insertar colaborador:', err);
        alert('No se pudo completar el registro del empleado. Intente de nuevo.');
      }
    });
  }

  eliminarEmpleado(id_especialista: number, nombre: string): void {
    const confirmar = confirm(`¿Estás seguro de dar de baja a ${nombre}?`);
    if (confirmar) {
      this.http.delete(`${environment.apiUrl}/empleados/${id_especialista}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert("Colaborador inhabilitado del sistema.");
          // Remoción visual instantánea reduciendo peticiones innecesarias
          this.empleados = this.empleados.filter(e => e.id_especialista !== id_especialista);
          this.filtrarEmpleados();
        },
        error: (err) => console.error('Error al dar de baja:', err)
      });
    }
  }
}