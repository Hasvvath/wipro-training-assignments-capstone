import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Appointment, AppointmentService } from '../../services/appointment.service';
import { getEffectiveAppointmentStatus, getRawAppointmentStatus, getAppointmentDateTime } from '../../services/appointment-status';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css'
})
export class AppointmentListComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly authService = inject(AuthService);

  appointments = signal<Appointment[]>([]);
  message = signal('');
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    const currentUser = this.authService.getCurrentUser();

    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        const visibleAppointments = (appointments ?? []).filter((appointment) => appointment.userId === currentUser?.id);
        this.appointments.set(visibleAppointments);
        this.message.set(visibleAppointments.length ? '' : 'No appointments found yet.');
        this.isLoading.set(false);
      },
      error: () => {
        this.message.set('Unable to fetch appointments at the moment.');
        this.isLoading.set(false);
      }
    });
  }

  cancelAppointment(appointment: Appointment): void {
    const appointmentId = appointment.appointmentId ?? appointment.id;
    if (!appointmentId) {
      return;
    }

    const confirmed = window.confirm('Cancel this appointment?');
    if (!confirmed) {
      return;
    }

    this.appointmentService.deleteAppointment(appointmentId).subscribe({
      next: () => {
        this.message.set('Appointment cancelled successfully.');
        this.loadAppointments();
      },
      error: () => {
        this.message.set('Unable to cancel the appointment right now.');
      }
    });
  }

  doctorName(appointment: Appointment): string {
    return appointment.doctorName || appointment.doctor?.name || appointment.doctor?.doctorName || 'Doctor';
  }

  appointmentDate(appointment: Appointment): string | undefined {
    return appointment.appointmentDate || appointment.date;
  }

  effectiveStatus(appointment: Appointment): string {
    return getEffectiveAppointmentStatus(appointment);
  }

  canCancel(appointment: Appointment): boolean {
    return getRawAppointmentStatus(appointment).toLowerCase() === 'booked' &&
      (getAppointmentDateTime(appointment)?.getTime() ?? 0) > Date.now();
  }
}
