import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../models/post';
import { PaginatedResponse } from '../models/paginated-response';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/posts/feed';
  private createPostRoute = 'http://localhost:8080/api/posts';

  getPosts(page: number, size: number): Observable<Post[]> {
    return this.http.get<Post[]>(
      `${this.apiUrl}?page=${page}&size=${size}`,
      {
        withCredentials: true
      }
    );
  }
  deletePost(id: number): Observable<void>{
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  createPost(data: FormData) {
    return this.http.post(this.createPostRoute, data, {
      withCredentials: true
    });
  }
}
