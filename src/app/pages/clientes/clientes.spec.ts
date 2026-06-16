import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// Nota: Asegúrate de que el nombre del import coincida con el nombre real de tu clase
import { ClientesComponent } from './clientes.component'; 

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesComponent], // Al ser Standalone, va en imports
      providers: [
        // Proveemos las herramientas para que las pruebas no fallen al pedir HttpClient
        provideHttpClient(),
        provideHttpClientTesting() 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    
 
    fixture.detectChanges(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
