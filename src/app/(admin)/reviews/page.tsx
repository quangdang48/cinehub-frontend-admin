import { Suspense } from "react";
import { getReviews } from "@/modules/reviews/actions";
import { ReviewTable } from "@/modules/reviews/components/review-table";
import { Spinner } from "@/components/ui/spinner";

interface ReviewsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams;

  const filters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 10,
  };

  const reviewsData = await getReviews(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        <p className="text-muted-foreground">
          Tổng cộng {reviewsData.totalItems} đánh giá
        </p>
      </div>

      {/* Table */}
      <Suspense fallback={<Spinner />}>
        <ReviewTable data={reviewsData} />
      </Suspense>
    </div>
  );
}
