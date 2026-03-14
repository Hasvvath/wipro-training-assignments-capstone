import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AxiosApiService } from './axios-api.service';

export interface AppUser {
  userId?: number;
  id?: number;
  name?: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly api = inject(AxiosApiService);

  getUsers(): Observable<AppUser[]> {
    return this.api.get<AppUser[]>('/User');
  }

  updateUser(id: number, payload: Partial<AppUser>): Observable<unknown> {
    return this.api.put(`/User/${id}`, payload);
  }

  deleteUser(id: number): Observable<unknown> {
    return this.api.delete(`/User/${id}`);
  }
}
