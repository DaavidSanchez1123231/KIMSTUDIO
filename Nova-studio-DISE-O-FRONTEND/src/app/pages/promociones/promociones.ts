import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface PromocionApi {
  id_promocion: number;
  nombre: string;
  descuento: number;
  codigo: string;
  fecha_expiracion: string;
  descripcion: string | null;
  estado: boolean | string;
}

interface PromocionVista extends PromocionApi {
  descuentoTexto: string;
  fechaFormateada: string;
  expirada: boolean;
  estadoTexto: string;
  claseEstado: 'active' | 'disable';
}

interface PromocionFormulario {
  nombre: string;
  descuento: number | null;
  codigo: string;
  fecha_expiracion: string;
  descripcion: string;
}

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promociones.html',
  styleUrl: './promociones.css'
})
export class PromocionesComponent implements OnInit {
  isModalOpen = false;
  modoEdicion = false;
  guardandoPromo = false;
  cargando = true;
  errorCarga = '';
  errorFormulario = '';
  idPromocionEditando: number | null = null;

  promociones: PromocionVista[] = [];
  promosFiltradas: PromocionVista[] = [];
  textoBusqueda = '';

  nuevaPromo: PromocionFormulario = this.formularioVacio();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerPromociones();
  }

  private formularioVacio(): PromocionFormulario {
    return {
      nombre: '',
      descuento: null,
      codigo: '',
      fecha_expiracion: '',
      descripcion: ''
    };
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = typeof localStorage !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private mensajeError(error: any, predeterminado: string): string {
    return error?.error?.mensaje
      || error?.error?.message
      || error?.message
      || predeterminado;
  }

  private fechaHoyISO(): string {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private normalizarFecha(fecha: unknown): string {
    const valor = String(fecha ?? '').trim();
    const iso = valor.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      return iso;
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

  formatearFecha(fecha: string): string {
    const iso = this.normalizarFecha(fecha);
    if (!iso) {
      return 'Fecha no válida';
    }

    const [anio, mes, dia] = iso.split('-');
    const etiqueta = iso < this.fechaHoyISO() ? 'Venció:' : 'Vence:';
    return `${etiqueta} ${dia}/${mes}/${anio}`;
  }

  obtenerPromociones(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.http.get<PromocionApi[]>(
      `${environment.apiUrl}/promociones`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        const filas = Array.isArray(data) ? data : [];
        const hoy = this.fechaHoyISO();

        this.promociones = filas.map((promo) => {
          const fecha = this.normalizarFecha(promo.fecha_expiracion);
          const expirada = Boolean(fecha) && fecha < hoy;

          return {
            ...promo,
            nombre: String(promo.nombre ?? '').trim(),
            codigo: String(promo.codigo ?? '').trim(),
            descuento: Number(promo.descuento),
            fecha_expiracion: fecha,
            descripcion: String(promo.descripcion ?? ''),
            descuentoTexto: `-${Number(promo.descuento)}%`,
            fechaFormateada: this.formatearFecha(fecha),
            expirada,
            estadoTexto: expirada ? 'Finalizado' : 'Vigente',
            claseEstado: expirada ? 'disable' : 'active'
          };
        });

        this.filtrarPromos();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar promociones:', error);
        this.promociones = [];
        this.promosFiltradas = [];
        this.errorCarga = this.mensajeError(
          error,
          'No se pudieron cargar las promociones. Verifica tu sesión y la conexión con el servidor.'
        );
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPromos(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.promosFiltradas = [...this.promociones];
      return;
    }

    this.promosFiltradas = this.promociones.filter((promo) =>
      `${promo.nombre} ${promo.codigo} ${promo.descripcion ?? ''}`
        .toLowerCase()
        .includes(busqueda)
    );
  }

  abrirModal(): void {
    this.modoEdicion = false;
    this.idPromocionEditando = null;
    this.nuevaPromo = this.formularioVacio();
    this.errorFormulario = '';
    this.isModalOpen = true;
  }

  editarPromo(promo: PromocionVista): void {
    this.modoEdicion = true;
    this.idPromocionEditando = promo.id_promocion;
    this.nuevaPromo = {
      nombre: promo.nombre,
      descuento: promo.descuento,
      codigo: promo.codigo,
      fecha_expiracion: promo.fecha_expiracion,
      descripcion: promo.descripcion ?? ''
    };
    this.errorFormulario = '';
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    if (this.guardandoPromo) {
      return;
    }
    this.isModalOpen = false;
    this.errorFormulario = '';
  }

  guardarPromo(event: Event): void {
    event.preventDefault();
    if (this.guardandoPromo) {
      return;
    }

    const payload: PromocionFormulario = {
      nombre: this.nuevaPromo.nombre.trim(),
      descuento: this.nuevaPromo.descuento === null
        ? null
        : Number(this.nuevaPromo.descuento),
      codigo: this.nuevaPromo.codigo.trim().toUpperCase(),
      fecha_expiracion: this.normalizarFecha(this.nuevaPromo.fecha_expiracion),
      descripcion: this.nuevaPromo.descripcion.trim()
    };

    if (!payload.nombre) {
      this.errorFormulario = 'Ingresa el nombre de la promoción.';
      return;
    }
    if (payload.nombre.length > 100) {
      this.errorFormulario = 'El nombre no puede superar los 100 caracteres.';
      return;
    }
    if (payload.descuento === null || !Number.isInteger(payload.descuento)
        || payload.descuento < 1 || payload.descuento > 100) {
      this.errorFormulario = 'El descuento debe ser un número entero entre 1 y 100.';
      return;
    }
    if (!/^[A-Z0-9_-]{1,50}$/.test(payload.codigo)) {
      this.errorFormulario = 'El código debe usar solo letras, números, guion o guion bajo (máximo 50 caracteres).';
      return;
    }
    if (!payload.fecha_expiracion) {
      this.errorFormulario = 'Selecciona una fecha de vencimiento válida.';
      return;
    }
    if (payload.fecha_expiracion < this.fechaHoyISO()) {
      this.errorFormulario = 'La fecha de vencimiento no puede estar en el pasado.';
      return;
    }
    if (!payload.descripcion) {
      this.errorFormulario = 'Ingresa una descripción de la promoción.';
      return;
    }
    if (payload.descripcion.length > 255) {
      this.errorFormulario = 'La descripción no puede superar los 255 caracteres.';
      return;
    }

    this.errorFormulario = '';
    this.guardandoPromo = true;

    const solicitud = this.modoEdicion && this.idPromocionEditando !== null
      ? this.http.put(
          `${environment.apiUrl}/promociones/${this.idPromocionEditando}`,
          payload,
          { headers: this.getHeaders() }
        )
      : this.http.post(
          `${environment.apiUrl}/promociones`,
          payload,
          { headers: this.getHeaders() }
        );

    solicitud.subscribe({
      next: (respuesta: any) => {
        const mensaje = respuesta?.mensaje || (
          this.modoEdicion
            ? 'Promoción actualizada correctamente.'
            : 'Promoción creada correctamente.'
        );

        this.guardandoPromo = false;
        this.isModalOpen = false;
        alert(mensaje);
        this.obtenerPromociones();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al guardar la promoción:', error);
        this.errorFormulario = this.mensajeError(
          error,
          'No se pudo guardar la promoción. Revisa los datos e inténtalo nuevamente.'
        );
        this.guardandoPromo = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarPromo(id: number, nombre: string): void {
    const confirmar = confirm(
      `¿Estás seguro de dar de baja la promoción "${nombre}"?`
    );
    if (!confirmar) {
      return;
    }

    this.http.delete<any>(
      `${environment.apiUrl}/promociones/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (respuesta) => {
        this.promociones = this.promociones.filter(
          (promo) => promo.id_promocion !== id
        );
        this.filtrarPromos();
        alert(respuesta?.mensaje || 'Promoción dada de baja correctamente.');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al dar de baja la promoción:', error);
        alert(this.mensajeError(error, 'No se pudo eliminar la promoción.'));
      }
    });
  }
}
