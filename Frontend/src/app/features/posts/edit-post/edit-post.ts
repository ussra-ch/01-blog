import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavBar } from '../../../core/components/nav-bar/nav-bar';
import { PostService } from '../../../core/services/post';
import { Post, PostDetails } from '../../../core/models/post';
import { timeout } from 'rxjs';
import { MediaUrlService } from '../../../core/services/media-url';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavBar],
  templateUrl: './edit-post.html',
  styleUrls: ['../create-post/create-post.scss', './edit-post.scss'],
})
export class EditPost implements OnInit {
  postForm!: FormGroup;
  loading = false;
  loadingPost = true;
  selectedFile: File | null = null;
  currentMediaUrl: string | null = null;
  removeMedia = false;
  loadError = '';
  postId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private mediaUrl: MediaUrlService
  ) {}

  ngOnInit(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      content: ['', [Validators.required]]
    });

    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.postId) {
      this.router.navigate(['/feed']);
      return;
    }

    const navigationPost = history.state?.post as Post | undefined;
    if (navigationPost?.postId === this.postId) {
      this.prefillFromFeedPost(navigationPost);
      this.loadingPost = false;
    }

    this.loadPost();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.removeMedia = false;
    }
  }

  removeCurrentMedia(): void {
    this.currentMediaUrl = null;
    this.selectedFile = null;
    this.removeMedia = true;
  }

  onSubmit(): void {
    if (this.postForm.invalid || this.loading) return;

    this.loading = true;
    const formData = new FormData();
    formData.append('title', this.postForm.value.title);
    formData.append('description', this.postForm.value.content);

    if (this.selectedFile) {
      formData.append('mediaFile', this.selectedFile);
    }
    formData.append('removeMedia', String(this.removeMedia));

    this.postService.updatePost(this.postId, formData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Update post failed:', err);
      }
    });
  }

  get currentMediaSrc(): string | null {
    return this.mediaUrl.resolve(this.currentMediaUrl);
  }

  private loadPost(): void {
    this.loadError = '';
    this.loadingPost = !this.postForm.value.title;

    this.postService.getPostById(this.postId).pipe(
      timeout(10000)
    ).subscribe({
      next: (post) => {
        this.prefillFromPostDetails(post);
        this.loadingPost = false;
      },
      error: (err) => {
        console.error('Load post failed:', err);
        this.loadError = 'Could not load the latest post data. You can go back to the feed and try again.';
        this.loadingPost = false;
      }
    });
  }

  private prefillFromFeedPost(post: Post): void {
    this.postForm.patchValue({
      title: post.title,
      content: post.description ?? ''
    });
    this.currentMediaUrl = post.mediaUrl;
  }

  private prefillFromPostDetails(post: PostDetails): void {
    this.postForm.patchValue({
      title: post.title,
      content: post.description ?? ''
    });
    this.currentMediaUrl = post.mediaUrl;
  }
}
