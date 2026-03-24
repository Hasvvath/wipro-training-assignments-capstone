import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Appointment, AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Doctor, DoctorService } from '../../services/doctor.service';
import { DoctorLeave, DoctorLeaveService } from '../../services/doctor-leave.service';
import { VideoConsultationService } from '../../services/video-consultation.service';

interface SlotOption {
  label: string;
  value: string;
  capacity: number;
}

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.html',
  styleUrl: './appointment.css'
})
export class AppointmentComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly doctorService = inject(DoctorService);
  private readonly doctorLeaveService = inject(DoctorLeaveService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly videoConsultationService = inject(VideoConsultationService);

  allDoctors = signal<Doctor[]>([]);
  selectedCity = '';
  doctorId = '';
  date = '';
  timeSlot = '';
  consultationType: 'InPerson' | 'OnlineConsultation' = 'InPerson';
  meetingLink = '';
  message = signal('');
  isError = signal(false);
  isLoadingDoctors = signal(true);
  isLoadingAppointments = signal(true);
  isLoadingLeaves = signal(true);
  isSubmitting = signal(false);
  messageClass = computed(() => (this.isError() ? 'status error' : 'status success'));
  readonly minDate = this.formatLocalDate(new Date());
  readonly slotOptions: SlotOption[] = [
    { label: '09:00 AM', value: '09:00', capacity: 10 },
    { label: '10:30 AM', value: '10:30', capacity: 20 },
    { label: '02:00 PM', value: '14:00', capacity: 20 },
    { label: '04:30 PM', value: '16:30', capacity: 20 },
    { label: '07:00 PM', value: '19:00', capacity: 20 }
  ];
  readonly appointments = signal<Appointment[]>([]);
  readonly doctorLeaves = signal<DoctorLeave[]>([]);
  readonly cities = computed(() =>
    [...new Set(this.allDoctors().map((doctor) => doctor.city).filter((city): city is string => !!city))].sort()
  );

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.doctorId = params.get('doctorId') || localStorage.getItem('selectedDoctorId') || '';
      this.selectedCity = params.get('city') || localStorage.getItem('selectedCity') || '';
    });
    this.loadDoctors();
    this.loadAppointments();
    this.loadLeaves();
  }

  loadDoctors(): void {
    this.isLoadingDoctors.set(true);
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        const normalizedDoctors = doctors ?? [];
        this.allDoctors.set(normalizedDoctors);
        if (this.doctorId) {
          const selectedDoctor = normalizedDoctors.find((doctor) => String(doctor.id) === this.doctorId);
          if (selectedDoctor?.city) {
            this.selectedCity = selectedDoctor.city;
          }
        }
        this.isLoadingDoctors.set(false);
      },
      error: () => {
        this.setMessage('Unable to load doctors for booking.', true);
        this.isLoadingDoctors.set(false);
      }
    });
  }

  loadAppointments(): void {
    this.isLoadingAppointments.set(true);
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments ?? []);
        this.isLoadingAppointments.set(false);
      },
      error: () => {
        this.isLoadingAppointments.set(false);
      }
    });
  }

  loadLeaves(): void {
    this.isLoadingLeaves.set(true);
    this.doctorLeaveService.getLeaves().subscribe({
      next: (leaves) => {
        this.doctorLeaves.set(leaves ?? []);
        this.isLoadingLeaves.set(false);
      },
      error: () => {
        this.isLoadingLeaves.set(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.doctorId || !this.date || !this.timeSlot) {
      this.setMessage('Please choose a doctor, date, and time slot.', true);
      return;
    }

    if (this.isCityDoctorMismatch()) {
      this.setMessage("City and doctor don't match.", true);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const currentUserId = Number(currentUser?.id);
    if (!currentUserId) {
      this.setMessage('Please login before booking an appointment.', true);
      return;
    }

    const selectedSlot = this.slotAvailability().find((slot) => slot.value === this.timeSlot);
    if (!selectedSlot) {
      this.setMessage('This slot is no longer available.', true);
      return;
    }

    if (this.isDoctorOnFullDayLeave(Number(this.doctorId), this.date)) {
      this.setMessage('Doctor is unavailable on this date due to leave/holiday.', true);
      return;
    }

    if (this.isDoctorOnSlotLeave(Number(this.doctorId), this.date, this.timeSlot)) {
      this.setMessage('Doctor is unavailable for this time slot due to leave/holiday.', true);
      return;
    }

    if (this.isPastSlotForSelectedDate(this.timeSlot, this.date)) {
      this.setMessage('This time slot has already passed for the selected date.', true);
      return;
    }

    const alreadyBookedByUser = this.appointments().some((appointment) =>
      appointment.userId === currentUserId &&
      this.normalizeDate(appointment.appointmentDate || appointment.date) === this.date &&
      appointment.timeSlot === this.timeSlot
    );

    if (alreadyBookedByUser) {
      this.setMessage('You have already booked this time slot for the selected date.', true);
      return;
    }

    this.isSubmitting.set(true);
    const payload: {
      doctorId: number;
      appointmentDate: string;
      timeSlot: string;
      userId?: number;
      status: string;
      consultationType?: 'InPerson' | 'OnlineConsultation';
      meetingLink?: string;
    } = {
      doctorId: Number(this.doctorId),
      appointmentDate: this.date,
      timeSlot: this.timeSlot,
      status: 'Booked'
    };

    payload.userId = currentUserId;
    payload.consultationType = this.consultationType;

    if (this.consultationType === 'OnlineConsultation') {
      if (!this.meetingLink) {
        this.meetingLink = this.videoConsultationService.generateMeetingLink(
          Number(this.doctorId),
          currentUserId,
          this.date,
          this.timeSlot
        );
      }
      payload.meetingLink = this.meetingLink;
    }

    this.appointmentService.createAppointment(payload).subscribe({
      next: () => {
        if (this.consultationType === 'OnlineConsultation') {
          this.videoConsultationService.saveEmergencyConsultation({
            userId: currentUserId,
            doctorId: Number(this.doctorId),
            appointmentDate: this.date,
            timeSlot: this.timeSlot,
            consultationType: 'OnlineConsultation',
            meetingLink: this.meetingLink
          });

          this.videoConsultationService.scheduleAppointmentReminders(
            {
              userId: currentUserId,
              doctorId: Number(this.doctorId),
              appointmentDate: this.date,
              timeSlot: this.timeSlot
            },
            this.meetingLink
          );

          this.setMessage('Online consultation booked. Meeting link has been generated and reminders are scheduled.', false);
        } else {
          this.setMessage('Appointment booked successfully.', false);
        }

        this.isSubmitting.set(false);
        localStorage.removeItem('selectedDoctorId');
        localStorage.removeItem('selectedCity');
        this.doctorId = '';
        this.date = '';
        this.timeSlot = '';
        this.consultationType = 'InPerson';
        this.meetingLink = '';
        this.loadAppointments();
      },
      error: (error) => {
        const apiMessage =
          error?.error?.message ||
          error?.error?.title ||
          (typeof error?.error === 'string' ? error.error : null) ||
          `Unable to book the appointment${error?.status ? ` (HTTP ${error.status})` : ''}.`;
        this.setMessage(apiMessage, true);
        this.isSubmitting.set(false);
      }
    });
  }

  doctorName(doctor: Doctor): string {
    return doctor.name || doctor.doctorName || 'Doctor';
  }

  selectedDoctor(): Doctor | undefined {
    return this.allDoctors().find((doctor) => String(doctor.id) === this.doctorId);
  }

  isCityDoctorMismatch(): boolean {
    const selectedDoctor = this.selectedDoctor();
    if (!selectedDoctor || !this.selectedCity) {
      return false;
    }

    return selectedDoctor.city?.trim().toLowerCase() !== this.selectedCity.trim().toLowerCase();
  }

  filteredDoctors(): Doctor[] {
    const city = this.selectedCity.trim().toLowerCase();
    if (!city) {
      return this.allDoctors();
    }

    return this.allDoctors().filter((doctor) => doctor.city?.trim().toLowerCase() === city);
  }

  slotAvailability(): Array<SlotOption & { bookedCount: number; remaining: number; isFull: boolean }> {
    const selectedDoctorId = Number(this.doctorId);
    const selectedDate = this.date;

    if (!selectedDoctorId || !selectedDate) {
      return this.slotOptions.map((slot) => ({
        ...slot,
        bookedCount: 0,
        remaining: slot.capacity,
        isFull: false
      }));
    }

    const fullDayLeave = this.isDoctorOnFullDayLeave(selectedDoctorId, selectedDate);

    return this.slotOptions
      .map((slot) => {
        const bookedCount = this.appointments().filter((appointment) =>
          appointment.doctorId === selectedDoctorId &&
          this.normalizeDate(appointment.appointmentDate || appointment.date) === selectedDate &&
          appointment.timeSlot === slot.value
        ).length;

        const isPastToday = this.isPastSlotForSelectedDate(slot.value, selectedDate);
        const isOnSlotLeave = this.isDoctorOnSlotLeave(selectedDoctorId, selectedDate, slot.value);

        return {
          ...slot,
          bookedCount,
          remaining: Math.max(slot.capacity - bookedCount, 0),
          isFull: fullDayLeave || bookedCount >= slot.capacity || isPastToday || isOnSlotLeave
        };
      })
      .filter((slot) => !slot.isFull);
  }

  isDoctorOnSelectedDateLeave(): boolean {
    const selectedDoctorId = Number(this.doctorId);
    return !!selectedDoctorId && !!this.date && this.isDoctorOnFullDayLeave(selectedDoctorId, this.date);
  }

  private isDoctorOnFullDayLeave(doctorId: number, date: string): boolean {
    if (!doctorId || !date) {
      return false;
    }

    const normalizedDate = this.normalizeDate(date);

    return this.doctorLeaves().some((leave) =>
      leave.doctorId === doctorId &&
      this.normalizeDate(leave.leaveDate) === normalizedDate &&
      leave.isFullDay
    );
  }

  private isDoctorOnSlotLeave(doctorId: number, date: string, timeSlot: string): boolean {
    if (!doctorId || !date || !timeSlot) {
      return false;
    }

    const normalizedDate = this.normalizeDate(date);
    const normalizedSlot = timeSlot.trim();

    return this.doctorLeaves().some((leave) =>
      leave.doctorId === doctorId &&
      this.normalizeDate(leave.leaveDate) === normalizedDate &&
      !leave.isFullDay &&
      (leave.timeSlot ?? '').trim() === normalizedSlot
    );
  }

  onCityChange(city: string): void {
    this.selectedCity = city;
    this.timeSlot = '';
    this.message.set('');
  }

  onDoctorChange(): void {
    this.timeSlot = '';
    if (this.consultationType === 'OnlineConsultation') {
      this.refreshMeetingLink();
    }
    this.message.set('');
  }

  onConsultationTypeChange(type: 'InPerson' | 'OnlineConsultation'): void {
    this.consultationType = type;
    if (type === 'OnlineConsultation') {
      this.refreshMeetingLink();
    } else {
      this.meetingLink = '';
    }
  }

  onDateOrTimeChange(): void {
    if (this.consultationType === 'OnlineConsultation') {
      this.refreshMeetingLink();
    }
  }

  private refreshMeetingLink(): void {
    const currentUser = this.authService.getCurrentUser();
    const currentUserId = Number(currentUser?.id);
    if (!currentUserId || !this.doctorId || !this.date || !this.timeSlot) {
      this.meetingLink = '';
      return;
    }

    this.meetingLink = this.videoConsultationService.generateMeetingLink(
      Number(this.doctorId),
      currentUserId,
      this.date,
      this.timeSlot
    );
  }

  private normalizeDate(date?: string): string {
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

  private isPastSlotForSelectedDate(slotValue: string, rawDate: string): boolean {
    const normalizedDate = this.normalizeDate(rawDate);
    if (!normalizedDate) {
      return false;
    }

    const [year, month, day] = normalizedDate.split('-').map(Number);
    if (!year || !month || !day) {
      return false;
    }

    const [hours, minutes] = slotValue.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return false;
    }

    const scheduledAt = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return scheduledAt.getTime() <= Date.now();
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private setMessage(message: string, isError: boolean): void {
    this.message.set(message);
    this.isError.set(isError);
  }
}
