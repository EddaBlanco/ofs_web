import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstacionMeteorologica } from './estacion-meteorologica';

describe('EstacionMeteorologica', () => {
  let component: EstacionMeteorologica;
  let fixture: ComponentFixture<EstacionMeteorologica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstacionMeteorologica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstacionMeteorologica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
