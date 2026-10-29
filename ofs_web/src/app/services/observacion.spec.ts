import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ObservacionService } from './observacion';

describe('ObservacionService', () => {
  let service: ObservacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ObservacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
