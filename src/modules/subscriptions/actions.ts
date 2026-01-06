'use server';

import { api } from '@/lib/api-client';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';
import type {
  Subscription,
  SubscriptionFilters,
  SubscriptionStats,
} from './types';

export async function getSubscriptions(
  filters: SubscriptionFilters = {}
): Promise<PaginatedApiResponse<Subscription>> {
  try {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      status: filters.status,
      planId: filters.planId,
      search: filters.search,
    };

    const response = await api.get<PaginatedApiResponse<Subscription>>(
      '/admin/subscriptions',
      params
    );
    return response;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      path: '/v1/admin/subscriptions',
      data: [],
      totalItems: 0,
      totalPages: 0,
      itemsPerPage: 10,
      currentPage: 1,
    };
  }
}

export async function getSubscriptionById(
  id: string
): Promise<Subscription | null> {
  try {
    const response = await api.get<ApiResponse<Subscription>>(
      `/admin/subscriptions/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

export async function getSubscriptionStats(): Promise<SubscriptionStats | null> {
  try {
    const response = await api.get<ApiResponse<SubscriptionStats>>(
      '/admin/subscriptions/stats'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return null;
  }
}
