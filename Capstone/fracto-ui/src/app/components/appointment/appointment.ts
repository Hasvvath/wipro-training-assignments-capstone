import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Appointment, AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Doctor, DoctorService } from '../../services/doctor.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  allDoctors = signal<Doctor[]>([]);
  selectedCity = '';
  doctorId = '';
  date = '';
  timeSlot = '';
  message = signal('');
  isError = signal(false);
  isLoadingDoctors = signal(true);
  isLoadingAppointments = signal(true);
  isSubmitting = signal(false);
  messageClass = computed(() => (this.isError() ? 'status error' : 'status success'));
  readonly minDate = new Date().toISOString().split('T')[0];
  readonly slotOptions: SlotOption[] = [
    { label: '09:00 AM', value: '09:00', capacity: 10 },
    { label: '10:30 AM', value: '10:30', capacity: 20 },
    { label: '02:00 PM', value: '14:00', capacity: 20 },
    { label: '04:30 PM', value: '16:30', capacity: 20 },
    { label: '07:00 PM', value: '19:00', capacity: 20 }
  ];
  readonly appointments = signal<Appointment[]>([]);
  readonly cities = computed(() =>
    [...new Set(this.allDoctors().map((doctor) => doctor.city).filter((city): city is string => !!city))].sort()
  );
  readonly doctors = computed(() => {
    const city = this.selectedCity.trim().toLowerCase();
    if (!city) {
      return this.allDoctors();
    }

    return this.allDoctors().filter((doctor) => doctor.city?.toLowerCase() === city);
  });
  readonly slotAvailability = computed(() => {
    const selectedDoctorId = Number(this.doctorId);
    const selectedDate = this.date;
    const isToday = selectedDate === this.minDate;
    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    return this.slotOptions.map((slot) => {
      const bookedCount = this.appointments().filter((appointment) =>
        appointment.doctorId === selectedDoctorId &&
        this.normalizeDate(appointment.appointmentDate || appointment.date) === selectedDate &&
        appointment.timeSlot === slot.value
      ).length;

      const [hours, minutes] = slot.value.split(':').map(Number);
      const slotMinutes = hours * 60 + minutes;
      const isPastToday = isToday && slotMinutes <= currentMinutes;

      return {
        ...slot,
        bookedCount,
        remaining: Math.max(slot.capacity - bookedCount, 0),
        isFull: bookedCount >= slot.capacity || isPastToday
      };
    }).filter((slot) => !slot.isFull);
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.doctorId = params.get('doctorId') || localStorage.getItem('selectedDoctorId') || '';
      this.selectedCity = params.get('city') || localStorage.getItem('selectedCity') || '';
    });
    this.loadDoctors();
    this.loadAppointments();
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

  onSubmit(): void {
    if (!this.doctorId || !this.date || !this.timeSlot) {
      this.setMessage('Please choose a doctor, date, and time slot.', true);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.setMessage('Please login before booking an appointment.', true);
      return;
    }

    const selectedSlot = this.slotAvailability().find((slot) => slot.value === this.timeSlot);
    if (!selectedSlot) {
      this.setMessage('This slot is no longer available.', true);
      return;
    }

    const alreadyBookedByUser = this.appointments().some((appointment) =>
      appointment.userId === currentUser.id &&
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
    } = {
      doctorId: Number(this.doctorId),
      appointmentDate: this.date,
      timeSlot: this.timeSlot,
      status: 'Booked'
    };

    payload.userId = currentUser.id;

    this.appointmentService.createAppointment(payload).subscribe({
      next: () => {
        this.setMessage('Appointment booked successfully.', false);
        this.isSubmitting.set(false);
        localStorage.removeItem('selectedDoctorId');
        localStorage.removeItem('selectedCity');
        this.doctorId = '';
        this.date = '';
        this.timeSlot = '';
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

  onCityChange(): void {
    const doctorStillVisible = this.doctors().some((doctor) => String(doctor.id) === this.doctorId);
    if (!doctorStillVisible) {
      this.doctorId = '';
    }
    this.timeSlot = '';
  }

  onDoctorChange(): void {
    this.timeSlot = '';
  }

  private normalizeDate(date?: string): string {
    if (!date) {
      return '';
    }

    if (date.includes('T')) {
      return date.split('T')[0];
    }

    return date;
  }

  private setMessage(message: string, isError: boolean): void {
    this.message.set(message);
    this.isError.set(isError);
  }
}
