import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from '../models/auth-response';
import { tap, catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/auth';

  // constructor {}

  // State management using Signals
  currentUser = signal<AuthResponse | null>(this.getUserFromStorage());

  /**
   * Check if a user is currently authenticated
   * Used by AuthGuard
   */
  isLoggedIn() {
      console.log("isLoggedIn started");
      return this.http.get(
        `${this.API_URL}/me`,
        { withCredentials: true }
      ).pipe(
        tap(() => console.log("me success")),
        catchError(err => {
        console.log("me error", err);
        return throwError(() => err);
      })
      )

    }

  login(credentials: any) {
    return this.http.post<AuthResponse>(
      `${this.API_URL}/login`,
      credentials,
      { withCredentials: true }
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    this.currentUser.set(null);
  }

  register(userData: any) {
    // console.log("hnaaaaa 1:")
    // console.log(userData)
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  private getUserFromStorage(): AuthResponse | null {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('user_data');
      return data ? JSON.parse(data) : null;
    }
    return null;
  }
}
