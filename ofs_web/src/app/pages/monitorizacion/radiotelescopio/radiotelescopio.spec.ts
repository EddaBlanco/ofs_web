import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Radiotelescopio } from './radiotelescopio';

describe('Radiotelescopio', () => {
  let component: Radiotelescopio;
  let fixture: ComponentFixture<Radiotelescopio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Radiotelescopio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Radiotelescopio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
