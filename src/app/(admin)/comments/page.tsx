import { Suspense } from "react";
import { getComments } from "@/modules/comments/actions";
import { CommentsPageClient } from "./page-client";
import { Spinner } from "@/components/ui/spinner";

interface CommentsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function CommentsPage({ searchParams }: CommentsPageProps) {
  const params = await searchParams;

  const filters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 10,
    search: params.search,
    sort: params.sort,
  };

  const commentsData = await getComments(filters);

  return (
    <Suspense fallback={<Spinner />}>
      <CommentsPageClient data={commentsData} />
    </Suspense>
  );
}
