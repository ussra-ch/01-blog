import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchResponse } from '../models/search';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/search';

  search(query: string): Observable<SearchResponse> {
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchResponse>(this.apiUrl, {
      params,
      withCredentials: true
    });
  }
}
