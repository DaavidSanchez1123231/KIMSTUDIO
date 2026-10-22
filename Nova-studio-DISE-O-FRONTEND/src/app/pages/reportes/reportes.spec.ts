import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { ReportesComponent } from './reportes';
import { environment } from '../../../environments/environment';

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;
  let httpMock: HttpTestingController;

  const dashboardInicial = {
    serviciosTop: [],
    empleadosTop: [],
    balance: {
      ingresosBrutos: 1000,
      insumosComisiones: 300,
      utilidadNeta: 700
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    const solicitudInicial = httpMock.expectOne(
      request =>
        request.url === `${environment.apiUrl}/reportes/dashboard`
    );

    expect(solicitudInicial.request.method).toBe('GET');
    expect(solicitudInicial.request.params.has('desde')).toBe(true);
    expect(solicitudInicial.request.params.has('hasta')).toBe(true);

    solicitudInicial.flush(dashboardInicial);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los indicadores financieros', () => {
    expect(component.balance.ingresosBrutos).toBe(1000);
    expect(component.balance.insumosComisiones).toBe(300);
    expect(component.balance.utilidadNeta).toBe(700);
    expect(component.cargando).toBe(false);
  });

  it('debe inicializar las fechas con el formato AAAA-MM-DD', () => {
    expect(component.fechaDesde).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(component.fechaHasta).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('debe rechazar un rango donde la fecha inicial es posterior a la final', () => {
    component.fechaDesde = '2026-10-22';
    component.fechaHasta = '2026-10-01';

    component.actualizarFiltro();

    expect(component.errorReporte).toContain(
      'fecha inicial'
    );
    expect(component.cargando).toBe(false);

    httpMock.expectNone(
      request =>
        request.url === `${environment.apiUrl}/reportes/dashboard`
    );
  });

  it('debe solicitar el dashboard con el período seleccionado', () => {
    component.fechaDesde = '2026-10-01';
    component.fechaHasta = '2026-10-22';

    component.actualizarFiltro();

    const solicitud = httpMock.expectOne(
      request =>
        request.url === `${environment.apiUrl}/reportes/dashboard`
    );

    expect(solicitud.request.method).toBe('GET');
    expect(solicitud.request.params.get('desde')).toBe('2026-10-01');
    expect(solicitud.request.params.get('hasta')).toBe('2026-10-22');

    solicitud.flush({
      serviciosTop: [
        { nombre: 'Corte', porcentaje: 60 },
        { nombre: 'Tinte', porcentaje: 40 }
      ],
      empleadosTop: [
        { nombre: 'Ana', puesto: 'Estilista', monto: 250 }
      ],
      balance: {
        ingresosBrutos: 500,
        insumosComisiones: 150,
        utilidadNeta: 350
      }
    });

    expect(component.serviciosTop.length).toBe(2);
    expect(component.empleadosTop.length).toBe(1);
    expect(component.balance.ingresosBrutos).toBe(500);
    expect(component.balance.utilidadNeta).toBe(350);
  });
});