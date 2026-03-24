import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SignalrNotificationService } from './services/signalr-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(SignalrNotificationService);
  readonly currentUser = this.authService.currentUser;
  readonly isLoggedIn = this.authService.isAuthenticated;
  readonly isAdmin = () => this.authService.isAdmin();
  readonly notifications = this.notificationService.notifications;
  readonly signalrStatus = this.notificationService.connectionStatus;

  constructor() {
    effect(() => {
      const user = this.currentUser();
      const isLoggedIn = this.isLoggedIn();

      if (isLoggedIn && user?.id) {
        this.notificationService.start(Number(user.id), user.role || 'Patient');
      } else {
        this.notificationService.stop();
      }
    });
  }

  get userName(): string {
    const user = this.currentUser();
    return user?.name || user?.email || '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  dismissNotification(id: number): void {
    this.notificationService.removeNotification(id);
  }
}
