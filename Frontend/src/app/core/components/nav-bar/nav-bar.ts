import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from '../../services/user-profile';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(UserProfileService);
  private router = inject(Router);

  currentAvatarUrl = this.profileService.currentAvatarUrl;
  loggingOut = false;

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

  private finishLogout(): void {
    this.profileService.currentAvatarUrl.set(null);
    this.router.navigate(['/login']);
  }
}
