import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Monitorizacion } from './monitorizacion';

describe('Monitorizacion', () => {
  let component: Monitorizacion;
  let fixture: ComponentFixture<Monitorizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [Monitorizacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Monitorizacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
