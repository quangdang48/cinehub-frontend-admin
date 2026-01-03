export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationTargetType = 'single' | 'group' | 'broadcast';

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

export interface TargetUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetType: NotificationTargetType;
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
  // New: supports multiple target users (for group notifications)
  targetUsers?: TargetUser[];
  // Legacy: single target user (kept for backward compatibility)
  targetUser?: TargetUser | null;
}
