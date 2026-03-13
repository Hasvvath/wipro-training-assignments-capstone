import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL, SERVER_BASE_URL } from './api.config';

export interface Doctor {
  id: number;
  doctorId?: number;
  DoctorId?: number;
  name?: string;
  doctorName?: string;
  doctorFullName?: string;
  specialization?: string;
  speciality?: string;
  rating?: number;
  city?: string;
  hospitalName?: string;
  profileImage?: string | null;
}

export interface CreateDoctorPayload {
  name: string;
  specialization: string;
  rating: number;
  city: string;
  hospitalName: string;
  image?: File | null;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL;
  private readonly serverUrl = SERVER_BASE_URL;

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/Doctor`).pipe(
      map((doctors) => (doctors ?? []).map((doctor, index) => this.normalizeDoctor(doctor, index)))
    );
  }

  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/Doctor/${id}`).pipe(
      map((doctor) => this.normalizeDoctor(doctor, 0))
    );
  }

  createDoctor(payload: CreateDoctorPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/Doctor`, this.toFormData(payload));
  }

  updateDoctor(id: number, payload: CreateDoctorPayload): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/Doctor/${id}`, this.toFormData(payload));
  }

  deleteDoctor(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/Doctor/${id}`);
  }

  private toFormData(payload: CreateDoctorPayload): FormData {
    const formData = new FormData();
    formData.append('Name', payload.name);
    formData.append('Specialization', payload.specialization);
    formData.append('Rating', String(payload.rating));
    formData.append('City', payload.city);
    formData.append('HospitalName', payload.hospitalName);

    if (payload.image) {
      formData.append('Image', payload.image);
    }

    return formData;
  }

  private normalizeDoctor(doctor: Doctor, index: number): Doctor {
    const resolvedId = doctor.id ?? doctor.doctorId ?? doctor.DoctorId ?? index + 1;

    return {
      ...doctor,
      id: resolvedId,
      doctorId: doctor.doctorId ?? doctor.DoctorId ?? resolvedId,
      name: doctor.name ?? doctor.doctorName ?? doctor.doctorFullName ?? 'Doctor',
      profileImage: this.resolveImageUrl(doctor.profileImage)
    };
  }

  private resolveImageUrl(path?: string | null): string | null {
    if (!path) {
      return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${this.serverUrl}${path}`;
  }
}
