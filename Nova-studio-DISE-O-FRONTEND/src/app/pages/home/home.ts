import { Component, OnInit, AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // <-- Importación agregada
import { environment } from '../../../environments/environment';
import { RouterLinkActive } from '@angular/router';

declare var particlesJS: any;
declare var AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  isMenuOpen: boolean = false;
  isModalOpen: boolean = false;
  modalImageSrc: string = '';
  videoActivado: boolean = false;

  usuarioLogeado: string | null = null;
  rolLogeado: string | null = null;

  // Variables para la galería dinámica
  trabajosCabello: any[] = [];
  trabajosCejas: any[] = [];
  trabajosUnas: any[] = [];
  cargandoGaleria: boolean = true;

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

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

  
  // Corregir y normalizar las URL de las imágenes
  private resolverUrlImagen(
    ruta: string | null | undefined
  ): string {
    if (!ruta || !ruta.trim()) {
      return '';
    }

    let valor = ruta.trim();

    // Extraer URL si fue guardada como enlace Markdown
    const enlaceMarkdown = valor.match(
      /^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/i
    );

    if (enlaceMarkdown) {
      valor = enlaceMarkdown[1];
    }

    valor = valor
      .replace(/\\&/g, '&')
      .replace(/&amp;/g, '&')
      .replace(/\\/g, '/');

    if (/^https?:\/\//i.test(valor)) {
      return valor;
    }

    valor = valor
      .replace(/^\/?public\/img\//i, '/img/')
      .replace(/^\/?assets\/img\//i, '/img/')
      .replace(/^\/?img\//i, '/img/');

    return valor.startsWith('/') ? valor : '/' + valor;
  }

  // Cargar los trabajos publicados en Home
  cargarGaleriaPublica(): void {
    this.cargandoGaleria = true;

    this.http.get<any[]>(
      `${environment.apiUrl}/publico/galeria`
    ).subscribe({
      next: (data) => {
        console.log('Galería recibida en Home:', data);

        // Adaptar los campos de PostgreSQL a los que utiliza home.html
        const trabajos = data.map((item: any) => ({
          id_trabajo: item.id_imagen,
          titulo: item.titulo,
          categoria: item.categoria,
          imgAntes: this.resolverUrlImagen(item.url_imagen),
          imgDespues: this.resolverUrlImagen(
            item.url_imagen_despues
          )
        }));

        this.trabajosCabello = trabajos.filter(
          t => t.categoria?.toLowerCase() === 'cabello'
        );

        this.trabajosUnas = trabajos.filter(
          t => t.categoria?.toLowerCase() === 'uñas'
        );

        this.trabajosCejas = trabajos.filter(
          t => t.categoria?.toLowerCase() === 'cejas'
        );

        this.cargandoGaleria = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al cargar galería en Home:', err);

        this.cargandoGaleria = false;
        this.trabajosCabello = [];
        this.trabajosUnas = [];
        this.trabajosCejas = [];

        this.cdr.detectChanges();
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