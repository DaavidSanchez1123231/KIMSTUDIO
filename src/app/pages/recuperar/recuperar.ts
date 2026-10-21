import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var particlesJS: any;

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css'
})
export class RecuperarComponent implements OnInit {
  
  email: string = '';
  mensaje: string = '';
  mensajeColor: string = '';
  cargando: boolean = false; // Nueva bandera para controlar la UI

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (typeof particlesJS !== 'undefined') {
      particlesJS("particles-js", {
        particles: {
          number: { value: 150 },
          size: { value: 2 },
          color: { value: "#68b2a8" },
          line_linked: { enable: true, opacity: 0.1 },
          move: { speed: 2 }
        }
      });
    }
  }

  enviarEnlace(event: Event): void {
    event.preventDefault();

    if (this.email.trim() === "") {
      this.mensajeColor = "red";
      this.mensaje = "Ingresa un correo válido";
      return;
    }

    this.cargando = true;
    this.mensajeColor = "#68b2a8";
    this.mensaje = "Validando correo y generando enlace...";

    // Consumimos el endpoint público de Spring Boot
    this.http.post(`${environment.apiUrl}/publico/recuperar-password`, { email: this.email }).subscribe({
      next: () => {
        this.mensajeColor = "#68b2a8";
        this.mensaje = "✔ Revisa tu bandeja de entrada: " + this.email;
        this.cargando = false;
        this.email = ''; // Limpiamos el input por seguridad
      },
      error: (err) => {
        console.error('Error al recuperar contraseña:', err);
        this.mensajeColor = "red";
        this.cargando = false;

        // Validaciones dinámicas basadas en las respuestas HTTP de tu backend
        if (err.status === 404) {
          this.mensaje = "No encontramos ninguna cuenta registrada con este correo.";
        } else {
          this.mensaje = "Hubo un problema de conexión. Inténtalo más tarde.";
        }
      }
    });
  }
}