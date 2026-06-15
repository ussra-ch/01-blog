import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { NavBar } from '../../core/components/nav-bar/nav-bar';
import { Post } from '../../core/models/post';
import { UserProfile } from '../../core/models/user';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post';
import { UserProfileService } from '../../core/services/user-profile';
import { PostCardComponent } from '../posts/post-card/post-card';
import { SinglePost } from '../posts/single-post/single-post';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavBar, PostCardComponent, SinglePost],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileService = inject(UserProfileService);
  private postService = inject(PostService);
  private routeSubscription?: Subscription;

  profile = signal<UserProfile | null>(null);
  posts = signal<Post[]>([]);
  loading = signal(true);
  followLoading = signal(false);
  avatarUploading = signal(false);
  avatarError = signal('');
  avatarPreviewUrl = signal<string | null>(null);
  error = signal('');
  selectedPost: Post | null = null;

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const routeId = Number(params.get('id'));
      const userId = Number.isInteger(routeId) && routeId > 0
        ? routeId
        : this.authService.currentUserId;

      if (!userId) {
        this.error.set('Unable to find this profile.');
        this.loading.set(false);
        return;
      }

      this.loadProfile(userId);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.clearAvatarPreview();
  }

  get avatarUrl(): string | null {
    return this.avatarPreviewUrl() ?? this.profileService.getAvatarUrl(this.profile()?.avatarUrl ?? null);
  }

  get initial(): string {
    return this.profile()?.username.charAt(0).toUpperCase() ?? '?';
  }

  get memberSince(): string {
    const createdAt = this.profile()?.createdAt;
    return createdAt
      ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : '';
  }

  toggleFollow(): void {
    const profile = this.profile();
    if (!profile || profile.currentUser || this.followLoading()) return;

    this.followLoading.set(true);
    const request = profile.followedByCurrentUser
      ? this.profileService.unfollow(profile.id)
      : this.profileService.follow(profile.id);

    request.subscribe({
      next: () => {
        this.profile.update(current => current ? {
          ...current,
          followedByCurrentUser: !current.followedByCurrentUser,
          followerCount: Math.max(0, current.followerCount + (current.followedByCurrentUser ? -1 : 1))
        } : current);
        this.followLoading.set(false);
      },
      error: () => {
        this.followLoading.set(false);
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.avatarError.set('Choose a JPEG or PNG image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.avatarError.set('Choose an image smaller than 5 MB.');
      return;
    }

    this.clearAvatarPreview();
    this.avatarPreviewUrl.set(URL.createObjectURL(file));
    this.avatarError.set('');
    this.avatarUploading.set(true);

    this.profileService.updateAvatar(file).subscribe({
      next: profile => {
        this.profile.set(profile);
        this.posts.update(posts => posts.map(post => ({
          ...post,
          author: { ...post.author, profilePicture: profile.avatarUrl }
        })));
        this.clearAvatarPreview();
        this.avatarUploading.set(false);
      },
      error: () => {
        this.clearAvatarPreview();
        this.avatarError.set('The profile picture could not be updated.');
        this.avatarUploading.set(false);
      }
    });
  }

  onEditPost(post: Post): void {
    this.router.navigate(['/edit-post', post.postId], { state: { post } });
  }

  onDeletePost(post: Post): void {
    this.postService.deletePost(post.postId).subscribe({
      next: () => {
        this.posts.update(posts => posts.filter(item => item.postId !== post.postId));
        this.profile.update(profile => profile ? {
          ...profile,
          postCount: Math.max(0, profile.postCount - 1)
        } : profile);
      }
    });
  }

  private loadProfile(userId: number): void {
    this.loading.set(true);
    this.error.set('');
    this.profile.set(null);
    this.posts.set([]);

    forkJoin({
      profile: this.profileService.getProfile(userId),
      posts: this.profileService.getPosts(userId)
    }).subscribe({
      next: ({ profile, posts }) => {
        this.profile.set(profile);
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('This profile could not be loaded.');
        this.loading.set(false);
      }
    });
  }

  private clearAvatarPreview(): void {
    const previewUrl = this.avatarPreviewUrl();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      this.avatarPreviewUrl.set(null);
    }
  }
}
