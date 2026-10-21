import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DOCS, EMPRESA } from '../../legal/legal-data';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="legal-page">
    <header><a routerLink="/" class="brand">{{ empresa.nombre }}</a><a routerLink="/" class="back">← Volver al inicio</a></header>
    <nav class="tabs">
      @for (l of links; track l.ruta) { <a [routerLink]="l.ruta" [class.on]="l.tipo === tipo">{{ l.txt }}</a> }
    </nav>
    <article>
      <h1>{{ doc.titulo }}</h1>
      <p class="upd">Última actualización: {{ doc.actualizado }}</p>
      @for (s of doc.secciones; track s.t) {
        <h2>{{ s.t }}</h2>
        @for (p of s.p; track p) { <p>{{ p }}</p> }
      }
      @if (tipo === 'cookies') { <button (click)="cambiarCookies()">Cambiar mi preferencia de cookies</button> }
    </article>
  </div>`,
  styles: [`
  .legal-page{min-height:100vh;padding:24px 5vw 60px;background:#0a0a0a;color:#fff;font-family:'Montserrat',sans-serif}
  header{display:flex;justify-content:space-between;align-items:center;max-width:860px;margin:0 auto 18px}
  .brand{font:700 1.3rem 'Playfair Display',serif;color:#68b2a8;text-decoration:none}.back{color:#888;text-decoration:none;font-size:.9rem}
  .tabs{display:flex;flex-wrap:wrap;gap:8px;max-width:860px;margin:0 auto 22px}
  .tabs a{padding:7px 14px;border:1px solid #333;border-radius:20px;color:#bbb;text-decoration:none;font-size:.85rem}
  .tabs a.on{background:#68b2a8;color:#0a0a0a;border-color:#68b2a8}
  article{max-width:860px;margin:auto;background:rgba(20,20,20,.9);border:1px solid #262626;border-radius:16px;padding:28px}
  h1{font:700 1.9rem 'Playfair Display',serif;margin:0 0 4px}.upd{color:#888;font-size:.85rem;margin-bottom:10px}
  h2{font-size:1.05rem;color:#68b2a8;margin:22px 0 6px}p{line-height:1.65;color:#ddd;font-size:.95rem;margin:6px 0}
  button{margin-top:22px;background:#68b2a8;color:#0a0a0a;border:0;border-radius:10px;padding:10px 18px;font:600 .9rem 'Montserrat',sans-serif;cursor:pointer}
  `],
})
export class LegalComponent {
  empresa = EMPRESA;
  tipo: string = inject(ActivatedRoute).snapshot.data['tipo'];
  doc = DOCS[this.tipo];
  links = [
    { tipo: 'privacidad', ruta: '/politica-privacidad', txt: 'Privacidad' },
    { tipo: 'terminos', ruta: '/terminos-condiciones', txt: 'Términos y condiciones' },
    { tipo: 'cookies', ruta: '/politica-cookies', txt: 'Cookies' },
    { tipo: 'reembolsos', ruta: '/politica-reembolsos', txt: 'Reembolsos' },
  ];
  cambiarCookies() { window.dispatchEvent(new Event('nova-cookies-reset')); }
}
