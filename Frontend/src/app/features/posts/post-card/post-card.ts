import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../core/models/post';
import { PostService } from '../../../core/services/post';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss'
})
export class PostCardComponent {
  @Input() post!: Post;
  @Output() edited = new EventEmitter<number>();
  @Output() deleted = new EventEmitter<number>();
  @Output() commented = new EventEmitter<number>();

  private  postService = inject(PostService);
  private authService = inject(AuthService);

  get isOwnPost(): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser ? currentUser.username === this.post.author.username : false;
  }

  isVideo(): boolean {
    return this.post.mediaUrl?.toLowerCase().includes('video') ||
           this.post.mediaUrl?.toLowerCase().endsWith('.mp4') ||
           false;
  }


  toggleLike() {
    console.log('Like functionality not implemented yet');
    // Will implement later
  }

  onEdit() {
    this.edited.emit(this.post.id);
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(this.post.id).subscribe({
        next: () => {
          this.deleted.emit(this.post.id);
        },
        error: (err) => {
          console.error('Failed to delete post', err);
        }
      });
    }
  }

  onComment() {
    console.log('Comment functionality not implemented yet');
    this.commented.emit(this.post.id);
  }
}
