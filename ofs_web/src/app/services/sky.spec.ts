import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SkyService } from './sky';

describe('SkyService', () => {
  let service: SkyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(SkyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate a sky status for a date and location', () => {
    const status = service.calcularCielo(new Date('2026-06-01T00:00:00Z'), 40.4054, -3.8354, 90, 45);

    expect(status.localizacion).toEqual({ lat: 40.4054, lon: -3.8354 });
    expect(status.sol).toBeTruthy();
    expect(status.luna).toBeTruthy();
    expect(Number.isFinite(status.latitudGalactica)).toBeTrue();
    expect(Number.isFinite(status.longitudGalactica)).toBeTrue();
  });
});
