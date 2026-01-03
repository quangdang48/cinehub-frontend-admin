'use server';

import { api } from '@/lib/api-client';
import type { ApiResponse, PaginatedApiResponse } from '@/types/api';
import type { Payment, PaymentFilters, PaymentStats } from './types';

export async function getPayments(
  filters: PaymentFilters = {}
): Promise<PaginatedApiResponse<Payment>> {
  try {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      status: filters.status,
      userId: filters.userId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };

    const response = await api.get<PaginatedApiResponse<Payment>>(
      '/admin/payments',
      params
    );
    return response;
  } catch (error) {
    console.error('Error fetching payments:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      path: '/v1/admin/payments',
      data: [],
      totalItems: 0,
      totalPages: 0,
      itemsPerPage: 10,
      currentPage: 1,
    };
  }
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  try {
    const response = await api.get<ApiResponse<Payment>>(
      `/admin/payments/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    return null;
  }
}

export async function getPaymentStats(): Promise<PaymentStats | null> {
  try {
    const response = await api.get<ApiResponse<PaymentStats>>(
      '/admin/payments/stats'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return null;
  }
}
