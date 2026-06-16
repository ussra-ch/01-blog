import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from '../../services/user-profile';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(UserProfileService);
  private router = inject(Router);

  currentAvatarUrl = this.profileService.currentAvatarUrl;
  loggingOut = false;
  searchQuery = '';

  get isAdmin(): boolean {
    return this.authService.getUserFromStorage()?.role === 'ADMIN';
  }

  ngOnInit(): void {
    const userId = this.authService.currentUserId;
    if (userId && !this.currentAvatarUrl()) {
      this.profileService.loadCurrentAvatar(userId);
    }
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

  private finishLogout(): void {
    this.profileService.currentAvatarUrl.set(null);
    this.router.navigate(['/login']);
  }
}
