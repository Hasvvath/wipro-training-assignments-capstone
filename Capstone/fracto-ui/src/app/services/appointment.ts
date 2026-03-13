import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  apiUrl = 'https://localhost:7234/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    return { headers };
  }

  bookAppointment(data:any){
    return this.http.post(`${this.apiUrl}/Appointment`, data, this.getAuthHeaders());
  }

  getAppointments(){
    return this.http.get(`${this.apiUrl}/Appointment`, this.getAuthHeaders());
  }

}