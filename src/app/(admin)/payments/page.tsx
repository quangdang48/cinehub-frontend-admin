import { Suspense } from "react";
import { getPayments, getPaymentStats } from "@/modules/payments/actions";
import { PaymentsPageClient } from "./page-client";
import { Spinner } from "@/components/ui/spinner";

interface PaymentsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function PaymentsPage({
  searchParams,
}: PaymentsPageProps) {
  const params = await searchParams;

  const filters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 10,
    status: params.status as any,
    userId: params.userId,
    startDate: params.startDate,
    endDate: params.endDate,
  };

  const [paymentsData, stats] = await Promise.all([
    getPayments(filters),
    getPaymentStats(),
  ]);

  return (
    <Suspense fallback={<Spinner />}>
      <PaymentsPageClient data={paymentsData} stats={stats} />
    </Suspense>
  );
}
