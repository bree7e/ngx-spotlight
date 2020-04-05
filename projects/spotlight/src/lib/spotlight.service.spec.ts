import { TestBed } from '@angular/core/testing';

import { SpotlightService } from './spotlight.service';

describe('SpotlightService', () => {
  let service: SpotlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
