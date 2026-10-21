import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromocionesPublico } from './promociones-publico';

describe('PromocionesPublico', () => {
  let component: PromocionesPublico;
  let fixture: ComponentFixture<PromocionesPublico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromocionesPublico],
    }).compileComponents();

    fixture = TestBed.createComponent(PromocionesPublico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
