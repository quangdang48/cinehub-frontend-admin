'use server';

import { auth } from '@/modules/auth/auth';
import { ADMIN_API_URL } from '@/config';

// Types for dashboard data
export interface DashboardStats {
  totalUsers: number;
  totalFilms: number;
  totalSubscriptions: number;
  revenue: number;
  totalViews: number;
  newUsersToday: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  users: number;
}

export interface UsersByWeek {
  week: string;
  newUsers: number;
  activeUsers: number;
}

export interface SubscriptionDistribution {
  name: string;
  value: number;
  fill: string;
}

export interface ActivityByDay {
  day: string;
  subscriptions: number;
  films: number;
}

export interface TopCountry {
  country: string;
  count: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function fetchAdminApi<T>(endpoint: string): Promise<T | null> {
  try {
    const session = await auth();
    const response = await fetch(`${ADMIN_API_URL}/dashboard${endpoint}`, {
      headers: {
        Authorization: session?.accessToken
          ? `Bearer ${session.accessToken}`
          : '',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Dashboard API error: ${response.status}`);
      return null;
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await fetchAdminApi<DashboardStats>('/stats');
  return (
    data || {
      totalUsers: 0,
      totalFilms: 0,
      totalSubscriptions: 0,
      revenue: 0,
      totalViews: 0,
      newUsersToday: 0,
    }
  );
}

export async function getRevenueByMonth(): Promise<RevenueByMonth[]> {
  const data = await fetchAdminApi<RevenueByMonth[]>('/revenue-by-month');
  return data || [];
}

export async function getUsersByWeek(): Promise<UsersByWeek[]> {
  const data = await fetchAdminApi<UsersByWeek[]>('/users-by-week');
  return data || [];
}

export async function getSubscriptionDistribution(): Promise<
  SubscriptionDistribution[]
> {
  const data = await fetchAdminApi<SubscriptionDistribution[]>(
    '/subscription-distribution'
  );
  return data || [];
}

export async function getActivityByDay(): Promise<ActivityByDay[]> {
  const data = await fetchAdminApi<ActivityByDay[]>('/activity-by-day');
  return data || [];
}

export async function getTopCountries(): Promise<TopCountry[]> {
  const data = await fetchAdminApi<TopCountry[]>('/top-countries');
  return data || [];
}
