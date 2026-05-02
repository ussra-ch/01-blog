import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { formatPercent } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm =
    this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      bio: ['', Validators.maxLength(250)]
    });
  }

  onFileSelected(event: any){
    this.selectedFile = event.target.files[0];
    console.log("EVENT IS ----------------: ", this.selectedFile)
  }

  onRegister() {
    // console.log("HEEEEEEEEEEEY")
    // console.log(this.registerForm.value)
    localStorage.clear();
    const formData = new FormData()
    formData.append("username", this.registerForm.get('username')?.value);
    formData.append("email", this.registerForm.get('email')?.value);
    formData.append("password", this.registerForm.get('password')?.value);
    formData.append("bio", this.registerForm.get('bio')?.value);
    if (this.selectedFile){
      const allowedFiles = ['image/jpeg', 'image/png'];
      if (allowedFiles.includes(this.selectedFile.type)){
          formData.append("avatar", this.selectedFile)
      }
    }

    if (formData) {
      // console.log(formData.sele)
      this.authService.register(formData).subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => console.error('Registration failed', err)
      });
    }
  }
}
