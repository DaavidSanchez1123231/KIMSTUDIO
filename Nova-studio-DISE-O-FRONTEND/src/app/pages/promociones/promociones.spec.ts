import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PromocionesComponent } from './promociones';
import { environment } from '../../../environments/environment';

describe('PromocionesComponent', () => {
  let component: PromocionesComponent;
  let fixture: ComponentFixture<PromocionesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromocionesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PromocionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/promociones`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats date-only strings without timezone shifting', () => {
    expect(component.formatearFecha('2099-10-26')).toBe('Vence: 26/10/2099');
  });

  it('filters by the database field nombre and by coupon code', () => {
    component.promociones = [
      {
        id_promocion: 1, nombre: 'Belleza de temporada', descuento: 20,
        codigo: 'BELLEZA20', fecha_expiracion: '2026-12-31', descripcion: 'Oferta',
        estado: true, descuentoTexto: '-20%', fechaFormateada: 'Vence: 31/12/2026',
        expirada: false, estadoTexto: 'Vigente', claseEstado: 'active'
      }
    ];

    component.textoBusqueda = 'belleza';
    component.filtrarPromos();
    expect(component.promosFiltradas.length).toBe(1);

    component.textoBusqueda = 'BELLEZA20';
    component.filtrarPromos();
    expect(component.promosFiltradas.length).toBe(1);
  });
});
