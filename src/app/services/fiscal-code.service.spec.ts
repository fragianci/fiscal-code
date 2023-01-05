import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FiscalCodeService } from './fiscal-code.service';

describe('FiscalCodeService', () => {
  let service: FiscalCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(FiscalCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
