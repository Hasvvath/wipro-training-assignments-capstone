import { Injectable } from '@angular/core';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { from, map, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AxiosApiService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');

      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });
  }

  get<T>(url: string, config?: AxiosRequestConfig): Observable<T> {
    return from(this.client.get<T>(url, config)).pipe(
      map((response) => response.data),
      catchError((error) => this.handleError(error))
    );
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Observable<T> {
    return from(this.client.post<T>(url, data, config)).pipe(
      map((response) => response.data),
      catchError((error) => this.handleError(error))
    );
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Observable<T> {
    return from(this.client.put<T>(url, data, config)).pipe(
      map((response) => response.data),
      catchError((error) => this.handleError(error))
    );
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Observable<T> {
    return from(this.client.delete<T>(url, config)).pipe(
      map((response) => response.data),
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: AxiosError): Observable<never> {
    const status = error.response?.status ?? 0;
    const responseData = error.response?.data;
    const parsedError = this.toErrorObject(responseData);

    if (status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('selectedDoctorId');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return throwError(() => ({
      status,
      message: parsedError.message || error.message || 'Unexpected API error.',
      error: parsedError
    }));
  }

  private toErrorObject(responseData: unknown): { message?: string; [key: string]: unknown } {
    if (!responseData) {
      return { message: 'Unexpected API error.' };
    }

    if (typeof responseData === 'string') {
      try {
        return JSON.parse(responseData) as { message?: string };
      } catch {
        return { message: responseData };
      }
    }

    return responseData as { message?: string; [key: string]: unknown };
  }
}
