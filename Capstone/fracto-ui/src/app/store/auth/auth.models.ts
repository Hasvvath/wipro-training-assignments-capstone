export interface AuthUserState {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
}

export interface AuthFeatureState {
  user: AuthUserState | null;
  isAuthenticated: boolean;
}

