import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthFeatureState } from './auth.models';
import { authFeatureKey } from './auth.reducer';

const selectAuthFeature = createFeatureSelector<AuthFeatureState>(authFeatureKey);

export const selectAuthUser = createSelector(selectAuthFeature, (state) => state.user);
export const selectIsAuthenticated = createSelector(selectAuthFeature, (state) => state.isAuthenticated);
export const selectIsAdmin = createSelector(
  selectAuthUser,
  (user) => user?.role?.toLowerCase() === 'admin'
);

