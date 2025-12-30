import { Suspense } from "react";
import { getComments } from "@/modules/comments/actions";
import { CommentTable } from "@/modules/comments/components";
import { Spinner } from "@/components/ui/spinner";

interface CommentsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function CommentsPage({ searchParams }: CommentsPageProps) {
  const params = await searchParams;

  const filters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 10,
  };

  const commentsData = await getComments(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Quản lý bình luận</h1>
        <p className="text-muted-foreground">
          Tổng cộng {commentsData.totalItems} bình luận
        </p>
      </div>

      {/* Table */}
      <Suspense fallback={<Spinner />}>
        <CommentTable data={commentsData} />
      </Suspense>
    </div>
  );
}
