import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  empleados: any[] = [];
  empleadosFiltrados: any[] = [];
  textoBusqueda: string = '';

  nuevoEmpleado = {
    nombre: '',
    especialidad: 'Cabello', 
    telefono: '' // Agregado para capturar el teléfono
  };

  // --- VARIABLES PARA EL MODAL DE HORARIOS ---
  isModalHorariosOpen: boolean = false;
  especialistaSeleccionado: any = null;
  horariosActuales: any[] = [];
  nuevoHorario = { fecha: '', hora_inicio: '', hora_fin: '' };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerEmpleados();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ===================== CRUD EMPLEADOS =====================
  obtenerEmpleados(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/empleados`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.empleados = data;
        this.empleadosFiltrados = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });
  }

  filtrarEmpleados(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.empleadosFiltrados = this.empleados;
      return;
    }
    this.empleadosFiltrados = this.empleados.filter(e => 
      e.nombre?.toLowerCase().includes(busqueda) || e.especialidad?.toLowerCase().includes(busqueda)
    );
    this.cdr.detectChanges();
  }

  abrirModal(): void {
    this.isModalOpen = true;
    this.nuevoEmpleado = { nombre: '', especialidad: 'Cabello', telefono: '' };
  }

  cerrarModal(): void { this.isModalOpen = false; }

  guardarEmpleado(event: Event): void {
    event.preventDefault();
    this.http.post(`${environment.apiUrl}/empleados`, this.nuevoEmpleado, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("¡Colaborador registrado correctamente!");
        this.cerrarModal();
        this.obtenerEmpleados();
      },
      error: (err) => alert('Error al registrar empleado.')
    });
  }

  eliminarEmpleado(id_especialista: number, nombre: string): void {
    if (confirm(`¿Dar de baja a ${nombre}?`)) {
      this.http.delete(`${environment.apiUrl}/empleados/${id_especialista}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.empleados = this.empleados.filter(e => e.id_especialista !== id_especialista);
          this.filtrarEmpleados();
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  // ===================== GESTIÓN DE HORARIOS =====================
  abrirModalHorarios(empleado: any): void {
    this.especialistaSeleccionado = empleado;
    this.isModalHorariosOpen = true;
    this.nuevoHorario = { fecha: '', hora_inicio: '', hora_fin: '' };
    this.obtenerHorarios(empleado.id_especialista);
  }

  cerrarModalHorarios(): void {
    this.isModalHorariosOpen = false;
    this.especialistaSeleccionado = null;
    this.horariosActuales = [];
  }

  obtenerHorarios(id_especialista: number): void {
    this.http.get<any[]>(`${environment.apiUrl}/horarios/especialista/${id_especialista}`, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.horariosActuales = data,
      error: (err) => console.error(err)
    });
  }

  guardarHorario(event: Event): void {
    event.preventDefault();
    const payload = {
      id_especialista: this.especialistaSeleccionado.id_especialista,
      ...this.nuevoHorario
    };

    this.http.post(`${environment.apiUrl}/horarios`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.nuevoHorario = { fecha: '', hora_inicio: '', hora_fin: '' };
        this.obtenerHorarios(this.especialistaSeleccionado.id_especialista);
      },
      error: (err) => alert('Error al asignar el turno.')
    });
  }

  eliminarHorario(id_horario: number): void {
    if (confirm('¿Eliminar este turno?')) {
      this.http.delete(`${environment.apiUrl}/horarios/${id_horario}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.horariosActuales = this.horariosActuales.filter(h => h.id_horario !== id_horario);
        },
        error: (err) => console.error(err)
      });
    }
  }
}