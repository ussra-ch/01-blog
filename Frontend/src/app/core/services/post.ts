import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment, CreateCommentRequest, Post, PostDetails, PostLikeResponse } from '../models/post';
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

  getExplorePosts(page: number, size: number): Observable<Post[]> {
    return this.http.get<Post[]>(
      `${this.createPostRoute}/explore?page=${page}&size=${size}`,
      { withCredentials: true }
    );
  }

  deletePost(id: number): Observable<void>{
    console.log("Delete clicked:");
    return this.http.delete<void>(
      `${this.deletePostLink}/${id}`,
      { withCredentials: true }
    );
  }

  getPostById(id: number): Observable<PostDetails> {
    return this.http.get<PostDetails>(
      `${this.createPostRoute}/${id}`,
      { withCredentials: true }
    );
  }

  toggleLike(id: number): Observable<PostLikeResponse> {
    return this.http.post<PostLikeResponse>(
      `${this.createPostRoute}/${id}/like`,
      {},
      { withCredentials: true }
    );
  }

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.createPostRoute}/${postId}/comments`,
      { withCredentials: true }
    );
  }

  addComment(postId: number, request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.createPostRoute}/${postId}/comments`,
      request,
      { withCredentials: true }
    );
  }

  reportPost(postId: number, reason: string): Observable<void> {
    return this.http.post<void>(
      'http://localhost:8080/api/reports',
      { postId, reason },
      { withCredentials: true }
    );
  }

  createPost(data: FormData) {
    return this.http.post(this.createPostRoute, data, {
      withCredentials: true
    });
  }

  updatePost(id: number, data: FormData): Observable<PostDetails> {
    return this.http.put<PostDetails>(
      `${this.createPostRoute}/${id}`,
      data,
      { withCredentials: true }
    );
  }

}
