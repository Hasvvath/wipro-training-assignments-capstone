import { Injectable } from '@angular/core';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { from, map, Observable, throwError } from 'rxjs';
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
      this.handleError()
    );
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Observable<T> {
    return from(this.client.post<T>(url, data, config)).pipe(
      map((response) => response.data),
      this.handleError()
    );
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Observable<T> {
    return from(this.client.put<T>(url, data, config)).pipe(
      map((response) => response.data),
      this.handleError()
    );
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Observable<T> {
    return from(this.client.delete<T>(url, config)).pipe(
      map((response) => response.data),
      this.handleError()
    );
  }

  private handleError() {
    return (source: Observable<unknown>) =>
      new Observable<any>((subscriber) => {
        source.subscribe({
          next: (value) => subscriber.next(value),
          complete: () => subscriber.complete(),
          error: (error: AxiosError) => {
            const responseData = error.response?.data;
            subscriber.error({
              status: error.response?.status ?? 0,
              message: error.message,
              error: responseData ?? { message: 'Unexpected API error.' }
            });
          }
        });
      });
  }
}

