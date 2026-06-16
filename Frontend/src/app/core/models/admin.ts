export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  banned: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AdminPost {
  id: number;
  userId: number;
  author: string;
  title: string;
  description: string | null;
  mediaUrl: string | null;
  hidden: boolean;
  createdAt: string;
}

export interface AdminReport {
  id: number;
  reporterId: number;
  reporter: string;
  reportedUserId: number;
  reportedUser: string;
  reason: string;
  createdAt: string;
}
