import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Doctor, DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-search.html',
  styleUrl: './doctor-search.css'
})
export class DoctorSearchComponent implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly router = inject(Router);

  allDoctors = signal<Doctor[]>([]);
  selectedCity = '';
  message = signal('');
  isLoading = signal(true);
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

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading.set(true);
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.allDoctors.set(doctors ?? []);
        this.message.set(doctors?.length ? '' : 'No doctors are available right now.');
        this.isLoading.set(false);
      },
      error: () => {
        this.message.set('Unable to load doctors at the moment.');
        this.isLoading.set(false);
      }
    });
  }

  bookAppointment(doctorId: number): void {
    localStorage.setItem('selectedDoctorId', doctorId.toString());
    if (this.selectedCity) {
      localStorage.setItem('selectedCity', this.selectedCity);
    }
    this.message.set(`Selected doctor #${doctorId}. Opening booking form...`);
    this.router.navigate(['/appointment'], {
      queryParams: { doctorId, city: this.selectedCity || null }
    });
  }

  doctorName(doctor: Doctor): string {
    return doctor.name || doctor.doctorName || 'Doctor';
  }

  specialization(doctor: Doctor): string {
    return doctor.specialization || doctor.speciality || 'General Practice';
  }

  onCityChange(): void {
    const filteredDoctors = this.doctors();
    this.message.set(
      filteredDoctors.length
        ? ''
        : `No doctors are available in ${this.selectedCity || 'the selected city'} right now.`
    );
  }
}
