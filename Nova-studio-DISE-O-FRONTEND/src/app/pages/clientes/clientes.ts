import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerClientes();
  }

  // ==============================
  // CABECERAS HTTP
  // ==============================

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('token');

      if (token) {
        headers = headers.set(
          'Authorization',
          `Bearer ${token}`
        );
      }
    }

    return headers;
  }

  // ==============================
  // OBTENER CLIENTES
  // ==============================

  obtenerClientes(): void {
    this.cargando = true;

    this.http.get<any[]>(
      `${environment.apiUrl}/clientes`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        const registros = Array.isArray(data) ? data : [];

        // Normalizar el total de citas para la plantilla
        this.clientes = registros.map((cliente: any) => {
          const total = Number(cliente.citasTotales ?? 0);

          return {
            ...cliente,
            citasTotales: Number.isFinite(total) && total >= 0
              ? total
              : 0
          };
        });

        this.filtrarClientes();
        this.cargando = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al obtener clientes:', err);

        this.clientes = [];
        this.clientesFiltrados = [];
        this.cargando = false;

        this.cdr.detectChanges();
      }
    });
  }

  // ==============================
  // FILTRAR CLIENTES
  // ==============================

  filtrarClientes(): void {
    const busqueda = this.textoBusqueda
      .toLowerCase()
      .trim();

    if (!busqueda) {
      this.clientesFiltrados = [...this.clientes];
      return;
    }

    this.clientesFiltrados = this.clientes.filter((cliente: any) => {
      const nombre = String(cliente.nombre ?? '').toLowerCase();
      const correo = String(cliente.correo ?? '').toLowerCase();
      const telefono = String(cliente.telefono ?? '').toLowerCase();

      return (
        nombre.includes(busqueda) ||
        correo.includes(busqueda) ||
        telefono.includes(busqueda)
      );
    });
  }

  // ==============================
  // ABRIR MODAL
  // ==============================

  abrirModal(): void {
    this.nuevoCliente = {
      nombre: '',
      correo: '',
      telefono: '',
      notas: ''
    };

    this.isModalOpen = true;
  }

  // ==============================
  // CERRAR MODAL
  // ==============================

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  // ==============================
  // REGISTRAR CLIENTE
  // ==============================

  guardarCliente(event: Event): void {
    event.preventDefault();

    this.http.post(
      `${environment.apiUrl}/clientes`,
      this.nuevoCliente,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        window.alert(
          '¡Cliente registrado exitosamente en la base de datos!'
        );

        this.cerrarModal();
        this.obtenerClientes();
      },

      error: (err) => {
        console.error('Error al registrar cliente:', err);

        const mensajeBackend = err.error?.mensaje;

        if (err.status === 400) {
          window.alert(
            mensajeBackend ||
            'Error de validación. Verifica los datos ingresados.'
          );
        } else {
          window.alert(
            mensajeBackend ||
            'No se pudo completar el registro. Intenta de nuevo.'
          );
        }
      }
    });
  }

  // ==============================
  // ELIMINAR CLIENTE
  // ==============================

  eliminarCliente(id: number, nombre: string): void {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar el registro de ${nombre}? ` +
      'Esta acción no se puede deshacer.'
    );

    if (!confirmar) {
      return;
    }

    this.http.delete<any>(
      `${environment.apiUrl}/clientes/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        window.alert('Registro de cliente eliminado.');

        this.clientes = this.clientes.filter(
          (cliente: any) =>
            Number(cliente.id_usuario) !== Number(id)
        );

        this.filtrarClientes();
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al eliminar cliente:', err);

        const mensaje =
          err.error?.mensaje ||
          'No se pudo eliminar el cliente.';

        window.alert(mensaje);
      }
    });
  }
}