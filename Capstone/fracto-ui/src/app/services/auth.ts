import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  message?: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = 'https://localhost:7234/api';

  constructor(private http: HttpClient) {}

  register(name: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/Auth/register`, {
      name,
      email,
      password
    }, { responseType: 'text' as 'json' });
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/Auth/login`, {
      email,
      password
    }, { responseType: 'text' as 'json' });
  }

  setCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser() {
    const json = localStorage.getItem('currentUser');
    return json ? JSON.parse(json) : null;
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  isLoggedIn() {
    return !!this.getToken();
  }

}
