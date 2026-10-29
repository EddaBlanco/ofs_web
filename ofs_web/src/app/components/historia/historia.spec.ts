import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Historia } from './historia';

describe('Historia', () => {
  let component: Historia;
  let fixture: ComponentFixture<Historia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [Historia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Historia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
