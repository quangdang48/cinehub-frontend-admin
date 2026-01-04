'use server';

import { auth } from '@/modules/auth/auth';
import { API_URL } from '@/config';
import {
  SendNotificationRequest,
  Notification,
  ConnectedClient,
} from './types';
import { PaginatedApiResponse } from '@/types/api';

// Backend response types for type safety
interface BackendClientsResponse {
  success: boolean;
  data: {
    count: number;
    clients: string[];
  };
}

interface BackendHistoryResponse {
  success: boolean;
  data:
    | Notification[]
    | {
        success: boolean;
        data: Notification[];
        meta: {
          total: number;
          page: number;
          limit: number;
        };
      };
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Type for sending notification to user via WebSocket (uses lowercase enum matching backend)
export type UserNotificationType = 'info' | 'success' | 'warning' | 'error';

export interface SendUserNotificationData {
  title: string;
  message: string;
  type: UserNotificationType;
}

export async function fetchConnectedClients(): Promise<{
  success: boolean;
  data: ConnectedClient[];
  message?: string;
}> {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(`${API_URL}/admin/notifications/clients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = (await response.json()) as BackendClientsResponse;

    // Transform backend response { count, clients: string[] } to ConnectedClient[]
    const clients: ConnectedClient[] = (result.data?.clients || []).map(
      (clientId: string) => ({
        clientId,
        // Backend only returns client IDs, no user info available
      })
    );

    return { success: true, data: clients };
  } catch (error) {
    console.error('Failed to fetch connected clients:', error);
    return {
      success: false,
      data: [],
      message: 'Failed to fetch connected clients',
    };
  }
}

export async function fetchNotificationHistory(
  page: number = 1,
  limit: number = 10,
  type?: string,
  targetUserId?: string,
  sort?: string
): Promise<
  PaginatedApiResponse<Notification> | { success: false; message: string }
> {
  try {
    const session = await auth();
    const token = session?.accessToken;

    console.log('=== DEBUG fetchNotificationHistory ===');
    console.log('Session:', session);
    console.log('Token exists:', !!token);
    console.log('API_URL:', API_URL);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (type) params.append('type', type);
    if (targetUserId) params.append('targetUserId', targetUserId);
    if (sort) params.append('sort', sort);

    const url = `${API_URL}/admin/notifications/history?${params.toString()}`;
    console.log('Fetching URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error data:', errorData);
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const result = (await response.json()) as BackendHistoryResponse;
    console.log('Result:', JSON.stringify(result, null, 2));

    // Handle nested response structure (backend wraps response twice)
    // Structure: { success, data: { success, data: [...], meta: {...} } }
    let actualData: Notification[] = [];
    let meta = { total: 0, page: 1, limit: 10 };

    if (Array.isArray(result.data)) {
      // Direct structure: { data: [...], meta: {...} }
      actualData = result.data;
      meta = result.meta || meta;
    } else if (
      result.data &&
      typeof result.data === 'object' &&
      'data' in result.data
    ) {
      // Nested structure: { data: { data: [...], meta: {...} } }
      actualData = result.data.data || [];
      meta = result.data.meta || meta;
    }

    const totalItems = meta.total || 0;
    const itemsPerPage = meta.limit || limit;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = meta.page || page;

    console.log(
      'Transformed - totalItems:',
      totalItems,
      'totalPages:',
      totalPages,
      'dataLength:',
      actualData.length
    );

    return {
      success: true,
      data: actualData,
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
    } as PaginatedApiResponse<Notification>;
  } catch (error) {
    console.error('=== ERROR fetchNotificationHistory ===');
    console.error('Failed to fetch notification history:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Failed to fetch notification history' };
  }
}

export async function sendNotification(data: SendNotificationRequest) {
  try {
    const session = await auth();
    const token = session?.accessToken;

    // If no clientId specified, use broadcast endpoint
    if (!data.clientId) {
      return broadcastNotification({
        title: data.title,
        message: data.message,
        type: data.type,
      });
    }

    // Send to specific client
    const url = `${API_URL}/admin/notifications/send/${data.clientId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        title: data.title,
        message: data.message,
        type: data.type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return { success: true, message: 'Gửi thông báo thành công' };
  } catch (error) {
    console.error('Failed to send notification:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Gửi thông báo thất bại' };
  }
}

/**
 * Broadcast notification to all users via WebSocket (for client users)
 */
export async function broadcastToAllUsers(
  data: Omit<SendNotificationRequest, 'userId' | 'clientId'>
) {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(
      `${API_URL}/admin/notifications/broadcast-to-all`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return { success: true, message: 'Broadcast đến tất cả users thành công' };
  } catch (error) {
    console.error('Failed to broadcast to all users:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Broadcast thất bại' };
  }
}

/**
 * Broadcast notification via SSE (for admin clients - internal use)
 */
export async function broadcastNotification(
  data: Omit<SendNotificationRequest, 'userId'>
) {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(`${API_URL}/admin/notifications/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return { success: true, message: 'Broadcast thành công' };
  } catch (error) {
    console.error('Failed to broadcast notification:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Broadcast thất bại' };
  }
}

// Types for user selection
export interface UserSelectItem {
  id: string;
  name: string;
  email: string;
}

interface BackendUsersResponse {
  success: boolean;
  data: UserSelectItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Fetch users list for notification targeting
 */
export async function fetchUsersForNotification(
  search?: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  data: UserSelectItem[];
  meta?: { total: number; page: number; limit: number };
  message?: string;
}> {
  try {
    const session = await auth();
    const token = session?.accessToken;
    console.log(
      '[fetchUsersForNotification] Token:',
      token ? 'present' : 'missing'
    );

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);

    const url = `${API_URL}/admin/notifications/users?${params.toString()}`;
    console.log('[fetchUsersForNotification] URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    console.log(
      '[fetchUsersForNotification] Response status:',
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[fetchUsersForNotification] Error response:', errorText);
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    console.log('[fetchUsersForNotification] Result:', result);

    // Handle nested response structure: result.data may contain {data: [], meta: {}}
    const usersData = Array.isArray(result.data)
      ? result.data
      : result.data?.data || [];
    const metaData = result.meta || result.data?.meta;

    return {
      success: true,
      data: usersData,
      meta: metaData,
    };
  } catch (error) {
    console.error('Failed to fetch users for notification:', error);
    return {
      success: false,
      data: [],
      message: 'Failed to fetch users',
    };
  }
}

/**
 * Send notification to a specific user via WebSocket
 */
export async function sendNotificationToUser(
  userId: string,
  data: SendUserNotificationData
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(
      `${API_URL}/admin/notifications/send-to-user/${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: data.title,
          message: data.message,
          type: data.type,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || 'Gửi thông báo đến user thành công',
    };
  } catch (error) {
    console.error('Failed to send notification to user:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Gửi thông báo đến user thất bại' };
  }
}

/**
 * Send notification to multiple users via WebSocket (group notification)
 */
export async function sendNotificationToUsers(
  userIds: string[],
  data: SendUserNotificationData
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(
      `${API_URL}/admin/notifications/send-to-users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userIds,
          title: data.title,
          message: data.message,
          type: data.type,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message:
        result.message ||
        `Gửi thông báo đến ${userIds.length} users thành công`,
    };
  } catch (error) {
    console.error('Failed to send notification to users:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Gửi thông báo đến nhóm users thất bại' };
  }
}
/**
 * Delete a notification from history
 */
export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(
      `${API_URL}/admin/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return {
      success: true,
      message: 'Đã xóa thông báo thành công',
    };
  } catch (error) {
    console.error('Failed to delete notification:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Xóa thông báo thất bại' };
  }
}
