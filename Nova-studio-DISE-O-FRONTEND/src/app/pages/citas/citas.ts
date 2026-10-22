
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

interface HorarioCita {
  id_horario: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  id_especialista: number;
  especialista: string;
}

interface Cita {
  id_cita: number;
  id_servicio: number;
  id_horario: number;
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

  isModalOpen = false;
  isEditModalOpen = false;

  cargando = false;
  guardando = false;
  editando = false;

  hoy = new Date().toISOString().split('T')[0];

  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];

  listaClientes: ClienteCita[] = [];
  listaServicios: ServicioCita[] = [];
  listaHorarios: HorarioCita[] = [];

  horariosEdicion: HorarioCita[] = [];

  textoBusqueda = '';
  mensajeError = '';
  mensajeErrorEdicion = '';

  citaEnEdicion: Cita | null = null;

  nuevaCita = {
    id_usuario: null as number | null,
    id_servicio: null as number | null,
    fecha: '',
    id_horario: null as number | null
  };

  citaEditada = {
    id_servicio: null as number | null,
    fecha: '',
    id_horario: null as number | null,
    estado: 'Pendiente'
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

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  obtenerCitas(): void {
    this.cargando = true;

    this.http.get<any[]>(
      `${environment.apiUrl}/citas`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (respuesta) => {
        this.citas = (respuesta || []).map((item: any) => ({
          id_cita: Number(item.id_cita),
          id_servicio: Number(item.id_servicio),
          id_horario: Number(item.id_horario),
          fecha: item.fecha,
          hora: item.hora,
          cliente: item.cliente,
          servicio: item.servicio,
          estado: item.estado || 'Pendiente'
        }));

        this.filtrarCitas();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener citas:', error);
        this.mensajeError = 'No se pudieron cargar las citas.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerClientes(): void {
    this.http.get<ClienteCita[]>(
      `${environment.apiUrl}/clientes`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (respuesta) => {
        this.listaClientes = respuesta || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener clientes:', error);
      }
    });
  }

  obtenerServicios(): void {
    this.http.get<ServicioCita[]>(
      `${environment.apiUrl}/servicios`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (respuesta) => {
        this.listaServicios = respuesta || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener servicios:', error);
      }
    });
  }

  fechaCambiada(fecha: string): void {
    this.nuevaCita.fecha = fecha;
    this.nuevaCita.id_horario = null;
    this.listaHorarios = [];

    if (!fecha) {
      return;
    }

    this.http.get<HorarioCita[]>(
      `${environment.apiUrl}/horarios/disponibles?fecha=${encodeURIComponent(fecha)}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (respuesta) => {
        this.listaHorarios = respuesta || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener horarios:', error);
        this.mensajeError = 'No se pudieron cargar los horarios disponibles.';
        this.cdr.detectChanges();
      }
    });
  }

  filtrarCitas(): void {
    const busqueda = this.textoBusqueda.trim().toLowerCase();

    if (!busqueda) {
      this.citasFiltradas = [...this.citas];
      return;
    }

    this.citasFiltradas = this.citas.filter((cita) =>
      String(cita.id_cita).includes(busqueda) ||
      (cita.cliente || '').toLowerCase().includes(busqueda) ||
      (cita.servicio || '').toLowerCase().includes(busqueda) ||
      (cita.estado || '').toLowerCase().includes(busqueda) ||
      (cita.fecha || '').toLowerCase().includes(busqueda) ||
      (cita.hora || '').toLowerCase().includes(busqueda)
    );
  }

  abrirModal(): void {
    this.mensajeError = '';

    this.nuevaCita = {
      id_usuario: null,
      id_servicio: null,
      fecha: '',
      id_horario: null
    };

    this.listaHorarios = [];
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    if (this.guardando) {
      return;
    }

    this.isModalOpen = false;
    this.mensajeError = '';
  }

  guardarCita(event: Event): void {
    event.preventDefault();
    this.mensajeError = '';

    if (
      !this.nuevaCita.id_usuario ||
      !this.nuevaCita.id_servicio ||
      !this.nuevaCita.fecha ||
      !this.nuevaCita.id_horario
    ) {
      this.mensajeError = 'Completa todos los campos para registrar la cita.';
      return;
    }

    this.guardando = true;

    const datos = {
      id_usuario: Number(this.nuevaCita.id_usuario),
      id_servicio: Number(this.nuevaCita.id_servicio),
      fecha: this.nuevaCita.fecha,
      id_horario: Number(this.nuevaCita.id_horario)
    };

    this.http.post(
      `${environment.apiUrl}/citas`,
      datos,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.guardando = false;
        this.isModalOpen = false;
        this.obtenerCitas();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al registrar cita:', error);

        this.mensajeError =
          error?.error?.message ||
          error?.error?.error ||
          'No se pudo registrar la cita. Verifica el horario seleccionado.';

        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirEdicion(cita: Cita): void {
    this.mensajeErrorEdicion = '';
    this.citaEnEdicion = { ...cita };

    this.citaEditada = {
      id_servicio: Number(cita.id_servicio) || null,
      fecha: this.formatearFecha(cita.fecha),
      id_horario: Number(cita.id_horario) || null,
      estado: cita.estado || 'Pendiente'
    };

    this.horariosEdicion = [];
    this.isEditModalOpen = true;

    this.cargarHorariosEdicion(true);
  }

  cerrarEdicion(): void {
    if (this.editando) {
      return;
    }

    this.isEditModalOpen = false;
    this.citaEnEdicion = null;
    this.horariosEdicion = [];
    this.mensajeErrorEdicion = '';
  }

  fechaEdicionCambiada(fecha: string): void {
    this.citaEditada.fecha = fecha;
    this.citaEditada.id_horario = null;
    this.mensajeErrorEdicion = '';

    this.cargarHorariosEdicion(false);
  }

  cargarHorariosEdicion(conservarHorarioActual: boolean): void {
    if (!this.citaEditada.fecha) {
      this.horariosEdicion = [];
      return;
    }

    const fechaSolicitada = this.citaEditada.fecha;

    this.http.get<HorarioCita[]>(
      `${environment.apiUrl}/horarios/disponibles?fecha=${encodeURIComponent(fechaSolicitada)}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (respuesta) => {
        this.horariosEdicion = respuesta || [];

        if (
          conservarHorarioActual &&
          this.citaEnEdicion &&
          this.citaEditada.fecha === this.formatearFecha(this.citaEnEdicion.fecha)
        ) {
          const idHorarioActual = Number(this.citaEnEdicion.id_horario);

          const existe = this.horariosEdicion.some(
            (horario) => Number(horario.id_horario) === idHorarioActual
          );

          if (!existe && idHorarioActual) {
            this.horariosEdicion = [
              {
                id_horario: idHorarioActual,
                fecha: this.citaEditada.fecha,
                hora_inicio: this.citaEnEdicion.hora,
                hora_fin: '',
                id_especialista: 0,
                especialista: 'Horario actual'
              },
              ...this.horariosEdicion
            ];
          }

          this.citaEditada.id_horario = idHorarioActual || null;
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar horarios para edición:', error);
        this.mensajeErrorEdicion = 'No se pudieron cargar los horarios disponibles.';
        this.horariosEdicion = [];
        this.cdr.detectChanges();
      }
    });
  }

  guardarEdicion(event: Event): void {
    event.preventDefault();
    this.mensajeErrorEdicion = '';

    if (!this.citaEnEdicion) {
      this.mensajeErrorEdicion = 'No se encontró la cita que deseas modificar.';
      return;
    }

    if (
      !this.citaEditada.id_servicio ||
      !this.citaEditada.fecha ||
      !this.citaEditada.id_horario ||
      !this.citaEditada.estado
    ) {
      this.mensajeErrorEdicion = 'Completa todos los campos para guardar los cambios.';
      return;
    }

    this.editando = true;

    const datos = {
      id_servicio: Number(this.citaEditada.id_servicio),
      id_horario: Number(this.citaEditada.id_horario),
      estado: this.citaEditada.estado
    };

    this.http.put(
      `${environment.apiUrl}/citas/${this.citaEnEdicion.id_cita}`,
      datos,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.editando = false;
        this.isEditModalOpen = false;
        this.citaEnEdicion = null;
        this.obtenerCitas();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al modificar cita:', error);

        this.mensajeErrorEdicion =
          error?.error?.message ||
          error?.error?.error ||
          'No se pudo modificar la cita. Comprueba el horario y vuelve a intentarlo.';

        this.editando = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarCita(id_cita: number, nombreCliente: string): void {
    const confirmar = window.confirm(
      `¿Estás seguro de cancelar o eliminar la cita de ${nombreCliente}?`
    );

    if (!confirmar) {
      return;
    }

    this.guardando = true;

    this.http.delete(
      `${environment.apiUrl}/citas/${id_cita}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.guardando = false;
        this.obtenerCitas();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al eliminar cita:', error);
        window.alert(
          error?.error?.message ||
          error?.error?.error ||
          'No se pudo cancelar la cita.'
        );

        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private formatearFecha(fecha: string | Date | null | undefined): string {
    if (!fecha) {
      return '';
    }

    if (fecha instanceof Date) {
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${anio}-${mes}-${dia}`;
    }

    const valor = String(fecha);

    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
      return valor.slice(0, 10);
    }

    const fechaConvertida = new Date(valor);

    if (Number.isNaN(fechaConvertida.getTime())) {
      return '';
    }

    const anio = fechaConvertida.getFullYear();
    const mes = String(fechaConvertida.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaConvertida.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }
}
