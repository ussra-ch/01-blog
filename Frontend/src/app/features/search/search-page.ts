import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavBar } from '../../core/components/nav-bar/nav-bar';
import { Post } from '../../core/models/post';
import { SearchUser } from '../../core/models/search';
import { PostService } from '../../core/services/post';
import { SearchService } from '../../core/services/search';
import { UserProfileService } from '../../core/services/user-profile';
import { PostCardComponent } from '../posts/post-card/post-card';
import { SinglePost } from '../posts/single-post/single-post';
import { backendErrorMessage } from '../../core/utils/backend-error';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, RouterLink, NavBar, PostCardComponent, SinglePost],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss'
})
export class SearchPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private profileService = inject(UserProfileService);
  private postService = inject(PostService);
  private subscription?: Subscription;

  query = signal('');
  users = signal<SearchUser[]>([]);
  posts = signal<Post[]>([]);
  loading = signal(false);
  error = signal('');
  selectedPost: Post | null = null;

  ngOnInit(): void {
    this.subscription = this.route.queryParamMap.subscribe(params => {
      const query = (params.get('q') ?? '').trim();
      this.query.set(query);
      this.runSearch(query);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  avatarUrl(avatarUrl: string | null): string | null {
    return this.profileService.getAvatarUrl(avatarUrl);
  }

  initial(user: SearchUser): string {
    return user.username.charAt(0).toUpperCase();
  }

  onEditPost(post: Post): void {
    this.router.navigate(['/edit-post', post.postId], { state: { post } });
  }

  onDeletePost(post: Post): void {
    this.postService.deletePost(post.postId).subscribe({
      next: () => this.posts.update(posts => posts.filter(item => item.postId !== post.postId)),
      error: (err: unknown) => {
        this.error.set(backendErrorMessage(err, 'The post could not be deleted. Please try again.'));
      }
    });
  }

  private runSearch(query: string): void {
    this.users.set([]);
    this.posts.set([]);
    this.error.set('');

    if (query.length < 2) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.searchService.search(query).subscribe({
      next: response => {
        this.users.set(response.users);
        this.posts.set(response.posts);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(backendErrorMessage(err, 'Search could not be completed.'));
        this.loading.set(false);
      }
    });
  }
}
