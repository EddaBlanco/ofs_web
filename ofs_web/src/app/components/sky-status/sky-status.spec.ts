import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SkyStatusComponent } from './sky-status';

describe('SkyStatusComponent', () => {
  let component: SkyStatusComponent;
  let fixture: ComponentFixture<SkyStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [SkyStatusComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkyStatusComponent);
    component = fixture.componentInstance;
    component.fecha = new Date('2026-06-01T00:00:00Z');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
