import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  message = signal('');
  isError = signal(false);
  isSubmitting = signal(false);
  messageClass = computed(() => (this.isError() ? 'status error' : 'status success'));

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) {
      this.setMessage('Please complete all registration fields.', true);
      return;
    }

    this.isSubmitting.set(true);
    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.setMessage('Registration successful. You can now log in.', false);
        this.isSubmitting.set(false);
        this.name = '';
        this.email = '';
        this.password = '';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (error) => {
        const apiMessage =
          error?.error?.message ||
          error?.error?.title ||
          (typeof error?.error === 'string' ? this.formatError(error.error) : null) ||
          'Registration failed. Please try again.';
        this.setMessage(apiMessage, true);
        this.isSubmitting.set(false);
      }
    });
  }

  private formatError(errorText: string): string {
    if (!errorText) {
      return 'Registration failed. Please try again.';
    }

    const trimmed = errorText.trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      const postMatch = trimmed.match(/Cannot\s+POST\s+([^<\n]+)/i);
      if (postMatch) {
        return `Backend route not found: ${postMatch[1]}. Check Angular proxy and ASP.NET API startup.`;
      }

      return 'Backend returned an HTML error page. Check Angular proxy and backend startup.';
    }

    return trimmed;
  }

  private setMessage(message: string, isError: boolean): void {
    this.message.set(message);
    this.isError.set(isError);
  }
}
