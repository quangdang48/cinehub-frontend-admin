export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  planId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeSessionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  user?: User;
  plan?: Plan;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentStats {
  total: number;
  success: number;
  pending: number;
  failed: number;
  refunded: number;
  totalRevenue: number;
  byStatus: {
    status: PaymentStatus;
    count: number;
    amount: number;
  }[];
}

export interface PaginatedPayments {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Chờ xử lý',
  [PaymentStatus.SUCCESS]: 'Thành công',
  [PaymentStatus.FAILED]: 'Thất bại',
  [PaymentStatus.REFUNDED]: 'Hoàn tiền',
};

export const paymentStatusColors: Record<
  PaymentStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  [PaymentStatus.PENDING]: 'outline',
  [PaymentStatus.SUCCESS]: 'default',
  [PaymentStatus.FAILED]: 'destructive',
  [PaymentStatus.REFUNDED]: 'secondary',
};
