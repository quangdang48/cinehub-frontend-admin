export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface ConnectedClient {
  clientId: string;
  userId?: string;
  connectedAt?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
}

export interface SendNotificationRequest {
  clientId?: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetUserId?: string | null;
  senderId?: string | null;
  createdAt: string;
  metadata?: Record<string, any>;
  sender?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  } | null;
  targetUser?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  } | null;
}
