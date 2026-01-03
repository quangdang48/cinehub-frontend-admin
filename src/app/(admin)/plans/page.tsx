import { Suspense } from "react";
import { getPlans } from "@/modules/plans/actions";
import { PlansPageClient } from "./page-client";
import { Spinner } from "@/components/ui/spinner";

interface PlansPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
  }>;
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const params = await searchParams;

  const filters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 10,
    sort: params.sort,
  };

  const plansData = await getPlans(filters);

  return (
    <Suspense fallback={<Spinner />}>
      <PlansPageClient data={plansData} />
    </Suspense>
  );
}
