export interface NotificationItem {
  id: number;
  type: string;
  message: string;
  read: boolean;
  relatedPostId: number | null;
  actorId: number | null;
  actorUsername: string | null;
  actorAvatarUrl: string | null;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}
