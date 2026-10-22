import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VERSION_POLITICAS } from '../../legal/legal-data';

declare const particlesJS: any;

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

  aceptaPrivacidad: boolean = false;
  aceptaTerminos: boolean = false;
  aceptaMarketing: boolean = false;

  mostrarError: boolean = false;
  mensajeError: string = '';
  cargando: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: {
            value: 250
          },
          size: {
            value: 2
          },
          color: {
            value: '#68b2a8'
          },
          line_linked: {
            opacity: 0.1
          }
        }
      });
    }
  }

  registrar(event: Event): void {
    event.preventDefault();

    if (this.cargando) {
      return;
    }

    this.mostrarError = false;
    this.mensajeError = '';

    // Validar nombre
    if (!this.nombre.trim()) {
      this.mostrarError = true;
      this.mensajeError = 'Ingresa tu nombre completo.';
      return;
    }

    // Validar correo
    const correoNormalizado = this.correo.trim().toLowerCase();

    if (!correoNormalizado) {
      this.mostrarError = true;
      this.mensajeError = 'Ingresa tu correo electrónico.';
      return;
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correoNormalizado)) {
      this.mostrarError = true;
      this.mensajeError = 'Ingresa un correo electrónico válido.';
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.password !== this.confirmPassword) {
      this.mostrarError = true;
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }

    // Validar longitud de la contraseña
    if (this.password.length < 8) {
      this.mostrarError = true;
      this.mensajeError =
        'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.password.length > 72) {
      this.mostrarError = true;
      this.mensajeError =
        'La contraseña no puede superar 72 caracteres.';
      return;
    }

    // Validar aceptación de políticas y términos
    if (!this.aceptaPrivacidad) {
      this.mostrarError = true;
      this.mensajeError =
        'Debes aceptar la política de privacidad para continuar.';
      return;
    }

    if (!this.aceptaTerminos) {
      this.mostrarError = true;
      this.mensajeError =
        'Debes aceptar los términos y condiciones para continuar.';
      return;
    }

    this.cargando = true;

    // Datos enviados al backend de Spring Boot
    const payloadRegistro = {
      nombre: this.nombre.trim(),
      email: correoNormalizado,
      telefono: this.telefono.trim(),
      password: this.password,
      aceptaPrivacidad: this.aceptaPrivacidad,
      aceptaTerminos: this.aceptaTerminos,
      aceptaMarketing: this.aceptaMarketing,
      fechaConsentimiento: new Date().toISOString(),
      versionPoliticas: VERSION_POLITICAS,
      rol: 'cliente'
    };

    // Registrar usuario
    this.http
      .post(
        `${environment.apiUrl}/usuarios/registro`,
        payloadRegistro
      )
      .subscribe({
        next: () => {
          this.cargando = false;

          alert(
            'Cuenta creada correctamente. Ahora puedes iniciar sesión.'
          );

          this.router.navigate(['/login']);
        },

        error: (err) => {
          console.error('Error durante el registro:', err);

          this.cargando = false;
          this.mostrarError = true;

          // Intentar mostrar el mensaje que devuelve el backend
          const respuesta = err.error;

          const mensajeBackend =
            typeof respuesta === 'string'
              ? respuesta
              : respuesta?.mensaje || respuesta?.message;

          if (mensajeBackend) {
            this.mensajeError = mensajeBackend;
          } else if (err.status === 400) {
            this.mensajeError =
              'Los datos enviados no son válidos. Verifica la información.';
          } else if (err.status === 401 || err.status === 403) {
            this.mensajeError =
              'El servidor rechazó la solicitud. Revisa la configuración de acceso.';
          } else if (err.status === 404) {
            this.mensajeError =
              'No se encontró el endpoint de registro. Verifica la ruta del backend.';
          } else if (err.status === 409) {
            this.mensajeError =
              'Este correo electrónico ya está registrado.';
          } else if (err.status === 0) {
            this.mensajeError =
              'No se pudo conectar con el servidor. Verifica que el backend esté iniciado.';
          } else if (err.status === 500) {
            this.mensajeError =
              'El servidor no pudo completar el registro. Revisa la consola del backend.';
          } else {
            this.mensajeError =
              `No se pudo registrar la cuenta (HTTP ${err.status}).`;
          }

          this.cdr.detectChanges();
        }
      });
  }
}