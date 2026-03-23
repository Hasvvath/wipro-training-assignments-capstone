import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AxiosApiService } from './axios-api.service';

export interface DoctorLeave {
  id: number;
  leaveId?: number;
  doctorId: number;
  leaveDate: string;
  timeSlot?: string | null;
  isFullDay: boolean;
  reason?: string | null;
}

export interface CreateDoctorLeavePayload {
  doctorId: number;
  leaveDate: string;
  timeSlot?: string | null;
  isFullDay: boolean;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorLeaveService {
  private readonly api = inject(AxiosApiService);

  getLeaves(): Observable<DoctorLeave[]> {
    return this.api.get<DoctorLeave[]>('/DoctorLeave').pipe(
      map((leaves) => (leaves ?? []).map((leave, index) => this.normalize(leave, index)))
    );
  }

  createLeave(payload: CreateDoctorLeavePayload): Observable<unknown> {
    return this.api.post('/DoctorLeave', payload);
  }

  deleteLeave(id: number): Observable<unknown> {
    return this.api.delete(`/DoctorLeave/${id}`);
  }

  private normalize(leave: DoctorLeave, index: number): DoctorLeave {
    const resolvedId = leave.id ?? leave.leaveId ?? index + 1;

    return {
      ...leave,
      id: resolvedId,
      leaveId: leave.leaveId ?? resolvedId,
      leaveDate: this.normalizeDate(leave.leaveDate),
      timeSlot: leave.timeSlot ? leave.timeSlot.trim() : null,
      isFullDay: !!leave.isFullDay
    };
  }

  private normalizeDate(date: string): string {
    if (!date) {
      return '';
    }

    if (date.includes('T')) {
      return date.split('T')[0];
    }

    const ddMmYyyy = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddMmYyyy) {
      return `${ddMmYyyy[3]}-${ddMmYyyy[2]}-${ddMmYyyy[1]}`;
    }

    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    return date;
  }
}

