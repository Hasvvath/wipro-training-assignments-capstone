import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { authFeatureKey, authReducer } from '../store/auth/auth.reducer';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore({ [authFeatureKey]: authReducer })]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
