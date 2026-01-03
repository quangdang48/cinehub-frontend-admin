import { Suspense } from "react";
import { getSubscriptions, getSubscriptionStats } from "@/modules/subscriptions/actions";
import { SubscriptionsPageClient } from "./page-client";
import { Spinner } from "@/components/ui/spinner";

interface SubscriptionsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    planId?: string;
    search?: string;
  }>;
}

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  const params = await searchParams;

  const filters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 10,
    status: params.status as any,
    planId: params.planId,
    search: params.search,
  };

  const [subscriptionsData, stats] = await Promise.all([
    getSubscriptions(filters),
    getSubscriptionStats(),
  ]);

  return (
    <Suspense fallback={<Spinner />}>
      <SubscriptionsPageClient data={subscriptionsData} stats={stats} />
    </Suspense>
  );
}
