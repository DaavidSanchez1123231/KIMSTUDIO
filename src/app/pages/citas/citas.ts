import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Necesario para el [(ngModel)]
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class CitasComponent implements OnInit {
  isModalOpen: boolean = false;
  cargando: boolean = true;

  // Listas de datos
  citas: any[] = []; 
  citasFiltradas: any[] = [];
  textoBusqueda: string = '';

  // Servicios disponibles cargados dinámicamente desde la BD
  listaServicios: any[] = [];

  // Objeto reactivo para el formulario (HU-02)
  nuevaCita = {
    nombre_cliente: '',
    id_servicio: '',
    fecha: '',
    hora: ''
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.obtenerCitas();
    this.obtenerServicios();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerCitas(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/citas`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.citas = data;
        this.citasFiltradas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener citas:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerServicios(): void {

    this.http.get<any[]>(`${environment.apiUrl}/servicios`, { headers: this.getHeaders() }).subscribe({
      next: (data) => this.listaServicios = data,
      error: (err) => console.error('Error al cargar catálogo de servicios:', err)
    });
  }

  filtrarCitas(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.citasFiltradas = this.citas;
      return;
    }

    this.citasFiltradas = this.citas.filter(c =>
      c.cliente?.toLowerCase().includes(busqueda) ||
      c.servicio?.toLowerCase().includes(busqueda)
    );
}

  abrirModal(): void {
    this.isModalOpen = true;
    this.nuevaCita = { nombre_cliente: '', id_servicio: '', fecha: '', hora: '' };
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  guardarCita(event: Event): void {
    event.preventDefault();

    this.http.post(`${environment.apiUrl}/citas`, this.nuevaCita, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("¡Cita agendada correctamente!");
        this.cerrarModal();
        this.obtenerCitas(); // Recargamos la tabla
      },
      error: (err) => {
        console.error('Error al registrar cita:', err);

        if (err.status === 409) {
          alert("Error: El horario seleccionado ya se encuentra ocupado.");
        } else {
          alert("No se pudo registrar la cita. Verifique los datos e intente nuevamente.");
        }
      }
    });
  }

  eliminarCita(id_cita: number, nombreCliente: string): void {
    const confirmar = confirm(`¿Estás seguro de cancelar la cita de ${nombreCliente}?`);
    if (confirmar) {
      this.http.delete(`${environment.apiUrl}/citas/${id_cita}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert("Cita cancelada y eliminada del sistema.");
          this.citas = this.citas.filter(c => c.id_cita !== id_cita);
          this.filtrarCitas();
        },
        error: (err) => console.error('Error al cancelar la cita:', err)
      });
    }
  }
}