export interface Post {
  id: number;
  title: string;
  description: string | null;
  mediaUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  // likedByCurrentUser: boolean;
  author: Author;
}

export interface Author {
  id: number;
  username: string;
  profilePicture: string | null;
}
