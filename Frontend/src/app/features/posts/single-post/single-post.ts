import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Post } from '../../../core/models/post';

export interface Comment {
  commentId: number;
  content: string;
  createdAt: string | Date;
  author: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}

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

  private http = inject(HttpClient);

  newComment = '';
  submitting = false;
  liked = false;
  localLikes = 0;

  ngOnInit() {
    this.localLikes = this.post.likeCount ?? 0;
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
    this.liked = !this.liked;
    this.localLikes += this.liked ? 1 : -1;
  }

  submitComment() {
    if (!this.newComment.trim() || this.submitting) return;
    this.submitting = true;

    // Replace with your actual API endpoint & auth headers
    this.http.post<Comment>(`/api/posts/${this.post.postId}/comments`, {
      content: this.newComment.trim()
    }).subscribe({
      next: (comment) => {
        // this.post.comments = [...(this.post.comments ?? []), comment];
        this.commentAdded.emit(comment);
        this.newComment = '';
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
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
}
