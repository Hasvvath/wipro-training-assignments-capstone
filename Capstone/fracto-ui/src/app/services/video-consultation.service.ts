import { Injectable } from '@angular/core';
import { Appointment } from './appointment.service';

export interface VideoConsultationMeta {
  userId: number;
  doctorId: number;
  appointmentDate: string;
  timeSlot: string;
  consultationType: 'InPerson' | 'OnlineConsultation';
  meetingLink?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoConsultationService {
  private readonly storageKey = 'videoConsultationMetaV1';
  private readonly reminderKey = 'videoConsultationRemindersV1';
  private readonly reminderOffsetsInMinutes = [30, 5];

  generateMeetingLink(doctorId: number, userId: number, appointmentDate: string, timeSlot: string): string {
    void doctorId;
    void userId;
    void appointmentDate;
    void timeSlot;
    return 'https://meet.google.com/hrb-rwvo-pfx';
  }

  saveEmergencyConsultation(meta: VideoConsultationMeta): void {
    const allMeta = this.readMeta();
    const key = this.buildKey(meta.userId, meta.doctorId, meta.appointmentDate, meta.timeSlot);
    const next = allMeta.filter((item) => this.buildKey(item.userId, item.doctorId, item.appointmentDate, item.timeSlot) !== key);
    next.push(meta);
    localStorage.setItem(this.storageKey, JSON.stringify(next));
  }

  getEmergencyMetaForAppointment(appointment: Appointment): VideoConsultationMeta | null {
    const userId = appointment.userId;
    const doctorId = appointment.doctorId;
    const appointmentDate = this.normalizeDate(appointment.appointmentDate || appointment.date || '');
    const timeSlot = (appointment.timeSlot || '').trim();

    if (!userId || !doctorId || !appointmentDate || !timeSlot) {
      return null;
    }

    const key = this.buildKey(userId, doctorId, appointmentDate, timeSlot);
    const found = this.readMeta().find((item) =>
      this.buildKey(item.userId, item.doctorId, item.appointmentDate, item.timeSlot) === key
    );

    return found || null;
  }

  scheduleAppointmentReminders(appointment: Appointment, meetingLink: string): void {
    const userId = appointment.userId;
    const doctorId = appointment.doctorId;
    const appointmentDate = this.normalizeDate(appointment.appointmentDate || appointment.date || '');
    const timeSlot = (appointment.timeSlot || '').trim();

    if (!userId || !doctorId || !appointmentDate || !timeSlot || !meetingLink) {
      return;
    }

    const appointmentTime = this.getAppointmentTime(appointmentDate, timeSlot);
    if (!appointmentTime) {
      return;
    }

    const reminderMap = this.readReminderMap();
    const baseKey = this.buildKey(userId, doctorId, appointmentDate, timeSlot);

    this.reminderOffsetsInMinutes.forEach((offset) => {
      const reminderTime = appointmentTime.getTime() - offset * 60 * 1000;
      if (reminderTime <= Date.now()) {
        return;
      }

      const reminderId = `${baseKey}|${offset}`;
      if (reminderMap[reminderId]) {
        return;
      }

      reminderMap[reminderId] = true;
      const delay = reminderTime - Date.now();
      window.setTimeout(() => {
        this.showReminder(offset, appointmentDate, timeSlot, meetingLink);
      }, delay);
    });

    localStorage.setItem(this.reminderKey, JSON.stringify(reminderMap));
  }

  private showReminder(offsetInMinutes: number, appointmentDate: string, timeSlot: string, meetingLink: string): void {
    const message = `Your video consultation starts in ${offsetInMinutes} minutes (${appointmentDate} ${timeSlot}).`;

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Fracto Consultation Reminder', {
          body: `${message} Join: ${meetingLink}`
        });
        return;
      }

      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('Fracto Consultation Reminder', {
              body: `${message} Join: ${meetingLink}`
            });
          } else {
            alert(`${message}\nJoin Link: ${meetingLink}`);
          }
        });
        return;
      }
    }

    alert(`${message}\nJoin Link: ${meetingLink}`);
  }

  private getAppointmentTime(appointmentDate: string, timeSlot: string): Date | null {
    const [year, month, day] = appointmentDate.split('-').map(Number);
    const [hours, minutes] = timeSlot.split(':').map(Number);

    if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  private readMeta(): VideoConsultationMeta[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as VideoConsultationMeta[];
    } catch {
      return [];
    }
  }

  private readReminderMap(): Record<string, boolean> {
    const raw = localStorage.getItem(this.reminderKey);
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as Record<string, boolean>;
    } catch {
      return {};
    }
  }

  private buildKey(userId: number, doctorId: number, appointmentDate: string, timeSlot: string): string {
    return `${userId}|${doctorId}|${appointmentDate}|${timeSlot}`;
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

    return date;
  }
}
