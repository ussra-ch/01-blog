import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { inject } from '@angular/core';
import { Post } from '../../../core/models/post';


export interface UserSummary {
  id: number;
  username: string;
  profilePicture?: string | null;
}


@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.scss']
})
export class PostCardComponent {
  @Output() openPost = new EventEmitter<Post>();
  @Input() post!: Post;
  @Output() editPost = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<Post>();

  constructor(private router: Router) {}
  private authService = inject(AuthService);

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

  upvotes = 0;
  comments = 0;
}
