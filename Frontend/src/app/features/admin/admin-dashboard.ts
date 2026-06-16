import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NavBar } from '../../core/components/nav-bar/nav-bar';
import { AdminPost, AdminReport, AdminUser } from '../../core/models/admin';
import { AdminService } from '../../core/services/admin';

type AdminTab = 'users' | 'posts' | 'reports';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NavBar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);

  activeTab = signal<AdminTab>('reports');
  users = signal<AdminUser[]>([]);
  posts = signal<AdminPost[]>([]);
  reports = signal<AdminReport[]>([]);
  loading = signal(true);
  error = signal('');
  busyKey = signal('');
  openReportCount = computed(() => this.reports().length);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set('');
    let completed = 0;
    const done = () => {
      completed++;
      if (completed === 3) this.loading.set(false);
    };
    const failed = () => {
      this.error.set('Some moderation data could not be loaded.');
      done();
    };

    this.adminService.getUsers().subscribe({ next: value => { this.users.set(value); done(); }, error: failed });
    this.adminService.getPosts().subscribe({ next: value => { this.posts.set(value); done(); }, error: failed });
    this.adminService.getReports().subscribe({ next: value => { this.reports.set(value); done(); }, error: failed });
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  toggleBan(user: AdminUser): void {
    const key = `user-${user.id}`;
    this.busyKey.set(key);
    this.adminService.setUserBanned(user.id, !user.banned).subscribe({
      next: updated => {
        this.users.update(users => users.map(item => item.id === updated.id ? updated : item));
        this.busyKey.set('');
      },
      error: () => this.actionFailed()
    });
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`Permanently delete @${user.username} and all their content?`)) return;
    this.busyKey.set(`user-${user.id}`);
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update(users => users.filter(item => item.id !== user.id));
        this.posts.update(posts => posts.filter(post => post.userId !== user.id));
        this.reports.update(reports => reports.filter(report =>
          report.reporterId !== user.id && report.reportedUserId !== user.id
        ));
        this.busyKey.set('');
      },
      error: () => this.actionFailed()
    });
  }

  toggleHide(post: AdminPost): void {
    this.busyKey.set(`post-${post.id}`);
    this.adminService.setPostHidden(post.id, !post.hidden).subscribe({
      next: updated => {
        this.posts.update(posts => posts.map(item => item.id === updated.id ? updated : item));
        this.busyKey.set('');
      },
      error: () => this.actionFailed()
    });
  }

  deletePost(post: AdminPost): void {
    if (!confirm(`Permanently remove "${post.title}"?`)) return;
    this.busyKey.set(`post-${post.id}`);
    this.adminService.deletePost(post.id).subscribe({
      next: () => {
        this.posts.update(posts => posts.filter(item => item.id !== post.id));
        this.busyKey.set('');
      },
      error: () => this.actionFailed()
    });
  }

  removeReport(report: AdminReport): void {
    this.busyKey.set(`report-${report.id}`);
    this.adminService.deleteReport(report.id).subscribe({
      next: () => {
        this.reports.update(reports => reports.filter(item => item.id !== report.id));
        this.busyKey.set('');
      },
      error: () => this.actionFailed()
    });
  }

  reportUser(report: AdminReport): AdminUser | undefined {
    return this.users().find(user => user.id === report.reportedUserId);
  }

  isBusy(key: string): boolean {
    return this.busyKey() === key;
  }

  private actionFailed(): void {
    this.error.set('That moderation action could not be completed.');
    this.busyKey.set('');
  }
}
