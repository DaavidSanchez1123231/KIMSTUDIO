import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ClienteCita {
  id_usuario: number;
  nombre: string;
  correo?: string;
}

interface ServicioCita {
  id_servicio: number;
  nombre: string;
  precio?: number;
  duracion_minutos?: number;
}

interface Cita {
  id_cita: number;
  fecha: string;
  hora: string;
  cliente: string;
  servicio: string;
  estado: string;
}

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class CitasComponent implements OnInit {

  // ESTADOS
  isModalOpen = false;
  cargando = true;
  cargandoClientes = false;
  cargandoServicios = false;
  guardando = false;

  // LISTAS
  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  listaClientes: ClienteCita[] = [];
  listaServicios: ServicioCita[] = [];

  // BÚSQUEDA Y MENSAJES
  textoBusqueda = '';
  mensajeError = '';

  // FORMULARIO DE CITA
  nuevaCita: {
    id_usuario: number | null;
    id_servicio: number | null;
    fecha: string;
    hora: string;
  } = {
    id_usuario: null,
    id_servicio: null,
    fecha: '',
    hora: ''
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerCitas();
    this.obtenerClientes();
    this.obtenerServicios();
  }

  // CABECERAS HTTP
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

  // OBTENER CITAS
  obtenerCitas(): void {
    this.cargando = true;

    this.http.get<Cita[]>(
      `${environment.apiUrl}/citas`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.citas = (Array.isArray(data) ? data : []).map(
          (cita: any) => ({
            ...cita,
            id_cita: Number(cita.id_cita),
            cliente: String(
              cita.cliente ?? cita.nombre_cliente ?? ''
            ),
            servicio: String(
              cita.servicio ?? cita.nombre_servicio ?? ''
            ),
            estado: String(cita.estado ?? 'Pendiente')
          })
        );

        this.filtrarCitas();
        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al obtener citas:', err);

        this.citas = [];
        this.citasFiltradas = [];
        this.cargando = false;

        this.cdr.detectChanges();
      }
    });
  }

  // OBTENER CLIENTES REGISTRADOS
  obtenerClientes(): void {
    this.cargandoClientes = true;

    this.http.get<ClienteCita[]>(
      `${environment.apiUrl}/clientes`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.listaClientes = (Array.isArray(data) ? data : [])
          .filter((cliente) =>
            Number(cliente.id_usuario) > 0 &&
            Boolean(cliente.nombre)
          )
          .map((cliente) => ({
            ...cliente,
            id_usuario: Number(cliente.id_usuario)
          }));

        this.cargandoClientes = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar clientes:', err);

        this.listaClientes = [];
        this.cargandoClientes = false;

        this.cdr.detectChanges();
      }
    });
  }

  // OBTENER SERVICIOS ACTIVOS
  obtenerServicios(): void {
    this.cargandoServicios = true;

    this.http.get<ServicioCita[]>(
      `${environment.apiUrl}/servicios`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.listaServicios = (Array.isArray(data) ? data : [])
          .filter((servicio) =>
            Number(servicio.id_servicio) > 0 &&
            Boolean(servicio.nombre)
          )
          .map((servicio) => ({
            ...servicio,
            id_servicio: Number(servicio.id_servicio)
          }));

        this.cargandoServicios = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar servicios:', err);

        this.listaServicios = [];
        this.cargandoServicios = false;

        this.cdr.detectChanges();
      }
    });
  }

  // BUSCAR CITAS POR CLIENTE O SERVICIO
  filtrarCitas(): void {
    const busqueda = this.textoBusqueda
      .toLowerCase()
      .trim();

    if (!busqueda) {
      this.citasFiltradas = [...this.citas];
      return;
    }

    this.citasFiltradas = this.citas.filter((cita) => {
      const cliente = String(cita.cliente ?? '').toLowerCase();
      const servicio = String(cita.servicio ?? '').toLowerCase();

      return (
        cliente.includes(busqueda) ||
        servicio.includes(busqueda)
      );
    });
  }

  // ABRIR FORMULARIO
  abrirModal(): void {
    if (this.guardando) {
      return;
    }

    this.nuevaCita = {
      id_usuario: null,
      id_servicio: null,
      fecha: '',
      hora: ''
    };

    this.mensajeError = '';
    this.isModalOpen = true;

    // Actualizar catálogos al abrir el formulario.
    this.obtenerClientes();
    this.obtenerServicios();
  }

  // CERRAR FORMULARIO
  cerrarModal(): void {
    if (this.guardando) {
      return;
    }

    this.isModalOpen = false;
    this.mensajeError = '';

    this.nuevaCita = {
      id_usuario: null,
      id_servicio: null,
      fecha: '',
      hora: ''
    };
  }

  // REGISTRAR CITA CON CLIENTE Y SERVICIO
  guardarCita(event: Event): void {
    event.preventDefault();

    if (this.guardando) {
      return;
    }

    if (
      this.nuevaCita.id_usuario === null ||
      this.nuevaCita.id_servicio === null ||
      !this.nuevaCita.fecha ||
      !this.nuevaCita.hora
    ) {
      this.mensajeError =
        'Selecciona un cliente, un servicio, una fecha y una hora.';
      return;
    }

    const payload = {
      id_usuario: Number(this.nuevaCita.id_usuario),
      id_servicio: Number(this.nuevaCita.id_servicio),
      fecha: this.nuevaCita.fecha,
      hora: this.nuevaCita.hora
    };

    this.guardando = true;
    this.mensajeError = '';

    this.http.post(
      `${environment.apiUrl}/citas`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.guardando = false;
        this.isModalOpen = false;

        this.cdr.detectChanges();

        window.alert('¡Cita registrada correctamente!');

        this.obtenerCitas();
      },

      error: (err) => {
        console.error('Error al registrar cita:', err);

        this.guardando = false;

        this.mensajeError =
          err.error?.mensaje ||
          (err.status === 401 || err.status === 403
            ? 'No tienes permiso para registrar citas. Comprueba tu sesión.'
            : 'No se pudo registrar la cita. Revisa la fecha, la hora y los datos seleccionados.');

        this.cdr.detectChanges();
      }
    });
  }

  // CANCELAR / ELIMINAR CITA
  eliminarCita(id_cita: number, nombreCliente: string): void {
    if (this.guardando) {
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de cancelar la cita de ${nombreCliente}?`
    );

    if (!confirmar) {
      return;
    }

    this.http.delete(
      `${environment.apiUrl}/citas/${id_cita}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.citas = this.citas.filter(
          (cita) => cita.id_cita !== Number(id_cita)
        );

        this.filtrarCitas();
        this.cdr.detectChanges();

        window.alert('Cita cancelada correctamente.');
      },

      error: (err) => {
        console.error('Error al cancelar cita:', err);

        window.alert(
          err.error?.mensaje ||
          'No se pudo cancelar la cita.'
        );
      }
    });
  }
}