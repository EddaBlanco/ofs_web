import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Radiotelescopio } from './radiotelescopio';

describe('Radiotelescopio', () => {
  let component: Radiotelescopio;
  let fixture: ComponentFixture<Radiotelescopio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Radiotelescopio],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(Radiotelescopio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
