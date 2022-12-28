import { TestBed } from '@angular/core/testing';

import { FiscalCodeService } from './fiscal-code.service';

describe('FiscalCodeService', () => {
  let service: FiscalCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiscalCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
