import { createReducer, on } from '@ngrx/store';
import { authActions } from './auth.actions';
import { AuthFeatureState } from './auth.models';

export const authFeatureKey = 'auth';

export const initialAuthState: AuthFeatureState = {
  user: null,
  isAuthenticated: false
};

export const authReducer = createReducer(
  initialAuthState,
  on(authActions['setSession'], (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: !!user
  })),
  on(authActions['clearSession'], () => initialAuthState)
);
