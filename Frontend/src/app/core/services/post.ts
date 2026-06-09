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
  private deletePostLink = 'http://localhost:8080/api/posts';

  // constructor(private http: HttpClient) {}

  getPosts(page: number, size: number): Observable<Post[]> {
    return this.http.get<Post[]>(
      `${this.apiUrl}?page=${page}&size=${size}`,
      {
        withCredentials: true
      }
    );
  }

  deletePost(id: number): Observable<void>{
    console.log("Delete clicked:");
    return this.http.delete<void>(
      `${this.deletePostLink}/${id}`,
      { withCredentials: true }
    );
  }

  createPost(data: FormData) {
    return this.http.post(this.createPostRoute, data, {
      withCredentials: true
    });
  }

  updatePost(id: number, content: string): Observable<Post> {
    return this.http.put<Post>(
      `${this.apiUrl}/${id}`,
      { content },
      { withCredentials: true }
    );
  }

}
