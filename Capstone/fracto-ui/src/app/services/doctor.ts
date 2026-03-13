import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  apiUrl = "https://localhost:7234/api";

  constructor(private http: HttpClient) {}

  getAllDoctors() {
    return this.http.get(`${this.apiUrl}/Doctor`);
  }

  getDoctorById(id: number) {
    return this.http.get(`${this.apiUrl}/Doctor/${id}`);
  }

}