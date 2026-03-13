import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DoctorSearchComponent } from './components/doctor-search/doctor-search';
import { AppointmentComponent } from './components/appointment/appointment';
import { AppointmentListComponent } from './components/appointment-list/appointment-list';
import { AdminComponent } from './components/admin/admin';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'search', component: DoctorSearchComponent },
  { path: 'appointment', component: AppointmentComponent },
  { path: 'appointments', component: AppointmentListComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
