import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importar para vincular el formulario
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var particlesJS: any;

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // <-- Añadir FormsModule
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class ContactoComponent implements OnInit, AfterViewInit {
  usuarioLogeado: string | null = null;
  rolLogeado: string | null = null;
  enviandoMensaje: boolean = false;

  // DTO para enviar el mensaje al servidor
  mensajeContacto = {
    nombre: '',
    correo: '',
    telefono: '',
    mensaje: ''
  };

  // Valores por defecto mientras responde la API
  config: any = {
    telefono: 'Cargando...',
    correo: 'Cargando...',
    direccion: 'Cargando...',
    instagram: '#',
    facebook: '#',
    tiktok: '#',
    whatsapp: '#'
  };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.usuarioLogeado = localStorage.getItem('usuario');
      this.rolLogeado = localStorage.getItem('rol');
    }
    
    // Al cargar la vista, consumimos el endpoint público para obtener los datos
    this.cargarDatosEmpresa();
  }

  ngAfterViewInit(): void {
    if (typeof particlesJS !== 'undefined') {
      particlesJS("particles-js", {
        particles: { number: { value: 250 }, size: { value: 2 }, color: { value: "#10efff" }, line_linked: { opacity: 0.1 } }
      });
    }
  }

  // Petición pública (sin JWT) para cargar los datos del local
  cargarDatosEmpresa(): void {
    // Asumimos que tienes este endpoint público abierto en tu SecurityConfig
    this.http.get<any>(`${environment.apiUrl}/publico/configuracion`).subscribe({
      next: (data) => {
        if (data) this.config = data;
      },
      error: (err) => console.error('Error al cargar datos de KIM STUDIO:', err)
    });
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.usuarioLogeado = null;
    this.rolLogeado = null;
    this.router.navigate(['/login']);
  }

  // Enviar el formulario al backend (para guardar en BD o enviar email)
  enviarMensaje(event: Event): void {
    event.preventDefault();
    this.enviandoMensaje = true;

    this.http.post(`${environment.apiUrl}/publico/mensajes`, this.mensajeContacto).subscribe({
      next: () => {
        alert('✨ ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
        this.enviandoMensaje = false;
        // Reseteamos el formulario
        this.mensajeContacto = { nombre: '', correo: '', telefono: '', mensaje: '' };
      },
      error: (err) => {
        console.error('Error enviando mensaje:', err);
        alert('Hubo un error al enviar tu mensaje. Por favor, intenta usar nuestras redes sociales.');
        this.enviandoMensaje = false;
      }
    });
  }
}