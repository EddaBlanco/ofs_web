import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { EstacionMeteorologica } from './estacion-meteorologica';

describe('EstacionMeteorologica', () => {
  let component: EstacionMeteorologica;
  let fixture: ComponentFixture<EstacionMeteorologica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstacionMeteorologica],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(EstacionMeteorologica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
