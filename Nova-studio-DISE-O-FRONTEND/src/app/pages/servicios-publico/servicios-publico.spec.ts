import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosPublico } from './servicios-publico';

describe('ServiciosPublico', () => {
  let component: ServiciosPublico;
  let fixture: ComponentFixture<ServiciosPublico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosPublico],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiciosPublico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
