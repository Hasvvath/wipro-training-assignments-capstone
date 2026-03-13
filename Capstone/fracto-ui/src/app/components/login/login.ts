import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  message = signal('');
  isError = signal(false);
  isSubmitting = signal(false);
  messageClass = computed(() => (this.isError() ? 'status error' : 'status success'));

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.setMessage('Please enter both email and password.', true);
      return;
    }

    this.authService.logout();
    this.isSubmitting.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        const isSuccess = response.success ||
          !!response.token ||
          !!response.accessToken ||
          !!(response as typeof response & { jwt?: string; authorization?: string }).jwt ||
          !!(response as typeof response & { jwt?: string; authorization?: string }).authorization;

        const token =
          response.token ??
          response.accessToken ??
          (response as typeof response & { jwt?: string; authorization?: string }).jwt ??
          (response as typeof response & { jwt?: string; authorization?: string }).authorization;

        if (!isSuccess) {
          this.setMessage(response.message || 'Invalid login credentials.', true);
          this.isSubmitting.set(false);
          return;
        }

        this.setMessage(token ? 'Login successful. Redirecting to doctor search...' : 'Login successful.', false);
        this.isSubmitting.set(false);
        this.router.navigate([this.authService.isAdmin() ? '/admin' : '/search']);
      },
      error: (error) => {
        this.authService.logout();
        const apiMessage = error?.error?.message || error?.error?.title || 'Invalid login credentials.';
        this.setMessage(apiMessage, true);
        this.isSubmitting.set(false);
      }
    });
  }

  private setMessage(message: string, isError: boolean): void {
    this.message.set(message);
    this.isError.set(isError);
  }
}
