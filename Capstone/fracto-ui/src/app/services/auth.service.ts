import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map, Observable, tap } from 'rxjs';
import { AxiosApiService } from './axios-api.service';
import { authActions } from '../store/auth/auth.actions';
import { selectAuthUser, selectIsAuthenticated } from '../store/auth/auth.selectors';

export interface AuthUser {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
}

export interface AuthApiResponse {
  success?: boolean;
  token?: string;
  accessToken?: string;
  message?: string;
  user?: AuthUser;
  id?: number;
  name?: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(AxiosApiService);
  private readonly store = inject(Store);
  private sessionTimerId: ReturnType<typeof setTimeout> | null = null;
  readonly currentUser = toSignal(this.store.select(selectAuthUser), { initialValue: this.readCurrentUser() });
  readonly isAuthenticated = toSignal(this.store.select(selectIsAuthenticated), { initialValue: !!this.readCurrentUser() });

  constructor() {
    const user = this.readCurrentUser();
    const token = this.getToken();

    if (token && this.isTokenExpired(token)) {
      this.clearSession();
      return;
    }

    this.store.dispatch(authActions.setSession({ user }));
    this.scheduleTokenExpiryLogout(token);
  }

  register(payload: { name: string; email: string; password: string }): Observable<unknown> {
    return this.api.post('/Auth/register', payload);
  }

  login(payload: { email: string; password: string }): Observable<AuthApiResponse> {
    return this.api.post<AuthApiResponse | string>('/Auth/login', payload).pipe(
      map((response) => this.normalizeResponse(response)),
      tap((response) => {
        const token =
          response.token ??
          response.accessToken ??
          (response as AuthApiResponse & { jwt?: string; authorization?: string }).jwt ??
          (response as AuthApiResponse & { jwt?: string; authorization?: string }).authorization;
        const isSuccess = response.success || !!token;

        if (!isSuccess) {
          this.clearSession();
          return;
        }

        if (token) {
          localStorage.setItem('authToken', token);
          this.scheduleTokenExpiryLogout(token);
        }

        const user = response.user ?? {
          id: response.id,
          name: response.name,
          email: response.email ?? payload.email,
          role: response.role
        };

        const resolvedUser: AuthUser = {
          id: user.id,
          name: user.name ?? payload.email.split('@')[0],
          email: user.email ?? payload.email,
          role: user.role
        };

        localStorage.setItem('currentUser', JSON.stringify(resolvedUser));
        this.store.dispatch(authActions.setSession({ user: resolvedUser }));
      })
    );
  }

  private normalizeResponse(response: unknown): AuthApiResponse {
    if (typeof response === 'string') {
      try {
        return JSON.parse(response) as AuthApiResponse;
      } catch {
        return {
          success: response.trim().toLowerCase() === 'login success',
          message: response
        };
      }
    }

    return (response ?? {}) as AuthApiResponse;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role?.toLowerCase() === 'admin';
  }

  logout(): void {
    this.clearSession();
  }

  private readCurrentUser(): AuthUser | null {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser) as AuthUser;
    } catch {
      localStorage.removeItem('currentUser');
      return null;
    }
  }

  private clearSession(): void {
    if (this.sessionTimerId) {
      clearTimeout(this.sessionTimerId);
      this.sessionTimerId = null;
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedDoctorId');
    this.store.dispatch(authActions.clearSession());
  }

  private scheduleTokenExpiryLogout(token: string | null): void {
    if (this.sessionTimerId) {
      clearTimeout(this.sessionTimerId);
      this.sessionTimerId = null;
    }

    if (!token) {
      return;
    }

    const expiryTimeMs = this.getTokenExpiryTime(token);
    if (!expiryTimeMs) {
      return;
    }

    const delay = expiryTimeMs - Date.now();
    if (delay <= 0) {
      this.clearSession();
      return;
    }

    this.sessionTimerId = setTimeout(() => {
      this.clearSession();
      window.location.href = '/login';
    }, delay);
  }

  private getTokenExpiryTime(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(normalizedPayload));
      if (!decoded?.exp) {
        return null;
      }

      return Number(decoded.exp) * 1000;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const expiryTimeMs = this.getTokenExpiryTime(token);
    return !!expiryTimeMs && expiryTimeMs <= Date.now();
  }
}
