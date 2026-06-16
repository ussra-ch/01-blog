import { Post } from './post';

export interface SearchUser {
  id: number;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface SearchResponse {
  query: string;
  users: SearchUser[];
  posts: Post[];
}
