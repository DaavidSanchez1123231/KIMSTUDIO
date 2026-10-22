import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface EmpresaConfiguracion {
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  instagram: string;
  facebook: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class ConfiguracionComponent implements OnInit {

  // Información pública de NOVA Beauty Salon.
  empresa: EmpresaConfiguracion = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
    instagram: '',
    facebook: ''
  };

  // Variables de seguridad.
  usuario: string = '';
  nuevaClave: string = '';
  confirmarClave: string = '';

  mostrarError: boolean = false;
  mensajeServidor: string = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuario =
      localStorage.getItem('usuario') || 'Usuario Desconocido';

    this.cargarDatosEmpresa();
  }

  // Cabeceras para las peticiones a Spring Boot.
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    return headers;
  }

  // =====================================================
  // CARGAR INFORMACIÓN DE LA EMPRESA
  // =====================================================

  cargarDatosEmpresa(): void {
    this.http.get<any>(
      `${environment.apiUrl}/configuracion/empresa`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        if (!data) {
          return;
        }

        this.empresa = {
          nombre: data.nombre ?? '',
          telefono: data.telefono ?? '',

          // Admite diferentes nombres del campo de correo
          // en la respuesta del backend.
          correo:
            data.correo ??
            data.correoContacto ??
            data.correo_contacto ??
            '',

          direccion: data.direccion ?? '',
          instagram: data.instagram ?? '',
          facebook: data.facebook ?? ''
        };

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(
          'Error al cargar la configuración de la empresa:',
          err
        );
      }
    });
  }

  // =====================================================
  // GUARDAR INFORMACIÓN DE LA EMPRESA
  // =====================================================

  guardarDatosEmpresa(event: Event): void {
    event.preventDefault();

    const payload: EmpresaConfiguracion = {
      nombre: this.empresa.nombre.trim(),
      telefono: this.empresa.telefono.trim(),
      correo: this.empresa.correo.trim(),
      direccion: this.empresa.direccion.trim(),
      instagram: this.empresa.instagram.trim(),
      facebook: this.empresa.facebook.trim()
    };

    this.http.put(
      `${environment.apiUrl}/configuracion/empresa`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        this.empresa = { ...payload };

        alert(
          '¡Los datos de NOVA Beauty Salon se han actualizado correctamente!'
        );

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(
          'Error al actualizar los datos de la empresa:',
          err
        );

        alert(
          'No se pudieron actualizar los datos. Verifica la conexión e inténtalo nuevamente.'
        );
      }
    });
  }

  // =====================================================
  // CAMBIAR CONTRASEÑA
  // =====================================================

  cambiarContrasena(event: Event): void {
    event.preventDefault();

    this.mostrarError = false;
    this.mensajeServidor = '';

    // Validar que ambas contraseñas coincidan.
    if (this.nuevaClave !== this.confirmarClave) {
      this.mostrarError = true;
      this.mensajeServidor = 'Las contraseñas no coinciden.';
      return;
    }

    // Validar longitud mínima.
    if (this.nuevaClave.length < 6) {
      this.mostrarError = true;
      this.mensajeServidor =
        'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Datos que recibe el endpoint existente.
    const payload = {
      usuario: this.usuario,
      nuevaContrasenia: this.nuevaClave
    };

    this.http.put(
      `${environment.apiUrl}/usuarios/cambiar-password`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        alert(
          '¡Contraseña administrativa actualizada correctamente! Utiliza la nueva contraseña en tu próximo inicio de sesión.'
        );

        this.nuevaClave = '';
        this.confirmarClave = '';
        this.mostrarError = false;
        this.mensajeServidor = '';

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(
          'Error al actualizar la contraseña:',
          err
        );
        this.mostrarError = true;

        this.mensajeServidor =
          err?.error?.message ||
          err?.error?.mensaje ||
          'Error al actualizar la contraseña en el servidor.';

        this.cdr.detectChanges();
      }
    });
  }
}