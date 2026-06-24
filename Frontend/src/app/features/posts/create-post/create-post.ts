import { Component } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators, FormGroup} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../core/services/post';
import { Router } from '@angular/router';
import { NavBar } from '../../../core/components/nav-bar/nav-bar';
import { backendErrorMessage } from '../../../core/utils/backend-error';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavBar],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.scss']
})
export class CreatePostComponent {

  loading = false;
  selectedFile: File | null = null;
  errorMessage = '';
  postForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router
  ) {}

    ngOnInit(): void {
      this.postForm = this.fb.group({
        title: ['', [Validators.required, Validators.maxLength(150)]],
        content: ['', [Validators.required]]
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.loading || this.postForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const formData = new FormData();
    formData.append(
      'title',
      this.postForm.value.title!
    );
    formData.append(
      'description',
      this.postForm.value.content!
    );
    if (this.selectedFile) {
      formData.append('mediaFile', this.selectedFile);
    }
    // console.log("description:", this.postForm.value.content);

    this.postService.createPost(formData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/feed']);
      },

      error: (err: unknown) => {
        this.loading = false;
        this.errorMessage = backendErrorMessage(err, 'The post could not be published. Please try again.');
      }
    });
  }
}
