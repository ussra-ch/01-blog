import { Component, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-indigo-600 italic">01Blog</h1>

      <div class="space-x-4">
        <button *ngIf="isLoggedIn()" (click)="logout()" class="text-gray-600 hover:text-red-500">Logout</button>

        <button *ngIf="isAdmin()" class="bg-red-100 text-red-600 px-3 py-1 rounded">Admin Panel</button>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  isLoggedIn = computed(() => this.authService.currentUser() !== null);
  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
