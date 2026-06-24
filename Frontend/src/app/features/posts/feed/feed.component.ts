import { Component, OnInit, inject, ViewChild, ElementRef, signal } from '@angular/core';
import { NavBar } from '../../../core/components/nav-bar/nav-bar';
import { PostCardComponent } from '../../posts/post-card/post-card';
import { PostService } from '../../../core/services/post';
import { Post } from '../../../core/models/post';
import { SinglePost} from '../single-post/single-post'
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginatedResponse } from '../../../core/models/paginated-response';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { SuggestedUser } from '../../../core/models/user';
import { UserProfileService } from '../../../core/services/user-profile';
import { backendErrorMessage } from '../../../core/utils/backend-error';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, NavBar, PostCardComponent, SinglePost],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  @ViewChild('scrollTrigger') scrollTrigger!: ElementRef;

  private postService = inject(PostService);
  private profileService = inject(UserProfileService);
  private router = inject(Router);

  posts = signal<Post[]>([]);
  suggestions = signal<SuggestedUser[]>([]);
  loading = signal(false);
  error = signal('');
  suggestionsLoading = signal(false);
  followingUserIds = signal<number[]>([]);
  selectedPost: Post | null = null;
  private page = 0;
  private pageSize = 10;
  private reachedEnd = false;

  ngOnInit() {
    this.loadPosts();
    this.loadSuggestions();
    this.setupInfiniteScroll();
  }

  loadSuggestions(): void {
    this.suggestionsLoading.set(true);
    this.profileService.getSuggestions().subscribe({
      next: suggestions => {
        this.suggestions.set(suggestions);
        this.suggestionsLoading.set(false);
      },
      error: () => {
        this.suggestionsLoading.set(false);
      }
    });
  }

  followSuggestedUser(userId: number): void {
    if (this.followingUserIds().includes(userId)) return;

    this.followingUserIds.update(ids => [...ids, userId]);
    this.profileService.follow(userId).subscribe({
      next: () => {
        this.suggestions.update(users => users.filter(user => user.id !== userId));
        this.followingUserIds.update(ids => ids.filter(id => id !== userId));
      },
      error: () => {
        this.followingUserIds.update(ids => ids.filter(id => id !== userId));
      }
    });
  }

  isFollowingSuggestion(userId: number): boolean {
    return this.followingUserIds().includes(userId);
  }

  suggestionAvatar(avatarUrl: string | null): string | null {
    return this.profileService.getAvatarUrl(avatarUrl);
  }

  loadPosts() {
    if (this.loading() || this.reachedEnd) return;

    this.loading.set(true);
    this.error.set('');
    this.postService.getPosts(this.page, this.pageSize).subscribe({
      next: (response: Post[]) => {
        this.posts.update(prev => [...prev, ...response]);
        this.reachedEnd = response.length < this.pageSize;
        this.page++;
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(backendErrorMessage(err, 'Posts could not be loaded.'));
        this.loading.set(false);
      }
    });
  }

  onCommentAdded(comment: any): void {
    console.log("commentsssss");
  }
  private setupInfiniteScroll() {
    setTimeout(() => {
      if (this.scrollTrigger?.nativeElement) {
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && !this.loading() && !this.reachedEnd) {
            this.loadPosts();
          }
        }, { threshold: 0.1 });

        observer.observe(this.scrollTrigger.nativeElement);
      }
    }, 100);
  }

  onEditPost(post: Post) {
    this.router.navigate(['/edit-post', post.postId], {
      state: { post }
    });
  }

  onDeletePost(post: Post): void {
    this.postService.deletePost(post.postId).subscribe({
        next: () => {
          this.posts.update(prev =>
            prev.filter(p => p.postId !== post.postId)
          );
        },
        error: (err: unknown) => {
          this.error.set(backendErrorMessage(err, 'The post could not be deleted. Please try again.'));
        }
      });

  }

  onCommentPost(postId: number) {
    console.log('Comment on post:', postId);
    // Navigate to post detail later
  }
}
