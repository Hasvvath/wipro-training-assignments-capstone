import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';

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
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL;
  readonly currentUser = signal<AuthUser | null>(this.readCurrentUser());
  readonly isAuthenticated = signal<boolean>(!!this.readCurrentUser());

  register(payload: { name: string; email: string; password: string }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/Auth/register`, payload);
  }

  login(payload: { email: string; password: string }): Observable<AuthApiResponse> {
    return this.http.post<AuthApiResponse>(`${this.apiUrl}/Auth/login`, payload).pipe(
      map((response) => this.normalizeResponse(response)),
      tap((response) => {
        const token =
          response.token ??
          response.accessToken ??
          (response as AuthApiResponse & { jwt?: string; authorization?: string }).jwt ??
          (response as AuthApiResponse & { jwt?: string; authorization?: string }).authorization;
        const isSuccess = response.success || !!token;

        if (!isSuccess) {
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
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
        this.currentUser.set(resolvedUser);
        this.isAuthenticated.set(true);
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
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private readCurrentUser(): AuthUser | null {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) as AuthUser : null;
  }
}
