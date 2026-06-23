import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification';
import { UserProfileService } from '../../services/user-profile';
import { NotificationItem } from '../../models/notification';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private elementRef = inject(ElementRef<HTMLElement>);
  private notificationService = inject(NotificationService);
  private profileService = inject(UserProfileService);
  private router = inject(Router);

  currentAvatarUrl = this.profileService.currentAvatarUrl;
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  loggingOut = false;
  notificationsOpen = false;
  searchQuery = '';

  get isAdmin(): boolean {
    return this.authService.getUserFromStorage()?.role === 'ADMIN';
  }

  ngOnInit(): void {
    const userId = this.authService.currentUserId;
    if (userId && !this.currentAvatarUrl()) {
      this.profileService.loadCurrentAvatar(userId);
    }
    if (userId) {
      this.notificationService.loadNotifications();
      this.notificationService.connectStream();
    }
  }

  ngOnDestroy(): void {
    this.notificationService.disconnectStream();
  }

  get avatarUrl(): string | null {
    return this.profileService.getAvatarUrl(this.currentAvatarUrl());
  }

  logout(): void {
    if (this.loggingOut) return;

    this.loggingOut = true;
    this.authService.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout()
    });
  }

  submitSearch(): void {
    const query = this.searchQuery.trim();
    if (!query) return;

    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }

  @HostListener('document:click', ['$event'])
  closeNotificationsOnOutsideClick(event: MouseEvent): void {
    if (!this.notificationsOpen) {
      return;
    }

    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.notificationsOpen = false;
    }
  }

  markNotificationRead(notification: NotificationItem, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id);
  }

  markNotificationUnread(notification: NotificationItem, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsUnread(notification.id);
  }

  markAllNotificationsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  openNotification(notification: NotificationItem): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }

    this.notificationsOpen = false;
    if (notification.type === 'NEW_FOLLOW' && notification.actorId) {
      this.router.navigate(['/profile', notification.actorId]);
      return;
    }

    this.router.navigate(['/feed']);
  }

  openNotificationFromKeyboard(notification: NotificationItem, event: Event): void {
    event.preventDefault();
    this.openNotification(notification);
  }

  getNotificationAvatar(notification: NotificationItem): string {
    return this.profileService.getAvatarUrl(notification.actorAvatarUrl) || 'profile.png';
  }

  trackNotification(_: number, notification: NotificationItem): number {
    return notification.id;
  }

  private finishLogout(): void {
    this.notificationService.disconnectStream();
    this.profileService.currentAvatarUrl.set(null);
    this.router.navigate(['/login']);
  }
}
