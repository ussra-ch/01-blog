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

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, NavBar, PostCardComponent, SinglePost],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  @ViewChild('scrollTrigger') scrollTrigger!: ElementRef;

  private postService = inject(PostService);
  private router = inject(Router);

  posts = signal<Post[]>([]);
  loading = signal(false);
  selectedPost: Post | null = null;
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
        // console.log("response is :::::");
        // console.log(response);
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

  onCommentAdded(comment: any): void {
    console.log("commentsssss");
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
        error: err => {
          console.error("Delete failed:", err);
        }
      });

  }

  onCommentPost(postId: number) {
    console.log('Comment on post:', postId);
    // Navigate to post detail later
  }
}
