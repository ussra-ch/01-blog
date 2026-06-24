import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { Post } from '../../../core/models/post';
import { PostService } from '../../../core/services/post';
import { RouterLink } from '@angular/router';
import { MediaUrlService } from '../../../core/services/media-url';


export interface UserSummary {
  id: number;
  username: string;
  profilePicture?: string | null;
}


@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.scss']
})
export class PostCardComponent {
  readonly VIDEO_THUMBNAIL = '/video.png';

  @Output() openPost = new EventEmitter<Post>();
  @Input() post!: Post;
  @Output() editPost = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<Post>();

  constructor(private router: Router) {}
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private mediaUrl = inject(MediaUrlService);
  voting = false;
  ownerMenuOpen = false;
  reporting = false;

  get formattedDate(): string {
    return new Date(this.post.createdAt).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get authorInitial(): string {
    return this.post.author?.username?.charAt(0)?.toUpperCase() ?? '?';
  }

  get isOwner(): boolean {
    const id = this.authService.currentUserId;
    // console.log("INSIDE isOwner ->", id);
    // console.log("AUTH SERVICE INSTANCE ->", this.authService);
    return id === this.post.author.id;
  }

  get upvotes(): number {
    return this.post.likeCount ?? 0;
  }

  toggleUpvote(event: MouseEvent): void {
    event.stopPropagation();
    if (this.voting) return;

    const previousLiked = this.post.likedByCurrentUser ?? false;
    const previousLikeCount = this.post.likeCount ?? 0;
    const nextLiked = !previousLiked;

    this.post.likedByCurrentUser = nextLiked;
    this.post.likeCount = Math.max(0, previousLikeCount + (nextLiked ? 1 : -1));
    this.voting = true;

    this.postService.toggleLike(this.post.postId).subscribe({
      next: (response) => {
        this.post.likeCount = response.likeCount;
        this.post.likedByCurrentUser = response.likedByCurrentUser;
        this.voting = false;
      },
      error: (err) => {
        console.error('Upvote failed:', err);
        this.post.likedByCurrentUser = previousLiked;
        this.post.likeCount = previousLikeCount;
        this.voting = false;
      }
    });
  }

  toggleOwnerMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.ownerMenuOpen = !this.ownerMenuOpen;
  }

  editOwnerPost(event: MouseEvent): void {
    event.stopPropagation();
    this.ownerMenuOpen = false;
    this.editPost.emit(this.post);
  }

  deleteOwnerPost(event: MouseEvent): void {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${this.post.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      this.ownerMenuOpen = false;
      this.deletePost.emit(this.post);
    }
  }

  reportPost(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isOwner || this.reporting) return;

    const reason = window.prompt(`Report "${this.post.title}"\n\nTell the admin team what is wrong with this post.`);
    const trimmedReason = reason?.trim();
    if (reason === null) return;
    if (!trimmedReason) {
      window.alert('Please include a reason before submitting a report.');
      return;
    }
    if (!window.confirm('Submit this post report to the admin moderation team?')) return;

    this.reporting = true;
    this.postService.reportPost(this.post.postId, trimmedReason).subscribe({
      next: () => {
        this.reporting = false;
        window.alert('Report submitted.');
      },
      error: (error) => {
        this.reporting = false;
        window.alert(error.status === 409
          ? 'You already reported this post.'
          : 'The report could not be submitted. Please try again.');
      }
    });
  }

  get comments(): number {
    return this.post.commentCount ?? 0;
  }

  get mediaSrc(): string | null {
    return this.mediaUrl.resolve(this.post.mediaUrl);
  }

  get authorAvatarSrc(): string | null {
    return this.mediaUrl.resolve(this.post.author.profilePicture);
  }

  get hasVideo(): boolean {
    return this.post.mediaType === 'VIDEO';
  }
}
