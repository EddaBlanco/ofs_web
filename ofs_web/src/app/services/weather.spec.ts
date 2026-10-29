import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Weather } from './weather';

describe('Weather', () => {
  let service: Weather;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(Weather);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
