import { Component, OnInit, inject, ViewChild, ElementRef, signal } from '@angular/core';
import { NavBar } from '../../../core/components/nav-bar/nav-bar';
import { PostCardComponent } from '../../posts/post-card/post-card';
import { PostService } from '../../../core/services/post';
import { Post } from '../../../core/models/post';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginatedResponse } from '../../../core/models/paginated-response';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, NavBar, PostCardComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  @ViewChild('scrollTrigger') scrollTrigger!: ElementRef;

  private postService = inject(PostService);

  posts = signal<Post[]>([]);
  loading = signal(false);
  private page = 0;
  private pageSize = 10;

  ngOnInit() {
    this.loadPosts();
    this.setupInfiniteScroll();
  }

  loadPosts() {
    this.loading.set(true);
    this.postService.getPosts(this.page, this.pageSize).subscribe({
      next: (response: Post[]) => {
        this.posts.update(prev => [...prev, ...response]);
        this.page++;
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load posts', err);
        this.loading.set(false);
      }
    });
  }

  private setupInfiniteScroll() {
    setTimeout(() => {
      if (this.scrollTrigger?.nativeElement) {
        const observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && !this.loading()) {
            this.loadPosts();
          }
        }, { threshold: 0.1 });

        observer.observe(this.scrollTrigger.nativeElement);
      }
    }, 100);
  }

  onEditPost(postId: number) {
    console.log('Edit post:', postId);
    // Navigate to edit page later
  }

  onDeletePost(postId: number) {
    this.posts.update(prev => prev.filter(p => p.id !== postId));
  }

  onCommentPost(postId: number) {
    console.log('Comment on post:', postId);
    // Navigate to post detail later
  }
}
