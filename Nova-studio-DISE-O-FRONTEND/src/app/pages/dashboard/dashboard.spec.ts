import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { DashboardComponent } from './dashboard';
import { environment } from '../../../environments/environment';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/dashboard`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function responderMetricas(): void {
    httpMock.expectOne(`${apiUrl}/metricas`).flush({
      citasHoy: 5,
      ingresosHoy: 620.50,
      clientesRegistrados: 20,
      solicitudesPendientes: 2
    });
  }

  function responderCitas(): void {
    httpMock.expectOne(`${apiUrl}/citas-recientes`).flush([
      {
        id_cita: 1,
        fecha: '22/10/2026',
        hora: '09:30',
        nombre_cliente: 'Ana Torres',
        nombre_servicio: 'Corte de cabello',
        estado: 'Confirmada'
      }
    ]);
  }

  it('debe crear el componente', () => {
    responderMetricas();
    responderCitas();

    expect(component).toBeTruthy();
  });

  it('debe mostrar las métricas recibidas de la API', () => {
    responderMetricas();
    responderCitas();

    expect(component.metricas.length).toBe(4);
    expect(component.metricas[0].valor).toBe('5');
    expect(component.metricas[0].etiqueta).toBe('Citas hoy');
    expect(component.metricas[1].valor).toContain('620');
    expect(component.metricas[2].valor).toBe('20');
    expect(component.metricas[3].valor).toBe('2');
    expect(component.cargandoMetricas).toBe(false);
  });

  it('debe procesar las citas y sus fechas', () => {
    responderMetricas();
    responderCitas();

    expect(component.citas.length).toBe(1);
    expect(component.citas[0].nombre_cliente).toBe('Ana Torres');
    expect(component.citas[0].nombre_servicio).toBe('Corte de cabello');
    expect(component.citas[0].fecha).toBeInstanceOf(Date);
    expect(component.cargandoCitas).toBe(false);
  });

  it('debe mostrar un error si falla la carga de métricas', () => {
    httpMock.expectOne(`${apiUrl}/metricas`).flush(
      { mensaje: 'Error del servidor' },
      { status: 500, statusText: 'Server Error' }
    );

    responderCitas();

    expect(component.errorMetricas).toBeTruthy();
    expect(component.cargandoMetricas).toBe(false);
  });

  it('debe mostrar un error si falla la carga de citas', () => {
    responderMetricas();

    httpMock.expectOne(`${apiUrl}/citas-recientes`).flush(
      { mensaje: 'Error del servidor' },
      { status: 500, statusText: 'Server Error' }
    );

    expect(component.errorCitas).toBeTruthy();
    expect(component.cargandoCitas).toBe(false);
    expect(component.citas.length).toBe(0);
  });
});