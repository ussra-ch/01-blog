import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NavBar } from '../../core/components/nav-bar/nav-bar';
import { Post, PostLikeResponse } from '../../core/models/post';
import { PostService } from '../../core/services/post';
import { SinglePost } from '../posts/single-post/single-post';

interface ExploreSection {
  cards: Post[];
  featured: Post | null;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterLink, NavBar, SinglePost],
  templateUrl: './explore.html',
  styleUrl: './explore.scss'
})
export class Explore implements OnInit {
  readonly DEFAULT_COVER = 'assets/images/default-cover.png';
  readonly VIDEO_THUMBNAIL = '/video.png';

  @ViewChild('scrollTrigger') scrollTrigger!: ElementRef;

  private postService = inject(PostService);
  private page = 0;
  private pageSize = 24;
  private reachedEnd = false;

  posts = signal<Post[]>([]);
  loading = signal(false);
  selectedPost: Post | null = null;
  likingPostIds = signal<number[]>([]);

  ngOnInit(): void {
    this.loadPosts();
    this.setupInfiniteScroll();
  }

  loadPosts(): void {
    if (this.loading() || this.reachedEnd) return;

    this.loading.set(true);
    this.postService.getExplorePosts(this.page, this.pageSize).subscribe({
      next: posts => {
        this.posts.update(current => [...current, ...posts]);
        this.reachedEnd = posts.length < this.pageSize;
        this.page++;
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load explore posts', err);
        this.loading.set(false);
      }
    });
  }

  openPost(post: Post): void {
    this.selectedPost = post;
  }

  toggleLike(event: MouseEvent, post: Post): void {
    event.stopPropagation();
    if (this.isLiking(post.postId)) return;

    const previousLiked = post.likedByCurrentUser ?? false;
    const previousLikeCount = post.likeCount ?? 0;
    const nextLiked = !previousLiked;

    post.likedByCurrentUser = nextLiked;
    post.likeCount = Math.max(0, previousLikeCount + (nextLiked ? 1 : -1));
    this.likingPostIds.update(ids => [...ids, post.postId]);

    this.postService.toggleLike(post.postId).subscribe({
      next: (response: PostLikeResponse) => {
        this.applyLikeResponse(response);
        this.likingPostIds.update(ids => ids.filter(id => id !== post.postId));
      },
      error: () => {
        post.likedByCurrentUser = previousLiked;
        post.likeCount = previousLikeCount;
        this.likingPostIds.update(ids => ids.filter(id => id !== post.postId));
      }
    });
  }

  isLiking(postId: number): boolean {
    return this.likingPostIds().includes(postId);
  }

  mediaUrl(post: Post): string | null {
    return post.mediaUrl ? `http://localhost:8080/${post.mediaUrl}` : null;
  }

  coverUrl(post: Post): string {
    if (post.mediaType === 'VIDEO') {
      return this.VIDEO_THUMBNAIL;
    }

    return this.mediaUrl(post) ?? this.DEFAULT_COVER;
  }

  avatarUrl(post: Post): string | null {
    return post.author.profilePicture ? `http://localhost:8080/${post.author.profilePicture}` : null;
  }

  authorInitial(post: Post): string {
    return post.author.username.charAt(0).toUpperCase();
  }

  exploreSections(): ExploreSection[] {
    const sections: ExploreSection[] = [];
    const allPosts = this.posts();

    for (let i = 0; i < allPosts.length; i += 5) {
      sections.push({
        cards: allPosts.slice(i, i + 4),
        featured: allPosts[i + 4] ?? null
      });
    }

    return sections;
  }

  onCommentAdded(): void {
    this.posts.update(posts => [...posts]);
  }

  private setupInfiniteScroll(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    setTimeout(() => {
      if (!this.scrollTrigger?.nativeElement) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !this.loading() && !this.reachedEnd) {
          this.loadPosts();
        }
      }, { rootMargin: '300px 0px', threshold: 0.1 });

      observer.observe(this.scrollTrigger.nativeElement);
    }, 100);
  }

  private applyLikeResponse(response: PostLikeResponse): void {
    this.posts.update(posts => posts.map(post => {
      if (post.postId !== response.postId) return post;
      return {
        ...post,
        likeCount: response.likeCount,
        likedByCurrentUser: response.likedByCurrentUser
      };
    }));

    if (this.selectedPost?.postId === response.postId) {
      this.selectedPost.likeCount = response.likeCount;
      this.selectedPost.likedByCurrentUser = response.likedByCurrentUser;
    }
  }
}
