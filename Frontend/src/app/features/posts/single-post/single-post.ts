import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment, Post } from '../../../core/models/post';
import { PostService } from '../../../core/services/post';
import { AuthService } from '../../../core/services/auth.service';
import { MediaUrlService } from '../../../core/services/media-url';

@Component({
  selector: 'app-single-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './single-post.html',
  styleUrls: ['.//single-post.scss']
})
export class SinglePost implements OnInit {
  readonly DEFAULT_COVER = 'assets/images/default-cover.png';
  @Input() post!: Post;
  @Output() closed = new EventEmitter<void>();
  @Output() commentAdded = new EventEmitter<Comment>();

  private postService = inject(PostService);
  private authService = inject(AuthService);
  private mediaUrl = inject(MediaUrlService);

  newComment = '';
  comments: Comment[] = [];
  loadingComments = false;
  submitting = false;
  liking = false;
  reporting = false;
  liked = false;
  localLikes = 0;

  ngOnInit() {
    this.localLikes = this.post.likeCount ?? 0;
    this.liked = this.post.likedByCurrentUser ?? false;
    this.comments = this.post.comments ?? [];
    this.loadComments();
    document.body.style.overflow = 'hidden';
  }

  close() {
    document.body.style.overflow = '';
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('post-detail-backdrop')) {
      this.close();
    }
  }

  toggleLike() {
    if (this.liking) return;

    const previousLiked = this.liked;
    const previousLikeCount = this.localLikes;
    const nextLiked = !previousLiked;

    this.liked = nextLiked;
    this.localLikes = Math.max(0, previousLikeCount + (nextLiked ? 1 : -1));
    this.post.likedByCurrentUser = nextLiked;
    this.post.likeCount = this.localLikes;
    this.liking = true;

    this.postService.toggleLike(this.post.postId).subscribe({
      next: (response) => {
        this.liked = response.likedByCurrentUser;
        this.localLikes = response.likeCount;
        this.post.likedByCurrentUser = response.likedByCurrentUser;
        this.post.likeCount = response.likeCount;
        this.liking = false;
      },
      error: () => {
        this.liked = previousLiked;
        this.localLikes = previousLikeCount;
        this.post.likedByCurrentUser = previousLiked;
        this.post.likeCount = previousLikeCount;
        this.liking = false;
      }
    });
  }

  reportPost(): void {
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

  submitComment() {
    const content = this.newComment.trim();
    if (!content || this.submitting) return;

    this.submitting = true;

    this.postService.addComment(this.post.postId, { content }).subscribe({
      next: (comment) => {
        this.comments = [...this.comments, comment];
        this.post.comments = this.comments;
        this.post.commentCount = (this.post.commentCount ?? 0) + 1;
        this.commentAdded.emit(comment);
        this.newComment = '';
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  private loadComments(): void {
    this.loadingComments = true;
    this.postService.getComments(this.post.postId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.post.comments = comments;
        this.post.commentCount = comments.length;
        this.loadingComments = false;
      },
      error: () => {
        this.loadingComments = false;
      }
    });
  }

  get authorInitial(): string {
    return this.post.author?.username?.charAt(0)?.toUpperCase() ?? '?';
  }

  commentInitial(comment: Comment): string {
    return comment.author?.username?.charAt(0)?.toUpperCase() ?? '?';
  }

  get formattedDate(): string {
    return new Date(this.post.createdAt).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  commentDate(date: string | Date): string {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  get readTime(): string {
    const words = (this.post.description ?? '').split(' ').length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  }

  get isOwner(): boolean {
    return this.authService.currentUserId === this.post.author.id;
  }

  get mediaSrc(): string | null {
    return this.mediaUrl.resolve(this.post.mediaUrl);
  }

  get authorAvatarSrc(): string | null {
    return this.mediaUrl.resolve(this.post.author.profilePicture);
  }

  commentAvatarSrc(comment: Comment): string | null {
    return this.mediaUrl.resolve(comment.author.profilePicture);
  }

  get hasVideo(): boolean {
    return this.post.mediaType === 'VIDEO';
  }
}
