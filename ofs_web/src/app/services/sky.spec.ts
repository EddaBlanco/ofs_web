import { TestBed } from '@angular/core/testing';

import { Sky } from './sky';

describe('Sky', () => {
  let service: Sky;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sky);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
