import { Suspense } from "react";
import { getReviews } from "@/modules/reviews/actions";
import { ReviewsPageClient } from "./page-client";
import { Spinner } from "@/components/ui/spinner";

interface ReviewsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams;

  const filters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 10,
    search: params.search,
    sort: params.sort,
  };

  const reviewsData = await getReviews(filters);

  return (
    <Suspense fallback={<Spinner />}>
      <ReviewsPageClient data={reviewsData} />
    </Suspense>
  );
}
