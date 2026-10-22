
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Producto {
  id_producto: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  desc?: string;
  descripcion?: string;
  imagen_url?: string;
  imagenFallida?: boolean;
  estado?: boolean;
  stockClass?: string;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class ProductosComponent implements OnInit {

  isModalOpen = false;
  cargando = true;
  guardando = false;
  editandoProducto = false;

  idProductoEnEdicion: number | null = null;

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  textoBusqueda = '';

  nuevoProducto = {
    nombre: '',
    categoria: 'Cabello',
    precio: null as number | null,
    stock: null as number | null,
    desc: '',
    imagen_url: ''
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ==========================================
  // LISTAR PRODUCTOS
  // ==========================================

  obtenerProductos(): void {
    this.cargando = true;

    this.http.get<Producto[]>(
      `${environment.apiUrl}/productos`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.productos = (data || []).map(p => ({
          ...p,
          desc: p.desc ?? p.descripcion ?? '',
          imagen_url: (p.imagen_url ?? '').trim(),
          imagenFallida: false,
          stockClass: this.calcularClaseStock(Number(p.stock))
        }));

        this.filtrarProductos();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.cargando = false;
        this.cdr.detectChanges();

        alert('No se pudieron cargar los productos. Revisa el backend.');
      }
    });
  }

  // ==========================================
  // CLASIFICAR STOCK
  // ==========================================

  calcularClaseStock(stock: number): string {
    if (stock === 0) return 'alert';
    if (stock <= 5) return 'warning';
    return '';
  }

  // ==========================================
  // BUSCAR PRODUCTOS
  // ==========================================

  filtrarProductos(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();

    if (!busqueda) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productosFiltrados = this.productos.filter(p =>
      p.nombre?.toLowerCase().includes(busqueda) ||
      p.categoria?.toLowerCase().includes(busqueda) ||
      p.desc?.toLowerCase().includes(busqueda)
    );
  }

  // ==========================================
  // ABRIR FORMULARIO NUEVO
  // ==========================================

  abrirModal(): void {
    if (this.guardando) return;

    this.editandoProducto = false;
    this.idProductoEnEdicion = null;

    this.nuevoProducto = {
      nombre: '',
      categoria: 'Cabello',
      precio: null,
      stock: null,
      desc: '',
      imagen_url: ''
    };

    this.isModalOpen = true;
  }

  // ==========================================
  // EDITAR PRODUCTO
  // ==========================================

  editarProducto(producto: Producto): void {
    if (this.guardando) return;

    this.editandoProducto = true;
    this.idProductoEnEdicion = producto.id_producto;

    this.nuevoProducto = {
      nombre: producto.nombre ?? '',
      categoria: producto.categoria ?? 'Cabello',
      precio: Number(producto.precio),
      stock: Number(producto.stock),
      desc: producto.desc ?? producto.descripcion ?? '',
      imagen_url: producto.imagen_url ?? ''
    };

    this.isModalOpen = true;
  }

  // ==========================================
  // CERRAR FORMULARIO
  // ==========================================

  cerrarModal(): void {
    if (this.guardando) return;

    this.isModalOpen = false;
    this.editandoProducto = false;
    this.idProductoEnEdicion = null;
  }

  // ==========================================
  // REGISTRAR O ACTUALIZAR
  // ==========================================

  guardarProducto(event: Event): void {
    event.preventDefault();

    if (this.guardando) return;

    const nombre = this.nuevoProducto.nombre.trim();
    const categoria = this.nuevoProducto.categoria.trim();
    const precio = Number(this.nuevoProducto.precio);
    const stock = Number(this.nuevoProducto.stock);

    if (
      !nombre ||
      !categoria ||
      this.nuevoProducto.precio === null ||
      this.nuevoProducto.stock === null ||
      !Number.isFinite(precio) ||
      !Number.isFinite(stock)
    ) {
      alert('Completa todos los campos obligatorios.');
      return;
    }

    if (precio < 0 || stock < 0 || !Number.isInteger(stock)) {
      alert('El precio debe ser no negativo y el stock un entero no negativo.');
      return;
    }

    if (nombre.length > 100 || categoria.length > 50) {
      alert('El nombre admite hasta 100 caracteres y la categoría hasta 50.');
      return;
    }

    if (this.nuevoProducto.desc.trim().length > 255) {
      alert('La descripción no puede superar los 255 caracteres.');
      return;
    }

    if (
      this.editandoProducto &&
      this.idProductoEnEdicion === null
    ) {
      alert('No se identificó el producto que deseas modificar.');
      return;
    }

    const productoEnviar = {
      nombre,
      categoria,
      precio,
      stock,
      desc: this.nuevoProducto.desc.trim(),
      imagen_url: this.nuevoProducto.imagen_url.trim()
    };

    const esEdicion = this.editandoProducto;
    const mensajeExito = esEdicion
      ? 'Producto modificado correctamente.'
      : 'Producto registrado correctamente.';

    const peticion = esEdicion
      ? this.http.put(
          `${environment.apiUrl}/productos/${this.idProductoEnEdicion}`,
          productoEnviar,
          { headers: this.getHeaders() }
        )
      : this.http.post(
          `${environment.apiUrl}/productos`,
          productoEnviar,
          { headers: this.getHeaders() }
        );

    this.guardando = true;

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.isModalOpen = false;
        this.editandoProducto = false;
        this.idProductoEnEdicion = null;

        this.obtenerProductos();
        this.cdr.detectChanges();

        alert(mensajeExito);
      },
      error: (error) => {
        console.error('Error al guardar producto:', error);

        const mensaje =
          error?.error?.mensaje ||
          (esEdicion
            ? 'No se pudo modificar el producto. Verifica el endpoint PUT.'
            : 'No se pudo registrar el producto. Revisa el backend.');

        this.guardando = false;
        this.cdr.detectChanges();

        alert(mensaje);
      }
    });
  }

  // ==========================================
  // ERROR DE IMAGEN EN LA TARJETA
  // ==========================================

  imagenProductoError(producto: Producto): void {
    producto.imagenFallida = true;
    this.cdr.detectChanges();
  }

  // ==========================================
  // ERROR DE IMAGEN EN LA VISTA PREVIA
  // ==========================================

  imagenPreviewError(event: Event): void {
    const imagen = event.target as HTMLImageElement;
    imagen.style.display = 'none';
  }

  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================

  eliminarProducto(id: number, nombre: string): void {
    const confirmar = confirm(
      `¿Estás seguro de eliminar "${nombre}" del inventario?`
    );

    if (!confirmar) return;

    this.http.delete(
      `${environment.apiUrl}/productos/${id}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.productos = this.productos.filter(
          p => p.id_producto !== id
        );

        this.filtrarProductos();
        this.cdr.detectChanges();

        alert('Producto eliminado correctamente.');
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);

        alert(
          error?.error?.mensaje ||
          'No se pudo eliminar el producto.'
        );
      }
    });
  }
}
