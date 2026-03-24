import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from './api.config';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface AppNotification {
  id: number;
  message: string;
  type: NotificationType;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrNotificationService {
  private connection: HubConnection | null = null;
  private readonly maxNotifications = 5;
  private nextId = 1;

  readonly notifications = signal<AppNotification[]>([]);
  readonly connectionStatus = signal<ConnectionStatus>('disconnected');

  async start(userId?: number, role?: string): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      return;
    }

    this.connectionStatus.set('connecting');
    this.connection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.onreconnected(() => this.connectionStatus.set('connected'));
    this.connection.onclose(() => this.connectionStatus.set('disconnected'));

    this.bindServerEvents(this.connection);

    try {
      await this.connection.start();
      this.connectionStatus.set('connected');

      if (userId) {
        await this.connection.invoke('RegisterUser', {
          userId,
          role: role || 'Patient'
        }).catch(() => undefined);
      }

      this.pushNotification('Connected to live notifications.', 'success');
    } catch {
      this.connectionStatus.set('disconnected');
      this.pushNotification('Live notifications are unavailable right now.', 'warning');
    }
  }

  async stop(): Promise<void> {
    if (!this.connection) {
      this.connectionStatus.set('disconnected');
      return;
    }

    try {
      await this.connection.stop();
    } finally {
      this.connectionStatus.set('disconnected');
      this.connection = null;
    }
  }

  pushNotification(message: string, type: NotificationType = 'info'): void {
    const item: AppNotification = {
      id: this.nextId++,
      message,
      type,
      timestamp: new Date()
    };

    const next = [item, ...this.notifications()].slice(0, this.maxNotifications);
    this.notifications.set(next);

    window.setTimeout(() => this.removeNotification(item.id), 7000);
  }

  removeNotification(id: number): void {
    this.notifications.set(this.notifications().filter((item) => item.id !== id));
  }

  private bindServerEvents(connection: HubConnection): void {
    connection.on('ReceiveNotification', (payload: unknown) => {
      this.pushFromPayload(payload);
    });

    connection.on('AppointmentBooked', (payload: unknown) => {
      this.pushFromPayload(payload, 'success');
    });

    connection.on('AppointmentCancelled', (payload: unknown) => {
      this.pushFromPayload(payload, 'warning');
    });

    connection.on('AppointmentReminder', (payload: unknown) => {
      this.pushFromPayload(payload, 'info');
    });
  }

  private pushFromPayload(payload: unknown, fallbackType: NotificationType = 'info'): void {
    if (typeof payload === 'string') {
      this.pushNotification(payload, fallbackType);
      return;
    }

    if (payload && typeof payload === 'object') {
      const body = payload as { message?: string; type?: NotificationType };
      this.pushNotification(body.message || 'New notification received.', body.type || fallbackType);
      return;
    }

    this.pushNotification('New notification received.', fallbackType);
  }
}

