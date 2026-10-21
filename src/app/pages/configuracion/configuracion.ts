import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class ConfiguracionComponent implements OnInit {
  
  // Objeto reactivo para los datos de la empresa
  empresa = {
    nombre: '',
    telefono: '',
    direccion: '',
    instagram: '',
    facebook: ''
  };

  // Variables para la seguridad
  usuario: string = '';
  nuevaClave: string = '';
  confirmarClave: string = '';
  mostrarError: boolean = false;
  mensajeServidor: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Recuperamos el nombre de usuario de la sesión actual
    this.usuario = localStorage.getItem('usuario') || 'Usuario Desconocido';
    this.cargarDatosEmpresa();
  }

  // Generador de cabeceras seguras para peticiones a Spring Boot
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  cargarDatosEmpresa(): void {
    this.http.get<any>(`${environment.apiUrl}/configuracion/empresa`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        // Si el backend devuelve datos, los mapeamos. Si no, dejamos valores por defecto.
        if (data) this.empresa = data;
      },
      error: (err) => console.error('Error al cargar la configuración de la empresa', err)
    });
  }

  guardarDatosEmpresa(event: Event): void {
    event.preventDefault();
    
    // Enviamos el objeto 'empresa' a tu backend para persistencia en SQL Server
    this.http.put(`${environment.apiUrl}/configuracion/empresa`, this.empresa, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("¡Los datos informativos de NOVA Beauty Salon se han actualizado correctamente!");
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert("Error al actualizar los datos. Verifique su conexión.");
      }
    });
  }

  cambiarContrasena(event: Event): void {
    event.preventDefault();
    this.mostrarError = false;
    this.mensajeServidor = '';
    
    // Validación de coincidencia en frontend antes de gastar recursos de red
    if (this.nuevaClave !== this.confirmarClave) {
      this.mostrarError = true;
      this.mensajeServidor = 'Las contraseñas no coinciden.';
      return;
    } 

    if (this.nuevaClave.length < 6) {
      this.mostrarError = true;
      this.mensajeServidor = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Armamos el payload con la nueva clave para enviarla al servidor
    const payload = {
      usuario: this.usuario,
      nuevaContrasenia: this.nuevaClave
    };

    // Petición a Spring Boot. (Asegúrate de que tu Backend use PasswordEncoder de BCrypt aquí)
    this.http.put(`${environment.apiUrl}/usuarios/cambiar-password`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        alert("¡Contraseña administrativa actualizada! Recuerda usar tu nueva clave en el siguiente inicio de sesión.");
        this.nuevaClave = '';
        this.confirmarClave = '';
      },
      error: (err) => {
        console.error(err);
        this.mostrarError = true;
        this.mensajeServidor = 'Error al actualizar la contraseña en el servidor.';
      }
    });
  }
}