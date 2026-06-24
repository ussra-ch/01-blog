import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MediaUrlService {
  private readonly apiOrigin = 'http://localhost:8080';

  resolve(path: string | null | undefined): string | null {
    if (!path) {
      return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return encodeURI(path);
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return encodeURI(`${this.apiOrigin}${normalizedPath}`);
  }
}
