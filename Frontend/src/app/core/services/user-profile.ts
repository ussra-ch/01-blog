import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Post } from '../models/post';
import { SuggestedUser, UserProfile } from '../models/user';
import { MediaUrlService } from './media-url';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private http = inject(HttpClient);
  private mediaUrl = inject(MediaUrlService);
  private readonly usersUrl = 'http://localhost:8080/api/users';
  private readonly subscriptionsUrl = 'http://localhost:8080/api/subscriptions';
  currentAvatarUrl = signal<string | null>(null);

  getProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.usersUrl}/${userId}`, {
      withCredentials: true
    }).pipe(
      tap(profile => {
        if (profile.currentUser) {
          this.currentAvatarUrl.set(profile.avatarUrl);
        }
      })
    );
  }

  updateAvatar(avatar: File): Observable<UserProfile> {
    const data = new FormData();
    data.append('avatar', avatar);

    return this.http.put<UserProfile>(`${this.usersUrl}/me/avatar`, data, {
      withCredentials: true
    }).pipe(
      tap(profile => this.currentAvatarUrl.set(profile.avatarUrl))
    );
  }

  getAvatarUrl(avatarUrl: string | null): string | null {
    return this.mediaUrl.resolve(avatarUrl);
  }

  loadCurrentAvatar(userId: number): void {
    this.getProfile(userId).subscribe({
      error: () => {
        this.currentAvatarUrl.set(null);
      }
    });
  }

  getSuggestions(): Observable<SuggestedUser[]> {
    return this.http.get<SuggestedUser[]>(`${this.usersUrl}/suggestions`, {
      withCredentials: true
    });
  }

  getPosts(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.usersUrl}/${userId}/posts`, {
      withCredentials: true
    });
  }

  follow(userId: number): Observable<void> {
    return this.http.post<void>(`${this.subscriptionsUrl}/${userId}`, {}, {
      withCredentials: true
    });
  }

  unfollow(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.subscriptionsUrl}/${userId}`, {
      withCredentials: true
    });
  }

  reportProfile(userId: number, reason: string): Observable<void> {
    return this.http.post<void>('http://localhost:8080/api/reports', { userId, reason }, {
      withCredentials: true
    });
  }
}
