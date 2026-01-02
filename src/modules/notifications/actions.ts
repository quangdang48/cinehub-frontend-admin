'use server';

import { auth } from '@/modules/auth/auth';
import { ADMIN_API_URL } from '@/config';
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
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export async function fetchConnectedClients(): Promise<{
  success: boolean;
  data: ConnectedClient[];
  message?: string;
}> {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(`${ADMIN_API_URL}/notifications/clients`, {
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
  targetUserId?: string
): Promise<
  PaginatedApiResponse<Notification> | { success: false; message: string }
> {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (type) params.append('type', type);
    if (targetUserId) params.append('targetUserId', targetUserId);

    const response = await fetch(
      `${ADMIN_API_URL}/notifications/history?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    const result = (await response.json()) as BackendHistoryResponse;

    // Transform backend response { data, meta: { total, page, limit } }
    // to PaginatedApiResponse { data, totalItems, totalPages, currentPage, itemsPerPage }
    const totalItems = result.meta?.total || 0;
    const itemsPerPage = result.meta?.limit || limit;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = result.meta?.page || page;

    return {
      success: true,
      data: result.data || [],
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
    } as PaginatedApiResponse<Notification>;
  } catch (error) {
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
    const url = `${ADMIN_API_URL}/notifications/send/${data.clientId}`;

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

export async function broadcastNotification(
  data: Omit<SendNotificationRequest, 'userId'>
) {
  try {
    const session = await auth();
    const token = session?.accessToken;

    const response = await fetch(`${ADMIN_API_URL}/notifications/broadcast`, {
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
