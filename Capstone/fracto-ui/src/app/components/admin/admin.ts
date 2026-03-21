import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Appointment, AppointmentService } from '../../services/appointment.service';
import { getEffectiveAppointmentStatus, getRawAppointmentStatus } from '../../services/appointment-status';
import { AuthService } from '../../services/auth.service';
import { AppUser, UserService } from '../../services/user.service';
import { CreateDoctorPayload, Doctor, DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly doctorService = inject(DoctorService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  adminEmail = '';
  adminPassword = '';

  doctorName = '';
  specialization = '';
  city = '';
  hospitalName = '';
  rating = 0;
  experience = 0;
  selectedImage: File | null = null;
  imageName = '';
  editingDoctorId: number | null = null;

  doctors = signal<Doctor[]>([]);
  appointments = signal<Appointment[]>([]);
  users = signal<AppUser[]>([]);

  message = signal('');
  isError = signal(false);
  isSubmitting = signal(false);
  isLoadingDoctors = signal(false);
  isLoadingUsers = signal(false);
  isLoadingAppointments = signal(false);

  readonly isAdmin = computed(() => this.authService.isAdmin());
  readonly currentUser = this.authService.currentUser;
  readonly messageClass = computed(() => (this.isError() ? 'status error' : 'status success'));
  readonly formTitle = computed(() => (this.editingDoctorId ? 'Edit Doctor' : 'Add New Doctor'));
  readonly totalUsers = computed(() => this.users().length);
  readonly totalAppointments = computed(() => this.appointments().length);
  readonly bookedAppointments = computed(() =>
    this.appointments().filter((appointment) => this.effectiveStatus(appointment).toLowerCase() === 'booked').length
  );
  readonly todayAppointments = computed(() => {
    const today = this.formatDateKey(new Date());
    return this.appointments().filter((appointment) => this.formatDateKey(this.appointmentDate(appointment)) === today).length;
  });
  readonly submitLabel = computed(() => {
    if (this.isSubmitting()) {
      return this.editingDoctorId ? 'Updating...' : 'Saving...';
    }

    return this.editingDoctorId ? 'Update Doctor' : 'Add Doctor';
  });
  readonly slotRules = [
    '09:00 AM - up to 10 patients',
    '10:30 AM - up to 20 patients',
    '02:00 PM - up to 20 patients',
    '04:30 PM - up to 20 patients',
    '07:00 PM - up to 20 patients',
    'Lunch break: 01:00 PM to 02:00 PM',
    'Doctors available until 09:00 PM'
  ];

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadDashboard();
    }
  }

  onAdminLogin(): void {
    if (!this.adminEmail || !this.adminPassword) {
      this.setMessage('Enter admin email and password.', true);
      return;
    }

    this.authService.logout();
    this.isSubmitting.set(true);
    this.authService.login({ email: this.adminEmail, password: this.adminPassword }).subscribe({
      next: (response) => {
        if (!response.success) {
          this.setMessage(response.message || 'Admin login failed.', true);
          this.isSubmitting.set(false);
          return;
        }

        if (!this.authService.isAdmin()) {
          this.authService.logout();
          this.setMessage('This account does not have admin access.', true);
          this.isSubmitting.set(false);
          return;
        }

        this.setMessage('Admin login successful.', false);
        this.isSubmitting.set(false);
        this.loadDashboard();
      },
      error: (error) => {
        this.authService.logout();
        this.setMessage(this.errorMessage(error, 'Admin login failed.'), true);
        this.isSubmitting.set(false);
      }
    });
  }

  loadDashboard(): void {
    this.loadDoctors();
    this.loadUsers();
    this.loadAppointments();
  }

  loadDoctors(): void {
    this.isLoadingDoctors.set(true);
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors ?? []);
        this.isLoadingDoctors.set(false);
      },
      error: (error) => {
        this.setMessage(this.errorMessage(error, 'Unable to load doctors.'), true);
        this.isLoadingDoctors.set(false);
      }
    });
  }

  loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users ?? []);
        this.isLoadingUsers.set(false);
      },
      error: (error) => {
        this.setMessage(this.errorMessage(error, 'Unable to load users.'), true);
        this.isLoadingUsers.set(false);
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
      error: (error) => {
        this.setMessage(this.errorMessage(error, 'Unable to load appointments.'), true);
        this.isLoadingAppointments.set(false);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImage = file;
    this.imageName = file?.name || '';
  }

  onSubmitDoctor(): void {
    if (!this.doctorName || !this.specialization || !this.city || !this.hospitalName) {
      this.setMessage('Name, specialization, city, and hospital are required.', true);
      return;
    }

    if (!this.isAdmin()) {
      this.setMessage('Please login as admin first.', true);
      return;
    }

    const payload: CreateDoctorPayload = {
      name: this.doctorName,
      specialization: this.specialization,
      city: this.city,
      hospitalName: this.hospitalName,
      rating: this.rating || 0,
      experience: this.experience || 0,
      image: this.selectedImage
    };

    this.isSubmitting.set(true);
    const request = this.editingDoctorId
      ? this.doctorService.updateDoctor(this.editingDoctorId, payload)
      : this.doctorService.createDoctor(payload);

    request.subscribe({
      next: () => {
        this.setMessage(
          this.editingDoctorId ? 'Doctor updated successfully.' : 'Doctor added successfully.',
          false
        );
        this.isSubmitting.set(false);
        this.resetDoctorForm();
        this.loadDoctors();
      },
      error: (error) => {
        this.setMessage(this.errorMessage(error, 'Unable to save doctor.'), true);
        this.isSubmitting.set(false);
      }
    });
  }

  editDoctor(doctor: Doctor): void {
    this.editingDoctorId = doctor.id;
    this.doctorName = doctor.name || '';
    this.specialization = doctor.specialization || doctor.speciality || '';
    this.city = doctor.city || '';
    this.hospitalName = doctor.hospitalName || '';
    this.rating = doctor.rating || 0;
    this.experience = doctor.experience || 0;
    this.selectedImage = null;
    this.imageName = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteDoctor(doctor: Doctor): void {
    if (!doctor.id) {
      return;
    }

    const confirmed = window.confirm(`Delete ${doctor.name || 'this doctor'}?`);
    if (!confirmed) {
      return;
    }

    this.doctorService.deleteDoctor(doctor.id).subscribe({
      next: () => {
        this.setMessage('Doctor deleted successfully.', false);
        if (this.editingDoctorId === doctor.id) {
          this.resetDoctorForm();
        }
        this.loadDoctors();
      },
      error: (error) => {
        this.setMessage(this.errorMessage(error, 'Unable to delete doctor.'), true);
      }
    });
  }

  deleteUser(user: AppUser): void {
    const userId = user.userId ?? user.id;
    if (!userId) {
      return;
    }

    const confirmed = window.confirm(`Delete ${user.name || user.email || 'this user'}?`);
    if (!confirmed) {
      return;
    }

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.setMessage('User deleted successfully.', false);
        this.loadUsers();
      },
      error: (error) => {
        this.setMessage(this.errorMessage(error, 'Unable to delete user.'), true);
      }
    });
  }

  markPresent(appointment: Appointment): void {
    const appointmentId = appointment.appointmentId ?? appointment.id;
    if (!appointmentId) {
      return;
    }

    this.appointmentService.updateAppointmentStatus(appointmentId, appointment, 'Present').subscribe({
      next: () => {
        this.setMessage('Appointment marked present.', false);
        this.loadAppointments();
      },
      error: (error) => {
        this.setMessage(this.errorMessage(error, 'Unable to update appointment status.'), true);
      }
    });
  }

  markAbsent(appointment: Appointment): void {
    const appointmentId = appointment.appointmentId ?? appointment.id;
    if (!appointmentId) {
      return;
    }

    this.appointmentService.updateAppointmentStatus(appointmentId, appointment, 'Absent').subscribe({
      next: () => {
        this.setMessage('Appointment marked absent.', false);
        this.loadAppointments();
      },
      error: (error) => {
        this.setMessage(this.errorMessage(error, 'Unable to update appointment status.'), true);
      }
    });
  }

  deleteAppointment(appointment: Appointment): void {
    const appointmentId = appointment.appointmentId ?? appointment.id;
    if (!appointmentId) {
      return;
    }

    const confirmed = window.confirm('Delete this appointment?');
    if (!confirmed) {
      return;
    }

    this.appointmentService.deleteAppointment(appointmentId).subscribe({
      next: () => {
        this.setMessage('Appointment deleted successfully.', false);
        this.loadAppointments();
      },
      error: (error) => {
        this.setMessage(this.errorMessage(error, 'Unable to delete appointment.'), true);
      }
    });
  }

  cancelEdit(): void {
    this.resetDoctorForm();
  }

  userLabel(userId?: number): string {
    const user = this.users().find((item) => (item.userId ?? item.id) === userId);
    if (!user) {
      return userId ? `User #${userId}` : 'Unknown user';
    }

    return user.name || user.email || `User #${userId}`;
  }

  doctorLabel(appointment: Appointment): string {
    if (appointment.doctorName || appointment.doctor?.name || appointment.doctor?.doctorName) {
      return appointment.doctorName || appointment.doctor?.name || appointment.doctor?.doctorName || 'Doctor';
    }

    const doctor = this.doctors().find((item) => item.id === appointment.doctorId);
    return doctor?.name || 'Doctor';
  }

  appointmentDate(appointment: Appointment): string {
    return appointment.appointmentDate || appointment.date || '';
  }

  effectiveStatus(appointment: Appointment): string {
    return getEffectiveAppointmentStatus(appointment);
  }

  canMarkAbsent(appointment: Appointment): boolean {
    const status = getRawAppointmentStatus(appointment).toLowerCase();
    return status === 'booked' || status === 'present';
  }

  canMarkPresent(appointment: Appointment): boolean {
    const status = getRawAppointmentStatus(appointment).toLowerCase();
    return status === 'booked' || status === 'absent';
  }

  logout(): void {
    this.authService.logout();
    this.adminEmail = '';
    this.adminPassword = '';
    this.router.navigate(['/login']);
  }

  private resetDoctorForm(): void {
    this.editingDoctorId = null;
    this.doctorName = '';
    this.specialization = '';
    this.city = '';
    this.hospitalName = '';
    this.rating = 0;
    this.experience = 0;
    this.selectedImage = null;
    this.imageName = '';
  }

  private errorMessage(error: unknown, fallback: string): string {
    const anyError = error as { error?: { message?: string; title?: string } | string };
    return (
      (typeof anyError?.error === 'string' ? anyError.error : null) ||
      (typeof anyError?.error === 'object' ? anyError.error?.message || anyError.error?.title : null) ||
      fallback
    );
  }

  private setMessage(message: string, isError: boolean): void {
    this.message.set(message);
    this.isError.set(isError);
  }

  private formatDateKey(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
