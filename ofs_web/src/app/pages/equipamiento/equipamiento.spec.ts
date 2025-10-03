import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Equipamiento } from './equipamiento';

describe('Equipamiento', () => {
  let component: Equipamiento;
  let fixture: ComponentFixture<Equipamiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Equipamiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Equipamiento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
