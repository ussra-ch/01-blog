export interface UserProfile {
  id: number;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  followedByCurrentUser: boolean;
  currentUser: boolean;
}

export interface SuggestedUser {
  id: number;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  followerCount: number;
}
