import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Camaras } from './camaras';

describe('Camaras', () => {
  let component: Camaras;
  let fixture: ComponentFixture<Camaras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [Camaras]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Camaras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
