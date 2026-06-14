export interface Post {
  postId: number;
  title: string;
  description: string | null;
  mediaUrl: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  comments?: Comment[];
  likedByCurrentUser: boolean;
  author: Author;
}

export interface PostLikeResponse {
  postId: number;
  likeCount: number;
  likedByCurrentUser: boolean;
}

export interface PostDetails {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: number;
  username: string;
  profilePicture: string | null;
}

export interface Comment {
  commentId: number;
  postId: number;
  content: string;
  createdAt: string;
  author: Author;
}

export interface CreateCommentRequest {
  content: string;
}
