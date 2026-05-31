import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkyStatus } from './sky-status';

describe('SkyStatus', () => {
  let component: SkyStatus;
  let fixture: ComponentFixture<SkyStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkyStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkyStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
