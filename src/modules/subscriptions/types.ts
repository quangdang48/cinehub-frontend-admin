import type { Plan } from '../plans/types';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PENDING = 'PENDING',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  autoRenew: boolean;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  plan?: Plan;
}

export interface SubscriptionFilters {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  planId?: string;
  search?: string;
}

export interface SubscriptionStats {
  totalActive: number;
  totalCancelled: number;
  totalExpired: number;
  totalPending: number;
  byPlan: {
    planId: string;
    planName: string;
    count: number;
  }[];
}

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'Đang hoạt động',
  [SubscriptionStatus.CANCELLED]: 'Đã hủy',
  [SubscriptionStatus.EXPIRED]: 'Hết hạn',
  [SubscriptionStatus.PENDING]: 'Chờ xử lý',
};

export const subscriptionStatusColors: Record<
  SubscriptionStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [SubscriptionStatus.ACTIVE]: 'default',
  [SubscriptionStatus.CANCELLED]: 'destructive',
  [SubscriptionStatus.EXPIRED]: 'secondary',
  [SubscriptionStatus.PENDING]: 'outline',
};
