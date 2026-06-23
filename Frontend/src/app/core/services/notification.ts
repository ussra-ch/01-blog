import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { NotificationItem, UnreadCountResponse } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly apiUrl = 'http://localhost:8080/api/notifications';
  private eventSource: EventSource | null = null;

  notifications = signal<NotificationItem[]>([]);
  unreadCount = signal(0);

  loadNotifications(): void {
    this.http.get<NotificationItem[]>(this.apiUrl, { withCredentials: true })
      .subscribe(notifications => {
        this.notifications.set(notifications);
        this.unreadCount.set(notifications.filter(notification => !notification.read).length);
      });
  }

  connectStream(): void {
    if (!isPlatformBrowser(this.platformId) || this.eventSource) {
      return;
    }

    this.eventSource = new EventSource(`${this.apiUrl}/stream`, { withCredentials: true });

    this.eventSource.addEventListener('notification', event => {
      const notification = JSON.parse((event as MessageEvent).data) as NotificationItem;
      this.notifications.update(current => [
        notification,
        ...current.filter(item => item.id !== notification.id)
      ]);
      this.unreadCount.update(count => count + (notification.read ? 0 : 1));
    });

    this.eventSource.addEventListener('unread-count', event => {
      this.unreadCount.set(Number((event as MessageEvent).data));
    });

    this.eventSource.onerror = () => {
      this.disconnectStream();
      window.setTimeout(() => this.connectStream(), 5000);
    };
  }

  disconnectStream(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }

  markAsRead(notificationId: number): void {
    this.updateReadState(notificationId, true);
  }

  markAsUnread(notificationId: number): void {
    this.updateReadState(notificationId, false);
  }

  markAllAsRead(): void {
    this.http.patch<void>(`${this.apiUrl}/read-all`, {}, { withCredentials: true })
      .subscribe(() => {
        this.notifications.update(current =>
          current.map(notification => ({ ...notification, read: true }))
        );
        this.unreadCount.set(0);
      });
  }

  private updateReadState(notificationId: number, read: boolean): void {
    const action = read ? 'read' : 'unread';

    this.http.patch<NotificationItem>(
      `${this.apiUrl}/${notificationId}/${action}`,
      {},
      { withCredentials: true }
    ).subscribe(updated => {
      this.notifications.update(current =>
        current.map(notification =>
          notification.id === updated.id ? updated : notification
        )
      );
      this.unreadCount.set(this.notifications().filter(notification => !notification.read).length);
    });
  }
}
