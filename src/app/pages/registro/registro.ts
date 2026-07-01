import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var particlesJS: any;

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent implements OnInit {
  
  nombre: string = '';
  correo: string = '';
  telefono: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  mostrarError: boolean = false;
  mensajeError: string = ''; // Mensaje dinámico para mostrar fallos del servidor
  cargando: boolean = false;

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (typeof particlesJS !== 'undefined') {
      particlesJS("particles-js", {
        particles: {
          number: { value: 250 },
          size: { value: 2 },
          color: { value: "#68b2a8" }, 
          line_linked: { opacity: 0.1 }
        }
      });
    }
  }

  registrar(event: Event): void {
    event.preventDefault();
    this.mostrarError = false;
    this.mensajeError = '';

    // Validación estricta en el front-end
    if (this.password !== this.confirmPassword) {
      this.mostrarError = true;
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.password.length < 6) {
      this.mostrarError = true;
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.cargando = true;

    // Estructura del JSON que espera el controlador de Spring Boot
    const payloadRegistro = {
      nombre: this.nombre,
      email: this.correo,
      telefono: this.telefono,
      password: this.password,
      rol: 'cliente' // Forzamos el rol desde el frontend por seguridad de la UI
    };

    // Llamada al endpoint público (asegúrate de que en SecurityConfig esté permitido)
    this.http.post(`${environment.apiUrl}/usuarios/registro`, payloadRegistro).subscribe({
      next: () => {
        alert("Cuenta creada correctamente ✨. Ahora puedes iniciar sesión.");
        this.cargando = false;
        // Redirigimos al usuario al login para que genere su token JWT real
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error durante el registro:', err);
        this.cargando = false;
        this.mostrarError = true;
        
        // Manejo amigable de errores comunes (Ej: Correo ya existe)
        if (err.status === 409) {
          this.mensajeError = 'Este correo electrónico ya está registrado.';
        } else {
          this.mensajeError = 'Ocurrió un error en el servidor. Inténtalo más tarde.';
        }
      }
    });
  }
}