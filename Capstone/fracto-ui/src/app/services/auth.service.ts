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
  readonly currentUser = toSignal(this.store.select(selectAuthUser), { initialValue: this.readCurrentUser() });
  readonly isAuthenticated = toSignal(this.store.select(selectIsAuthenticated), { initialValue: !!this.readCurrentUser() });

  constructor() {
    this.store.dispatch(authActions['setSession']({ user: this.readCurrentUser() }));
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
          this.store.dispatch(authActions['clearSession']());
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          return;
        }

        if (token) {
          localStorage.setItem('authToken', token);
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
        this.store.dispatch(authActions['setSession']({ user: resolvedUser }));
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedDoctorId');
    this.store.dispatch(authActions['clearSession']());
  }

  private readCurrentUser(): AuthUser | null {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) as AuthUser : null;
  }
}
