import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para enlazar el formulario
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class ProductosComponent implements OnInit {
  isModalOpen: boolean = false;
  cargando: boolean = true;

  // Listas de datos
  productos: any[] = [];
  productosFiltrados: any[] = [];
  textoBusqueda: string = '';

  // Modelo reactivo para el modal (HU-04)
  nuevoProducto = {
    nombre: '',
    categoria: 'Cabello',
    precio: null,
    stock: null,
    desc: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerProductos(): void {
    this.cargando = true;
    this.http.get<any[]>(`${environment.apiUrl}/productos`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        // Mapeamos los datos y asignamos la clase de color según el stock
        this.productos = data.map(p => ({
          ...p,
          stockClass: this.calcularClaseStock(p.stock)
        }));
        this.productosFiltrados = this.productos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar inventario:', err);
        this.cargando = false;
      }
    });
  }

  // Lógica visual para la etiqueta de inventario
  calcularClaseStock(stock: number): string {
    if (stock === 0) return 'alert';    // Rojo
    if (stock <= 5) return 'warning';   // Amarillo
    return '';                          // Normal (Cian por defecto en tu CSS)
  }

  // Búsqueda en tiempo real
  filtrarProductos(): void {
    const busqueda = this.textoBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.productosFiltrados = this.productos;
      return;
    }
    this.productosFiltrados = this.productos.filter(p => 
      p.nombre?.toLowerCase().includes(busqueda)
    );
  }

  abrirModal(): void {
    this.isModalOpen = true;
    // Reseteamos el formulario
    this.nuevoProducto = { nombre: '', categoria: 'Cabello', precio: null, stock: null, desc: '' };
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  guardarProducto(event: Event): void {
    event.preventDefault();

    this.http.post(`${environment.apiUrl}/productos`, this.nuevoProducto, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("¡Producto registrado y añadido al inventario!");
        this.cerrarModal();
        this.obtenerProductos(); // Refrescamos la grilla para ver el nuevo producto
      },
      error: (err) => {
        console.error('Error al guardar producto:', err);
        alert('Ocurrió un error al intentar guardar en la base de datos.');
      }
    });
  }

  eliminarProducto(id: number, nombre: string): void {
    const confirmar = confirm(`¿Estás seguro de eliminar "${nombre}" del inventario?`);
    if (confirmar) {
      this.http.delete(`${environment.apiUrl}/productos/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          alert("Producto eliminado correctamente.");
          this.productos = this.productos.filter(p => p.id_producto !== id);
          this.filtrarProductos();
        },
        error: (err) => console.error('Error al eliminar producto:', err)
      });
    }
  }
}