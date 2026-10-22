
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

  obtenerProductos(): void {
    this.cargando = true;

    this.http.get<Producto[]>(
      `${environment.apiUrl}/productos`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.productos = data.map(p => ({
          ...p,
          desc: p.desc ?? p.descripcion ?? '',
          imagen_url: p.imagen_url ?? '',
          stockClass: this.calcularClaseStock(Number(p.stock))
        }));

        this.filtrarProductos();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar inventario:', err);
        this.cargando = false;
        alert('No se pudo cargar el inventario. Revisa el backend.');
        this.cdr.detectChanges();
      }
    });
  }

  calcularClaseStock(stock: number): string {
    if (stock === 0) return 'alert';
    if (stock <= 5) return 'warning';
    return '';
  }

  filtrarProductos(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();

    if (!busqueda) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.productosFiltrados = this.productos.filter(p =>
      p.nombre?.toLowerCase().includes(busqueda) ||
      p.categoria?.toLowerCase().includes(busqueda)
    );
  }

  abrirModal(): void {
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

  cerrarModal(): void {
    if (!this.guardando) {
      this.isModalOpen = false;
    }
  }

  guardarProducto(event: Event): void {
    event.preventDefault();

    if (this.guardando) return;

    if (
      !this.nuevoProducto.nombre.trim() ||
      !this.nuevoProducto.categoria ||
      this.nuevoProducto.precio === null ||
      this.nuevoProducto.stock === null
    ) {
      alert('Completa los campos obligatorios.');
      return;
    }

    if (this.nuevoProducto.precio < 0 || this.nuevoProducto.stock < 0) {
      alert('El precio y el stock no pueden ser negativos.');
      return;
    }

    const productoEnviar = {
      nombre: this.nuevoProducto.nombre.trim(),
      categoria: this.nuevoProducto.categoria,
      precio: this.nuevoProducto.precio,
      stock: this.nuevoProducto.stock,
      desc: this.nuevoProducto.desc.trim(),
      imagen_url: this.nuevoProducto.imagen_url.trim()
    };

    this.guardando = true;

    this.http.post(
      `${environment.apiUrl}/productos`,
      productoEnviar,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.guardando = false;
        this.isModalOpen = false;
        alert('¡Producto registrado correctamente!');
        this.obtenerProductos();
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al guardar producto:', err);

        const mensaje = err.error?.mensaje ||
          'No se pudo guardar el producto. Revisa el backend y la base de datos.';

        alert(mensaje);
      }
    });
  }

  imagenError(event: Event): void {
    const imagen = event.target as HTMLImageElement;
    imagen.style.display = 'none';
  }

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
        alert('Producto eliminado correctamente.');

        this.productos = this.productos.filter(
          p => p.id_producto !== id
        );

        this.filtrarProductos();
      },
      error: (err) => {
        console.error('Error al eliminar producto:', err);
        alert('No se pudo eliminar el producto.');
      }
    });
  }
}
