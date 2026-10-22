import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EmpleadosComponent } from './empleados';
import { environment } from '../../../environments/environment';

describe('EmpleadosComponent', () => {
  let fixture: ComponentFixture<EmpleadosComponent>;
  let component: EmpleadosComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpleadosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(EmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/empleados`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should recognize PostgreSQL boolean values as active', () => {
    expect(component.esActivo({ id_especialista: 1, nombre: 'Ana', especialidad: 'Cabello', estado: true })).toBeTrue();
    expect(component.esActivo({ id_especialista: 2, nombre: 'Ana', especialidad: 'Cabello', estado: false })).toBeFalse();
  });

  it('should format an ISO date without timezone shifting', () => {
    expect(component.formatearFecha('2026-10-26')).toBe('26/10/2026');
  });
});
