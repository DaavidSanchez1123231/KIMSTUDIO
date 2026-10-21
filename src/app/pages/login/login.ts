import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

declare var particlesJS: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  
  // Variables del formulario
  usuario: string = ''; 
  pass: string = '';    
  
  // Control de interfaz
  mostrarError: boolean = false;
  errorMensaje: string = '';
  cargando: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    // Si ya hay un token activo, lo mandamos directo al dashboard
    if (typeof window !== 'undefined' && window.localStorage && localStorage.getItem('token')) {
      const rol = localStorage.getItem('rol');
      if (rol === 'admin' || rol === 'recepcion' || rol === 'cajero') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  ngAfterViewInit(): void {
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

  iniciarSesion(event: Event): void {
    event.preventDefault();
    this.cargando = true;
    this.mostrarError = false;

    // Emparejamos exactamente con lo que espera el loginDTO en Java
    const payloadLogin = {
      email: this.usuario,
      password: this.pass
    };

    this.http.post<any>(`${environment.apiUrl}/usuarios/login`, payloadLogin).subscribe({
      next: (res) => {
        this.cargando = false;
        
        // ¡LOGIN EXITOSO! Guardamos las credenciales en la bóveda del navegador
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', res.nombre);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('id_usuario', res.id_usuario.toString());

        if (res.rol === 'admin' || res.rol === 'recepcion' || res.rol === 'cajero') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']); // Si es cliente, va al home principal
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mostrarError = true;
        

        if (err.error && err.error.mensaje) {
          this.errorMensaje = err.error.mensaje;
        } else {
          this.errorMensaje = "Ocurrió un error al intentar conectar con el servidor.";
        }
        console.error('Fallo de Autenticación:', err);
      }
    });
  }
}