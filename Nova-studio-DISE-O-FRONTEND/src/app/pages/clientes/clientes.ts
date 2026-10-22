import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Cliente {
  id_usuario: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  citasTotales: number;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class ClientesComponent implements OnInit {

  // ESTADOS DEL COMPONENTE
  isModalOpen = false;
  cargando = true;
  guardando = false;
  editando = false;

  // ID DEL CLIENTE QUE SE ESTÁ EDITANDO
  clienteIdEditando: number | null = null;

  // LISTAS DE CLIENTES
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];

  // BÚSQUEDA Y MENSAJES
  textoBusqueda = '';
  mensajeError = '';

  // FORMULARIO
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

  // INICIALIZAR COMPONENTE
  ngOnInit(): void {
    this.obtenerClientes();
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

  // OBTENER CLIENTES
  obtenerClientes(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.http.get<Cliente[]>(
      `${environment.apiUrl}/clientes`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        const registros = Array.isArray(data) ? data : [];

        this.clientes = registros.map((cliente) => ({
          ...cliente,
          id_usuario: Number(cliente.id_usuario),
          nombre: cliente.nombre ?? '',
          correo: cliente.correo ?? '',
          telefono: cliente.telefono ?? '',
          citasTotales: Math.max(
            0,
            Number(cliente.citasTotales) || 0
          )
        }));

        this.filtrarClientes();
        this.cargando = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al obtener clientes:', err);

        this.clientes = [];
        this.clientesFiltrados = [];

        this.mensajeError =
          'No se pudieron cargar los clientes. Comprueba la conexión con el servidor.';

        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // BUSCAR Y FILTRAR CLIENTES
  filtrarClientes(): void {
    const busqueda = this.textoBusqueda
      .toLowerCase()
      .trim();

    if (!busqueda) {
      this.clientesFiltrados = [...this.clientes];
      return;
    }

    this.clientesFiltrados = this.clientes.filter((cliente) => {
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

  // ABRIR FORMULARIO PARA REGISTRAR
  abrirModal(): void {
    if (this.guardando) {
      return;
    }

    this.editando = false;
    this.clienteIdEditando = null;

    this.nuevoCliente = {
      nombre: '',
      correo: '',
      telefono: '',
      notas: ''
    };

    this.mensajeError = '';
    this.isModalOpen = true;
  }

  // ABRIR FORMULARIO PARA EDITAR
  editarCliente(cliente: Cliente): void {
    if (this.guardando) {
      return;
    }

    console.log('Editar cliente:', cliente);

    this.editando = true;
    this.clienteIdEditando = Number(cliente.id_usuario);

    this.nuevoCliente = {
      nombre: cliente.nombre ?? '',
      correo: cliente.correo ?? '',
      telefono: cliente.telefono ?? '',
      notas: ''
    };

    this.mensajeError = '';
    this.isModalOpen = true;

    this.cdr.detectChanges();
  }

  // CERRAR FORMULARIO
  cerrarModal(): void {
    if (this.guardando) {
      return;
    }

    this.isModalOpen = false;
    this.mensajeError = '';
    this.editando = false;
    this.clienteIdEditando = null;

    this.nuevoCliente = {
      nombre: '',
      correo: '',
      telefono: '',
      notas: ''
    };
  }

  // REGISTRAR O ACTUALIZAR CLIENTE
  guardarCliente(event: Event): void {
    event.preventDefault();

    if (this.guardando) {
      return;
    }

    const payload = {
      nombre: this.nuevoCliente.nombre.trim(),
      correo: this.nuevoCliente.correo.trim(),
      telefono: this.nuevoCliente.telefono.trim()
    };

    // VALIDAR CAMPOS OBLIGATORIOS
    if (
      !payload.nombre ||
      !payload.correo ||
      !payload.telefono
    ) {
      this.mensajeError =
        'Completa el nombre, correo y teléfono.';
      return;
    }

    // VALIDAR FORMATO BÁSICO DEL CORREO
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(payload.correo)) {
      this.mensajeError =
        'Ingresa un correo electrónico válido.';
      return;
    }

    // DETERMINAR SI ES REGISTRO O EDICIÓN
    const esEdicion =
      this.editando &&
      this.clienteIdEditando !== null;

    if (esEdicion && (!this.clienteIdEditando || this.clienteIdEditando <= 0)) {
      this.mensajeError =
        'No se ha identificado correctamente al cliente que deseas editar.';
      return;
    }

    // PREPARAR PETICIÓN HTTP
    const peticion = esEdicion
      ? this.http.put(
          `${environment.apiUrl}/clientes/${this.clienteIdEditando}`,
          payload,
          { headers: this.getHeaders() }
        )
      : this.http.post(
          `${environment.apiUrl}/clientes`,
          payload,
          { headers: this.getHeaders() }
        );

    this.guardando = true;
    this.mensajeError = '';

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.isModalOpen = false;

        this.editando = false;
        this.clienteIdEditando = null;

        this.nuevoCliente = {
          nombre: '',
          correo: '',
          telefono: '',
          notas: ''
        };

        this.cdr.detectChanges();

        window.alert(
          esEdicion
            ? 'Cliente actualizado correctamente.'
            : 'Cliente registrado correctamente.'
        );

        this.obtenerClientes();
      },

      error: (err) => {
        console.error('Error al guardar cliente:', err);

        this.guardando = false;

        if (err.status === 401 || err.status === 403) {
          this.mensajeError =
            'No tienes permiso para realizar esta operación. Comprueba tu sesión y tus permisos.';
        } else if (err.status === 404 && esEdicion) {
          this.mensajeError =
            'No se encontró el cliente que intentas actualizar. Recarga la lista e inténtalo otra vez.';
        } else {
          this.mensajeError =
            err.error?.mensaje ||
            (esEdicion
              ? 'No se pudo actualizar el cliente.'
              : 'No se pudo registrar el cliente.');
        }

        this.cdr.detectChanges();
      }
    });
  }

  // ELIMINAR CLIENTE
  eliminarCliente(id: number, nombre: string): void {
    if (this.guardando) {
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de eliminar el registro de ${nombre}? Esta acción no se puede deshacer.`
    );

    if (!confirmar) {
      return;
    }

    this.http.delete(
      `${environment.apiUrl}/clientes/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.clientes = this.clientes.filter(
          (cliente) =>
            Number(cliente.id_usuario) !== Number(id)
        );

        this.filtrarClientes();
        this.cdr.detectChanges();

        window.alert('Cliente eliminado correctamente.');
      },

      error: (err) => {
        console.error('Error al eliminar cliente:', err);

        window.alert(
          err.error?.mensaje ||
          'No se pudo eliminar el cliente.'
        );
      }
    });
  }
}