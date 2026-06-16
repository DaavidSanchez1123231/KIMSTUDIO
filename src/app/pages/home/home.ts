import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // <-- Importación agregada
import { environment } from '../../../environments/environment';

declare var particlesJS: any;
declare var AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  isMenuOpen: boolean = false;
  isModalOpen: boolean = false;
  modalImageSrc: string = '';

  usuarioLogeado: string | null = null;
  rolLogeado: string | null = null;

  // Variables para la galería dinámica
  trabajosCabello: any[] = [];
  trabajosCejas: any[] = [];
  trabajosUnas: any[] = [];
  cargandoGaleria: boolean = true;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.usuarioLogeado = localStorage.getItem('usuario');
      this.rolLogeado = localStorage.getItem('rol');
    }
    
    // Al cargar la página principal, obtenemos los trabajos publicados
    this.cargarGaleriaPublica();
  }

  ngAfterViewInit(): void {
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 1000 });
    }
    
    if (typeof particlesJS !== 'undefined') {
      particlesJS("particles-js", {
        particles: {
          number: { value: 80 },
          size: { value: 2 },
          color: { value: "#00ffff" },
          line_linked: { opacity: 0.1 }
        }
      });
    }
  }

  // Petición pública al servidor para traer las imágenes subidas por los admins
  cargarGaleriaPublica(): void {
    this.http.get<any[]>(`${environment.apiUrl}/publico/galeria`).subscribe({
        next: (data) => {
            // ← cambia categoriaId por categoria (nombre real de la columna en BD)
            this.trabajosCabello = data.filter(t => t.categoria === 'cabello');
            this.trabajosUnas    = data.filter(t => t.categoria === 'uñas');
            this.trabajosCejas   = data.filter(t => t.categoria === 'cejas');
            this.cargandoGaleria = false;
        },
        error: () => {
            this.cargandoGaleria = false;
            this.trabajosCabello = [];
            this.trabajosUnas = [];
            this.trabajosCejas = [];
        }
    });
}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  abrirModal(src: string): void {
    this.modalImageSrc = src;
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    localStorage.removeItem('token');
    this.usuarioLogeado = null;
    this.rolLogeado = null;
    this.router.navigate(['/login']);
  }
}