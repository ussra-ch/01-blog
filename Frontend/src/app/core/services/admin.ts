import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AdminPost, AdminReport, AdminUser } from '../models/admin';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/admin';

  getUsers() {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  setUserBanned(userId: number, banned: boolean) {
    return this.http.put<AdminUser>(`${this.apiUrl}/users/${userId}/ban?banned=${banned}`, {});
  }

  deleteUser(userId: number) {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  getPosts() {
    return this.http.get<AdminPost[]>(`${this.apiUrl}/posts`);
  }

  setPostHidden(postId: number, hidden: boolean) {
    return this.http.put<AdminPost>(`${this.apiUrl}/posts/${postId}/hide?hidden=${hidden}`, {});
  }

  deletePost(postId: number) {
    return this.http.delete<void>(`${this.apiUrl}/posts/${postId}`);
  }

  getReports() {
    return this.http.get<AdminReport[]>(`${this.apiUrl}/reports`);
  }

  deleteReport(reportId: number) {
    return this.http.delete<void>(`${this.apiUrl}/reports/${reportId}`);
  }
}
