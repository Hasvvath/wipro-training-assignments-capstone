import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AxiosApiService } from './axios-api.service';

export interface AppointmentPayload {
  doctorId: number;
  appointmentDate: string;
  timeSlot: string;
  userId?: number;
  status?: string;
}

export interface Appointment {
  id?: number;
  appointmentId?: number;
  userId?: number;
  doctorId?: number;
  doctorName?: string;
  doctor?: { name?: string; doctorName?: string };
  appointmentDate?: string;
  date?: string;
  timeSlot?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly api = inject(AxiosApiService);

  createAppointment(payload: AppointmentPayload): Observable<unknown> {
    return this.api.post('/Appointment/book', payload);
  }

  getAppointments(): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/Appointment');
  }

  updateAppointmentStatus(id: number, appointment: Appointment, status: string): Observable<unknown> {
    const payload = {
      appointmentId: appointment.appointmentId ?? appointment.id ?? id,
      userId: appointment.userId ?? 0,
      doctorId: appointment.doctorId ?? 0,
      appointmentDate: appointment.appointmentDate ?? appointment.date ?? '',
      timeSlot: appointment.timeSlot ?? '',
      status
    };

    return this.api.put(`/Appointment/${id}`, payload);
  }

  deleteAppointment(id: number): Observable<unknown> {
    return this.api.delete(`/Appointment/${id}`);
  }
}
