import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appointment, AppointmentService } from '../../services/appointment.service';
import { getEffectiveAppointmentStatus, getRawAppointmentStatus, getAppointmentDateTime } from '../../services/appointment-status';
import { AuthService } from '../../services/auth.service';
import { Doctor, DoctorService } from '../../services/doctor.service';
import { VideoConsultationService } from '../../services/video-consultation.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css'
})
export class AppointmentListComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly authService = inject(AuthService);
  private readonly doctorService = inject(DoctorService);
  private readonly videoConsultationService = inject(VideoConsultationService);

  appointments = signal<Appointment[]>([]);
  message = signal('');
  isLoading = signal(true);
  ratingDrafts = signal<Record<number, number>>({});
  ratingSubmitted = signal<Record<number, boolean>>(this.readSubmittedRatings());
  isSubmittingRating = signal<Record<number, boolean>>({});
  doctors = signal<Doctor[]>([]);

  ngOnInit(): void {
    this.loadDoctors();
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    const currentUser = this.authService.getCurrentUser();

    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        const visibleAppointments = (appointments ?? []).filter((appointment) => appointment.userId === currentUser?.id);
        this.appointments.set(visibleAppointments);
        this.syncSubmittedRatingsFromData(visibleAppointments);
        this.scheduleRemindersForEmergencyAppointments(visibleAppointments);
        this.message.set(visibleAppointments.length ? '' : 'No appointments found yet.');
        this.isLoading.set(false);
      },
      error: () => {
        this.message.set('Unable to fetch appointments at the moment.');
        this.isLoading.set(false);
      }
    });
  }

  private loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => this.doctors.set(doctors ?? []),
      error: () => this.doctors.set([])
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

  doctorUnavailableMessage(appointment: Appointment): string {
    const raw = getRawAppointmentStatus(appointment).trim().toLowerCase();
    const reason = this.readCancellationReason(appointment);

    const unavailableStatus =
      raw.includes('doctorunavailable') ||
      raw.includes('doctor_unavailable') ||
      raw.includes('doctor-unavailable') ||
      (raw.includes('cancel') && reason.toLowerCase().includes('doctor'));

    if (!unavailableStatus) {
      return '';
    }

    return reason || 'Your booking was cancelled due to doctor unavailability.';
  }

  canCancel(appointment: Appointment): boolean {
    return getRawAppointmentStatus(appointment).toLowerCase() === 'booked' &&
      (getAppointmentDateTime(appointment)?.getTime() ?? 0) > Date.now();
  }

  canRate(appointment: Appointment): boolean {
    const appointmentId = this.getAppointmentId(appointment);
    if (!appointmentId) {
      return false;
    }

    const status = this.effectiveStatus(appointment).toLowerCase();
    if (status !== 'attended') {
      return false;
    }

    if (this.ratingSubmitted()[appointmentId]) {
      return false;
    }

    const existing = this.readExistingRating(appointment);
    return existing <= 0;
  }

  currentRatingValue(appointment: Appointment): number {
    const appointmentId = this.getAppointmentId(appointment);
    if (!appointmentId) {
      return 5;
    }

    const draft = this.ratingDrafts()[appointmentId];
    if (typeof draft === 'number') {
      return draft;
    }

    const existing = this.readExistingRating(appointment);
    return existing > 0 ? existing : 5;
  }

  onRatingChange(appointment: Appointment, value: number): void {
    const appointmentId = this.getAppointmentId(appointment);
    if (!appointmentId) {
      return;
    }

    this.ratingDrafts.set({
      ...this.ratingDrafts(),
      [appointmentId]: Number(value)
    });
  }

  starValues(): number[] {
    return [1, 2, 3, 4, 5];
  }

  isStarSelected(appointment: Appointment, starValue: number): boolean {
    return starValue <= this.currentRatingValue(appointment);
  }

  isEmergencyConsultation(appointment: Appointment): boolean {
    const type = (appointment.consultationType || '').toLowerCase();
    if (type === 'onlineconsultation' || type.includes('online') || type.includes('video')) {
      return true;
    }

    return !!this.videoConsultationService.getEmergencyMetaForAppointment(appointment);
  }

  meetingLink(appointment: Appointment): string {
    const direct = (appointment.meetingLink || '').trim();
    if (direct) {
      return direct;
    }

    return this.videoConsultationService.getEmergencyMetaForAppointment(appointment)?.meetingLink || '';
  }

  canJoinCall(appointment: Appointment): boolean {
    if (!this.isEmergencyConsultation(appointment)) {
      return false;
    }

    const status = getRawAppointmentStatus(appointment).toLowerCase();
    if (status.includes('cancel')) {
      return false;
    }

    return !!this.meetingLink(appointment);
  }

  joinCall(appointment: Appointment): void {
    const link = this.meetingLink(appointment);
    if (!link) {
      this.message.set('Meeting link not found for this appointment.');
      return;
    }

    window.open(link, '_blank', 'noopener,noreferrer');
  }

  submitRating(appointment: Appointment): void {
    const appointmentId = this.getAppointmentId(appointment);
    const doctorId = this.getDoctorId(appointment);
    const userId = appointment.userId ?? this.authService.getCurrentUser()?.id;

    if (!appointmentId || !doctorId || !userId) {
      this.message.set('Unable to submit rating. Missing appointment/doctor/user details.');
      return;
    }

    const rating = this.currentRatingValue(appointment);
    if (!rating || rating < 1 || rating > 5) {
      this.message.set('Rating must be between 1 and 5.');
      return;
    }

    this.isSubmittingRating.set({
      ...this.isSubmittingRating(),
      [appointmentId]: true
    });

    this.appointmentService.submitDoctorRating({
      appointmentId,
      doctorId,
      userId,
      rating
    }).subscribe({
      next: () => {
        const updatedSubmitted = {
          ...this.ratingSubmitted(),
          [appointmentId]: true
        };

        this.ratingSubmitted.set(updatedSubmitted);
        localStorage.setItem('ratedAppointments', JSON.stringify(updatedSubmitted));
        this.message.set('Thanks. Your rating has been submitted.');
        window.dispatchEvent(new CustomEvent('doctor-rating-updated', { detail: { doctorId, rating } }));

        this.isSubmittingRating.set({
          ...this.isSubmittingRating(),
          [appointmentId]: false
        });

        this.loadAppointments();
      },
      error: (error) => {
        const errorMessage = this.readApiError(error) || 'Unable to submit rating right now.';

        if (errorMessage.toLowerCase().includes('already rated')) {
          const updatedSubmitted = {
            ...this.ratingSubmitted(),
            [appointmentId]: true
          };
          this.ratingSubmitted.set(updatedSubmitted);
          localStorage.setItem('ratedAppointments', JSON.stringify(updatedSubmitted));
        }

        this.message.set(errorMessage);
        this.isSubmittingRating.set({
          ...this.isSubmittingRating(),
          [appointmentId]: false
        });
      }
    });
  }

  hasSubmittedRating(appointment: Appointment): boolean {
    const appointmentId = this.getAppointmentId(appointment);
    return appointmentId ? !!this.ratingSubmitted()[appointmentId] : false;
  }

  ratingSubmitting(appointment: Appointment): boolean {
    const appointmentId = this.getAppointmentId(appointment);
    return appointmentId ? !!this.isSubmittingRating()[appointmentId] : false;
  }

  private getAppointmentId(appointment: Appointment): number | null {
    const id = appointment.appointmentId ?? appointment.id;
    return id ? Number(id) : null;
  }

  private readSubmittedRatings(): Record<number, boolean> {
    const raw = localStorage.getItem('ratedAppointments');
    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as Record<number, boolean>;
    } catch {
      return {};
    }
  }

  private syncSubmittedRatingsFromData(appointments: Appointment[]): void {
    const merged = { ...this.ratingSubmitted() };

    appointments.forEach((appointment) => {
      const appointmentId = this.getAppointmentId(appointment);
      if (!appointmentId) {
        return;
      }

      if (this.readExistingRating(appointment) > 0) {
        merged[appointmentId] = true;
      }
    });

    this.ratingSubmitted.set(merged);
    localStorage.setItem('ratedAppointments', JSON.stringify(merged));
  }

  private readExistingRating(appointment: Appointment): number {
    const withRating = appointment as Appointment & { rating?: number; userRating?: number };
    return Number(withRating.userRating ?? withRating.rating ?? 0);
  }

  private readCancellationReason(appointment: Appointment): string {
    const withReason = appointment as Appointment & { reason?: string; cancelReason?: string; cancellationReason?: string };
    return (withReason.cancellationReason || withReason.cancelReason || withReason.reason || '').trim();
  }

  private getDoctorId(appointment: Appointment): number | null {
    if (appointment.doctorId) {
      return Number(appointment.doctorId);
    }

    const name = this.doctorName(appointment).trim().toLowerCase();
    if (!name) {
      return null;
    }

    const matchedDoctor = this.doctors().find((doctor) =>
      (doctor.name || doctor.doctorName || '').trim().toLowerCase() === name
    );

    return matchedDoctor?.id ?? matchedDoctor?.doctorId ?? null;
  }

  private readApiError(error: unknown): string {
    const apiError = error as { error?: unknown; message?: string };
    const responseBody = apiError?.error;

    if (typeof responseBody === 'string') {
      return responseBody;
    }

    if (responseBody && typeof responseBody === 'object') {
      const body = responseBody as { message?: string; title?: string; errors?: Record<string, string[]> };
      if (body.message) {
        return body.message;
      }
      if (body.title) {
        return body.title;
      }
      if (body.errors) {
        const first = Object.values(body.errors)[0];
        if (first?.length) {
          return first[0];
        }
      }
    }

    return apiError?.message ?? '';
  }

  private scheduleRemindersForEmergencyAppointments(appointments: Appointment[]): void {
    appointments.forEach((appointment) => {
      if (!this.isEmergencyConsultation(appointment)) {
        return;
      }

      const link = this.meetingLink(appointment);
      if (!link) {
        return;
      }

      this.videoConsultationService.scheduleAppointmentReminders(appointment, link);
    });
  }
}
