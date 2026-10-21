import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/sidebar/sidebar';
import { TopbarComponent } from './shared/topbar/topbar';
import { HomeComponent } from './pages/home/home';
import { CookieBannerComponent } from './shared/cookie-banner/cookie-banner';

const PUBLICAS = ['/', '/login', '/crear-cuenta', '/recuperar', '/reservas', '/nuestros-servicios', '/promociones-publico',
  '/nosotros', '/contacto', '/politica-privacidad', '/terminos-condiciones', '/politica-cookies', '/politica-reembolsos'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CommonModule, HomeComponent, CookieBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'nova-beauty-salon';
  constructor(public router: Router) {}
  get esInicio(): boolean { return this.ruta === '/'; }
  get esPublica(): boolean { return PUBLICAS.includes(this.ruta); }
  private get ruta(): string { return this.router.url.split(/[?#]/)[0]; }
}
