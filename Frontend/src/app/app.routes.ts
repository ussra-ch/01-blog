import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
// import { FeedComponent } from './features/posts/feed/feed.component';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import {CreatePostComponent} from './features/posts/create-post/create-post';
import { EditPost } from './features/posts/edit-post/edit-post';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent },

  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () => import('./features/posts/feed/feed.component').then(m => m.FeedComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'create-post',
    component: CreatePostComponent,
    canActivate: [authGuard]
  },
  {
    path: 'edit-post/:id',
    component: EditPost,
    canActivate: [authGuard]
  }
];
