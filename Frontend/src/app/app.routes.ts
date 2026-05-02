import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
// import { FeedComponent } from './features/posts/feed/feed.component';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () => import('./features/posts/feed/feed.component').then(m => m.FeedComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
