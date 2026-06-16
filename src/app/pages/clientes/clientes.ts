import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class ClientesComponent implements OnInit {
  isModalOpen: boolean = false;
  cargando: boolean = true;
  

  clientes: any[] = []; 
  clientesFiltrados: any[] = []; 
  textoBusqueda: string = '';

  nuevoCliente = {
    nombre: '',
    correo: '',
    telefono: '',
    notas: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerClientes();
  }


  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerClientes(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/clientes`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.clientes = data;
        this.clientesFiltrados = data; 
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
        this.cargando = false;
      }
    });
  }

  filtrarClientes(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.clientesFiltrados = this.clientes;
      return;
    }
    this.clientesFiltrados = this.clientes.filter(c => 
      c.nombre?.toLowerCase().includes(busqueda) ||
      c.correo?.toLowerCase().includes(busqueda) ||
      c.telefono?.includes(busqueda)
    );
  }

  abrirModal(): void {
    this.isModalOpen = true;
 
    this.nuevoCliente = { nombre: '', correo: '', telefono: '', notas: '' };
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  guardarCliente(event: Event): void {
    event.preventDefault();

    this.http.post(`${environment.apiUrl}/clientes`, this.nuevoCliente, { headers: this.getHeaders() }).subscribe({
      next: (response: any) => {
        alert("¡Cliente registrado exitosamente en la base de datos!");
        this.cerrarModal();
        this.obtenerClientes(); 
      },
      error: (err) => {
        console.error('Error al registrar cliente:', err);
        if (err.status === 400) {
          alert("Error de validación: El número de teléfono ya se encuentra registrado."); 
        } else {
          alert("No se pudo completar el registro. Intente de nuevo.");
        }
      }
    });
  }

  eliminarCliente(id: number, nombre: string): void {
    const confirmar = confirm(`¿Estás seguro de eliminar el registro de ${nombre}? Esta acción no se puede deshacer.`);
    if (confirmar) {
      this.http.delete<any>(`${environment.apiUrl}/clientes/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert("Registro de cliente eliminado.");
          this.clientes = this.clientes.filter(c => c.id_usuario !== id);
          this.filtrarClientes();
        },
        error: (err) => {
          // Muestra el mensaje real del backend (ej: "tiene 3 citas registradas")
          const msg = err.error?.mensaje || "No se pudo eliminar el cliente.";
          alert(msg);
        }
      });
    }
}
}