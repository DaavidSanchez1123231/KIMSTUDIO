import { Component, HostListener, OnInit } from '@angular/core';

const CLAVE = 'nova_cookies'; // 'necesarias' | 'todas'

/** Solo se cargará analítica/publicidad si localStorage[nova_cookies] === 'todas'. Hoy no hay ninguna. */
@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  template: `
  @if (visible) {
    <div class="cb" role="dialog" aria-label="Aviso de cookies">
      <p>Usamos almacenamiento necesario para que tu sesión funcione. No usamos cookies de análisis ni publicidad.
        Más información en nuestra <a href="/politica-cookies">Política de Cookies</a>.</p>
      <div><button class="sec" (click)="elegir('necesarias')">Solo necesarias</button>
      <button (click)="elegir('todas')">Aceptar todas</button></div>
    </div>
  }`,
  styles: [`
  .cb{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:760px;margin:auto;display:flex;gap:16px;align-items:center;flex-wrap:wrap;
      background:#141414;border:1px solid #68b2a8;border-radius:14px;padding:14px 18px;color:#ddd;font:.85rem 'Montserrat',sans-serif;box-shadow:0 8px 30px #000a}
  p{margin:0;flex:1 1 300px;line-height:1.5}a{color:#68b2a8}
  button{border:0;border-radius:10px;padding:9px 16px;margin-left:8px;cursor:pointer;background:#68b2a8;color:#0a0a0a;font:600 .85rem 'Montserrat',sans-serif}
  button.sec{background:transparent;color:#fff;border:1px solid #444}
  `],
})
export class CookieBannerComponent implements OnInit {
  visible = false;
  ngOnInit() { this.visible = typeof window !== 'undefined' && !localStorage.getItem(CLAVE); }
  elegir(v: 'necesarias' | 'todas') { localStorage.setItem(CLAVE, v); this.visible = false; }
  @HostListener('window:nova-cookies-reset') reset() { localStorage.removeItem(CLAVE); this.visible = true; }
}
