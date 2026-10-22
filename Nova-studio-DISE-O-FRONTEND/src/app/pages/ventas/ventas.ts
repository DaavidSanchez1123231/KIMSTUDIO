
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type TipoVenta = 'servicio' | 'producto';

interface ClienteVenta {
  id_usuario: number;
  nombre: string;
  correo?: string;
}

interface ProductoVenta {
  id_producto: number;
  nombre: string;
  categoria?: string;
  precio: number;
  stock: number;
}

interface ServicioVenta {
  id_servicio: number;
  nombre: string;
  precio: number;
  duracion_minutos?: number;
}

interface Venta {
  id_venta: number;
  boleta: string;
  fecha: string;
  cliente: string;
  detalle: string;
  tipo: TipoVenta;
  metodo: string;
  total: number;
  estado: 'completada' | 'anulada';
  motivo?: string;
  fecha_anulacion?: string;
}

interface NuevaVenta {
  id_cliente: number | null;
  tipo: TipoVenta;
  metodo: string;
  id_servicio: number | null;
  id_producto: number | null;
  cantidad: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class VentasComponent implements OnInit {

  isModalOpen = false;
  cargando = true;
  guardandoVenta = false;
  errorCatalogos = false;

  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  textoBusqueda = '';

  clientes: ClienteVenta[] = [];
  productos: ProductoVenta[] = [];
  servicios: ServicioVenta[] = [];

  metricas = {
    totalCaja: 0,
    porServicios: 0,
    porProductos: 0
  };

  nuevaVenta: NuevaVenta = this.formularioInicial();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerVentas();
    this.cargarMetricasHoy();
    this.cargarClientes();
    this.cargarProductos();
    this.cargarServicios();
  }

  private formularioInicial(): NuevaVenta {
    return {
      id_cliente: null,
      tipo: 'servicio',
      metodo: 'Yape',
      id_servicio: null,
      id_producto: null,
      cantidad: 1
    };
  }

  // ==========================================
  // AUTORIZACIÓN
  // ==========================================

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const token = localStorage.getItem('token');

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ==========================================
  // CARGAR CLIENTES
  // ==========================================

  cargarClientes(): void {
    this.http.get<ClienteVenta[]>(
      `${environment.apiUrl}/clientes`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: data => {
        this.clientes = data || [];
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar clientes:', error);
        this.errorCatalogos = true;
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // CARGAR PRODUCTOS
  // ==========================================

  cargarProductos(): void {
    this.http.get<ProductoVenta[]>(
      `${environment.apiUrl}/productos`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: data => {
        this.productos = (data || []).map(producto => ({
          ...producto,
          precio: Number(producto.precio),
          stock: Number(producto.stock)
        }));

        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar productos para ventas:', error);
        this.errorCatalogos = true;
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // CARGAR SERVICIOS
  // ==========================================

  cargarServicios(): void {
    this.http.get<ServicioVenta[]>(
      `${environment.apiUrl}/servicios`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: data => {
        this.servicios = (data || []).map(servicio => ({
          ...servicio,
          precio: Number(servicio.precio)
        }));

        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar servicios para ventas:', error);
        this.errorCatalogos = true;
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // OBTENER ELEMENTOS SELECCIONADOS
  // ==========================================

  get servicioSeleccionado(): ServicioVenta | undefined {
    return this.servicios.find(
      servicio => servicio.id_servicio === this.nuevaVenta.id_servicio
    );
  }

  get productoSeleccionado(): ProductoVenta | undefined {
    return this.productos.find(
      producto => producto.id_producto === this.nuevaVenta.id_producto
    );
  }

  // ==========================================
  // CALCULAR TOTAL ESTIMADO
  // El servidor vuelve a calcularlo al guardar.
  // ==========================================

  get totalEstimado(): number {
    if (this.nuevaVenta.tipo === 'servicio') {
      return this.servicioSeleccionado?.precio || 0;
    }

    const producto = this.productoSeleccionado;

    if (!producto) {
      return 0;
    }

    const cantidad = Number(this.nuevaVenta.cantidad);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return 0;
    }

    return producto.precio * cantidad;
  }

  // ==========================================
  // CAMBIAR ENTRE SERVICIO Y PRODUCTO
  // ==========================================

  cambioTipoVenta(): void {
    this.nuevaVenta.id_servicio = null;
    this.nuevaVenta.id_producto = null;
    this.nuevaVenta.cantidad = 1;
    this.cdr.detectChanges();
  }

  // ==========================================
  // LISTAR VENTAS
  // ==========================================

  obtenerVentas(): void {
    this.cargando = true;

    this.http.get<Venta[]>(
      `${environment.apiUrl}/ventas`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: data => {
        this.ventas = (data || []).map(venta => ({
          ...venta,
          total: Number(venta.total),
          estado: venta.estado || 'completada'
        }));

        this.filtrarVentas();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar las ventas:', error);
        this.cargando = false;
        this.cdr.detectChanges();
        alert('No se pudo cargar el historial de ventas.');
      }
    });
  }

  // ==========================================
  // MÉTRICAS DE CAJA
  // ==========================================

  cargarMetricasHoy(): void {
    this.http.get<any>(
      `${environment.apiUrl}/ventas/metricas-hoy`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: data => {
        this.metricas = {
          totalCaja: Number(data?.totalCaja || 0),
          porServicios: Number(data?.porServicios || 0),
          porProductos: Number(data?.porProductos || 0)
        };

        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al cargar las métricas:', error);
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // BUSCAR VENTAS
  // ==========================================

  filtrarVentas(): void {
    const busqueda = this.textoBusqueda
      .toLowerCase()
      .trim();

    if (!busqueda) {
      this.ventasFiltradas = [...this.ventas];
      return;
    }

    this.ventasFiltradas = this.ventas.filter(venta =>
      venta.boleta?.toLowerCase().includes(busqueda) ||
      venta.cliente?.toLowerCase().includes(busqueda) ||
      venta.detalle?.toLowerCase().includes(busqueda) ||
      venta.metodo?.toLowerCase().includes(busqueda) ||
      venta.estado?.toLowerCase().includes(busqueda) ||
      venta.tipo?.toLowerCase().includes(busqueda)
    );
  }

  // ==========================================
  // ABRIR Y CERRAR MODAL
  // ==========================================

  abrirModal(): void {
    if (this.guardandoVenta) {
      return;
    }

    this.nuevaVenta = this.formularioInicial();
    this.errorCatalogos = false;
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    if (this.guardandoVenta) {
      return;
    }

    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  // ==========================================
  // REGISTRAR VENTA
  // ==========================================

  registrarVenta(event: Event): void {
    event.preventDefault();

    if (this.guardandoVenta) {
      return;
    }

    if (
      this.nuevaVenta.tipo === 'servicio' &&
      !this.nuevaVenta.id_servicio
    ) {
      alert('Selecciona un servicio.');
      return;
    }

    if (this.nuevaVenta.tipo === 'producto') {
      const producto = this.productoSeleccionado;

      if (!producto) {
        alert('Selecciona un producto.');
        return;
      }

      const cantidad = Number(this.nuevaVenta.cantidad);

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        alert('La cantidad debe ser un entero mayor que cero.');
        return;
      }

      if (cantidad > producto.stock) {
        alert(
          `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles.`
        );
        return;
      }
    }

    if (this.totalEstimado <= 0) {
      alert('El importe de la venta debe ser mayor que cero.');
      return;
    }

    const payload = {
      id_cliente: this.nuevaVenta.id_cliente,
      tipo: this.nuevaVenta.tipo,
      metodo: this.nuevaVenta.metodo,
      id_servicio: this.nuevaVenta.tipo === 'servicio'
        ? this.nuevaVenta.id_servicio
        : null,
      id_producto: this.nuevaVenta.tipo === 'producto'
        ? this.nuevaVenta.id_producto
        : null,
      cantidad: this.nuevaVenta.tipo === 'producto'
        ? Number(this.nuevaVenta.cantidad)
        : null
    };

    this.guardandoVenta = true;

    this.http.post<any>(
      `${environment.apiUrl}/ventas`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: respuesta => {
        const totalRegistrado = Number(
          respuesta?.total ?? this.totalEstimado
        );

        this.guardandoVenta = false;
        this.isModalOpen = false;

        this.obtenerVentas();
        this.cargarMetricasHoy();
        this.cargarProductos();

        alert(
          `${respuesta?.mensaje || 'Venta registrada correctamente.'}\n` +
          `Comprobante: VTA-${String(respuesta?.id_venta || '').padStart(4, '0')}\n` +
          `Total: S/ ${totalRegistrado.toFixed(2)}`
        );

        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error al registrar la venta:', error);

        this.guardandoVenta = false;
        this.cdr.detectChanges();

        alert(
          error?.error?.mensaje ||
          'No se pudo registrar la venta. Revisa el backend y la base de datos.'
        );
      }
    });
  }

  // ==========================================
  // ANULAR VENTA Y DEVOLVER STOCK SI CORRESPONDE
  // ==========================================

  anularVenta(idVenta: number, numeroBoleta: string): void {
    const confirmar = confirm(
      `¿Deseas anular el comprobante ${numeroBoleta}? ` +
      'La venta se conservará en el historial. ' +
      'Si contiene productos, se devolverán al stock.'
    );

    if (!confirmar) {
      return;
    }

    const motivo = prompt(
      'Escribe el motivo de la anulación:'
    );

    if (motivo === null) {
      return;
    }

    if (!motivo.trim()) {
      alert('Debes indicar un motivo para anular la venta.');
      return;
    }

    this.http.post(
      `${environment.apiUrl}/ventas/${idVenta}/anular`,
      { motivo: motivo.trim() },
      { headers: this.getHeaders() }
    ).subscribe({
      next: respuesta => {
        alert(
          (respuesta as any)?.mensaje ||
          'Venta anulada correctamente.'
        );

        this.obtenerVentas();
        this.cargarMetricasHoy();
        this.cargarProductos();
      },
      error: error => {
        console.error('Error al anular la venta:', error);

        alert(
          error?.error?.mensaje ||
          'No se pudo anular la venta.'
        );
      }
    });
  }

  // ==========================================
  // IMPRIMIR COMPROBANTE
  // ==========================================

  imprimirComprobante(venta: Venta): void {
    const ventana = window.open(
      '',
      '_blank',
      'width=720,height=760'
    );

    if (!ventana) {
      alert(
        'El navegador bloqueó la ventana de impresión. ' +
        'Permite las ventanas emergentes para este sitio.'
      );
      return;
    }

    const escapar = (valor: unknown): string =>
      String(valor ?? '').replace(/[&<>"']/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[caracter] as string);

    const fecha = new Date(venta.fecha).toLocaleString();

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${escapar(venta.boleta)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 650px;
            margin: 30px auto;
            padding: 24px;
            color: #222;
          }
          header {
            text-align: center;
            border-bottom: 2px solid #222;
            padding-bottom: 15px;
          }
          h1 { margin-bottom: 6px; }
          .muted { color: #666; }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 9px 0;
            border-bottom: 1px solid #ddd;
          }
          .total {
            margin-top: 16px;
            font-size: 1.3rem;
            font-weight: bold;
          }
          .cancelada {
            margin-top: 20px;
            padding: 12px;
            border: 1px solid #a00;
            color: #a00;
          }
          footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
          }
          @media print {
            body { margin: 0 auto; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>NOVA BEAUTY SALON</h1>
          <p>Comprobante de venta</p>
          <strong>${escapar(venta.boleta)}</strong>
        </header>

        <div class="row">
          <span>Fecha</span>
          <span>${escapar(fecha)}</span>
        </div>
        <div class="row">
          <span>Cliente</span>
          <span>${escapar(venta.cliente || 'Público General')}</span>
        </div>
        <div class="row">
          <span>Concepto</span>
          <span>${escapar(venta.detalle)}</span>
        </div>
        <div class="row">
          <span>Método de pago</span>
          <span>${escapar(venta.metodo)}</span>
        </div>
        <div class="row total">
          <span>Total</span>
          <span>S/ ${Number(venta.total).toFixed(2)}</span>
        </div>

        ${
          venta.estado === 'anulada'
            ? `<div class="cancelada">
                 <strong>VENTA ANULADA</strong><br>
                 Motivo: ${escapar(venta.motivo || 'No especificado')}
               </div>`
            : ''
        }

        <footer>
          Este documento es un comprobante interno del sistema.
        </footer>
      </body>
      </html>
    `;

    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }
}
