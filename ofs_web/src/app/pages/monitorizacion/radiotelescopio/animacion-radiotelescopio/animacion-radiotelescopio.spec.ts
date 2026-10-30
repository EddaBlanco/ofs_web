import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AnimacionRadiotelescopio } from './animacion-radiotelescopio';

describe('AnimacionRadiotelescopio', () => {
  let component: AnimacionRadiotelescopio;
  let fixture: ComponentFixture<AnimacionRadiotelescopio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [AnimacionRadiotelescopio]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimacionRadiotelescopio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the paused state', () => {
    expect(component.pausada).toBeFalse();
    component.alternarAnimacion();
    expect(component.pausada).toBeTrue();
  });
});
