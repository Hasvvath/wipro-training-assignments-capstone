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

  selectedCity = signal('');
  selectedSpecialization = signal('');
  selectedRating = signal('');

  message = signal('');
  isLoading = signal(true);



  readonly cities = computed(() =>
    [...new Set(
      this.allDoctors()
        .map((doctor) => doctor.city)
        .filter((city): city is string => !!city)
    )].sort()
  );

 

  readonly specializations = computed(() =>
    [...new Set(
      this.allDoctors()
        .map((doctor) => doctor.specialization || doctor.speciality)
        .filter((s): s is string => !!s)
    )].sort()
  );


  readonly doctors = computed(() => {
    const city = this.selectedCity().trim().toLowerCase();
    const spec = this.selectedSpecialization().trim().toLowerCase();
    const rating = Number(this.selectedRating() || 0);

    return this.allDoctors().filter((doctor) => {
      const cityMatch = !city || doctor.city?.trim().toLowerCase() === city;
      const specMatch = !spec || (doctor.specialization || doctor.speciality)?.trim().toLowerCase() === spec;
      const ratingMatch = !rating || (doctor.rating ?? 0) >= rating;

      return cityMatch && specMatch && ratingMatch;
    });
  });



  ngOnInit(): void {
    this.loadDoctors();
  }


  loadDoctors(): void {

    this.isLoading.set(true);

    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {

        this.allDoctors.set(doctors ?? []);

        this.message.set(
          doctors?.length ? '' : 'No doctors are available right now.'
        );

        this.isLoading.set(false);
      },

      error: () => {

        this.message.set('Unable to load doctors at the moment.');

        this.isLoading.set(false);
      }
    });
  }

 

  onCityChange(city: string): void {
    this.selectedCity.set(city);
    this.updateMessage();
  }

  onSpecializationChange(specialization: string): void {
    this.selectedSpecialization.set(specialization);
    this.updateMessage();
  }

  onRatingChange(rating: string): void {
    this.selectedRating.set(rating);
    this.updateMessage();
  }

  private updateMessage(): void {
    const filteredDoctors = this.doctors();
    this.message.set(filteredDoctors.length ? '' : 'No doctors match the selected filters.');
  }



  bookAppointment(doctorId: number): void {

    localStorage.setItem('selectedDoctorId', doctorId.toString());

    if (this.selectedCity()) {
      localStorage.setItem('selectedCity', this.selectedCity());
    }

    this.router.navigate(['/appointment'], {
      queryParams: {
        doctorId,
        city: this.selectedCity() || null
      }
    });
  }

 

  doctorName(doctor: Doctor): string {
    return doctor.name || doctor.doctorName || 'Doctor';
  }

  specialization(doctor: Doctor): string {
    return doctor.specialization || doctor.speciality || 'General Practice';
  }

}
